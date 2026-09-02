import { sql } from "./config/db.js";

// Socket.IO Room State: roomId -> Map<socketId, participantObject>
const rooms = new Map();

export function setupSocketIO(io){
    io.on("connection", (socket)=>{
        let currentRoomId = null;
        let currentUser = null;

        // User joins a meeting room
        socket.on("join-room", async ({roomId, user, audioEnabled = true, videoEnabled = true}) => {
            try {
                // Verify meeting status from DB
                const meetings = await sql`SELECT * FROM meetings WHERE meeting_id = ${roomId}`;

                if (meetings.length === 0){
                    socket.emit("meeting-ended", {message: "Meeting not found."})
                    return;
                }
                const meeting = meetings[0];

                if (meeting.status === "ended"){
                    socket.emit("meeting-ended", {message: "This meeting has already ended."})
                    return;
                }

                currentRoomId = roomId;
                const isHost = meeting.host_id && user?.id && meeting.host_id.toString() === user.id.toString();

                currentUser = {
                    socketId: socket.id,
                    userId: user?.id,
                    userName: user?.name || "Anonymous",
                    isHost,
                    audioEnabled,
                    videoEnabled,
                }

                if(!rooms.has(roomId)){
                    rooms.set(roomId, new Map())
                }

                const roomParticipants = rooms.get(roomId);

                // Fetch host plan to enforce participant limits (10 for Free, 100 for Premium)
                const hosts = await sql`SELECT plan FROM users WHERE id = ${meeting.host_id}`;

                const hostPlan = hosts[0]?.plan || "free";
                const maxParticipants = hostPlan === "premium" ? 100 : 10;

                if (roomParticipants.size >= maxParticipants){
                    socket.emit("meeting-ended", {
                        message: `Meeting capacity limit reached (max ${maxParticipants} participants for ${hostPlan.toUpperCase()} plan). Host must upgrade to Premium for up to 100 participants!`,
                    })
                    return;
                }
                socket.join(roomId)

                // Get existing participants in the room
                const existingUsers = Array.from(roomParticipants.values());

                // Add new participant to socket state
                roomParticipants.set(socket.id, currentUser);

                // ==========================================
                // FIX: Prevent Foreign Key Database Errors
                // ==========================================
                const userId = user?.id || null;
                let dbUserId = null;

                // 1. Check if the user actually exists in our local database
                if (userId) {
                    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
                    if (userCheck.length > 0) {
                        dbUserId = userId; // User exists, safe to use their ID
                    }
                }

                // 2. Use dbUserId instead of userId for the queries
                const existingParticipants = await sql`
                    SELECT id FROM meeting_participants
                    WHERE meeting_id = ${meeting.id}
                    AND ((${dbUserId}::text IS NOT NULL AND user_id = ${dbUserId}) OR name = ${currentUser.userName})`;

                if(existingParticipants.length === 0){
                    await sql`
                        INSERT INTO meeting_participants (meeting_id, user_id, name, joined_at)
                        VALUES (${meeting.id}, ${dbUserId}, ${currentUser.userName}, NOW())
                    `;
                }
                // ==========================================

                // Send list of existing users to the newcomer
                socket.emit("all-users", existingUsers);

                // Notify everyone else in the room
                socket.to(roomId).emit("user-joined", currentUser);

            } catch (err) {
                console.error("Error joining room in socket:", err);
                socket.emit("meeting-ended", { message: "Failed to join room." });
            }
        });

        // WebRTC Signaling: Offer
        socket.on('offer', ({targetSocketId, callerSocketId, sdp})=>{
            io.to(targetSocketId).emit("offer", {
                callerSocketId,
                sdp,
                callerUser: currentUser,
            });
        });

        // WebRTC Signaling: Answer
        socket.on('answer', ({targetSocketId, responderSocketId, sdp})=>{
            io.to(targetSocketId).emit("answer", {
                responderSocketId,
                sdp,
            });
        });

        // WebRTC Signaling: ICE Candidate
        socket.on('ice-candidate', ({ targetSocketId, senderSocketId, candidate })=>{
            io.to(targetSocketId).emit("ice-candidate", {
                senderSocketId,
                candidate,
            });
        });

        // Audio toggle event
        socket.on('toggle-audio', ({ roomId, audioEnabled })=>{
            if(rooms.has(roomId) && rooms.get(roomId).has(socket.id)){
                rooms.get(roomId).get(socket.id).audioEnabled = audioEnabled;
            }
            socket.to(roomId).emit('user-toggled-audio', {
                socketId: socket.id,
                audioEnabled,
            });
        });

        // Video toggle event
        socket.on('toggle-video', ({ roomId, videoEnabled })=>{
            if(rooms.has(roomId) && rooms.get(roomId).has(socket.id)){
                rooms.get(roomId).get(socket.id).videoEnabled = videoEnabled;
            }
            socket.to(roomId).emit('user-toggled-video', {
                socketId: socket.id,
                videoEnabled,
            });
        });

        // Chat message event -> persist to DB & broadcast
        socket.on("send-message", async ({roomId, message}) => {
            try {
                const meetings = await sql`SELECT id, status FROM meetings WHERE meeting_id = ${roomId}`;

                if(meetings.length > 0 && meetings[0].status !== "ended"){
                    const meetingId = meetings[0].id;
                    
                    // Apply similar dbUserId check for messages to prevent foreign key errors
                    let dbSenderId = null;
                    if (message.senderId) {
                         const userCheck = await sql`SELECT id FROM users WHERE id = ${message.senderId}`;
                         if (userCheck.length > 0) dbSenderId = message.senderId;
                    }

                    await sql`
                    INSERT INTO meeting_messages (meeting_id, sender_id, sender_name, text, timestamp)
                    VALUES (${meetingId}, ${dbSenderId}, ${message.senderName || "Anonymous"}, ${message.text}, NOW())`;

                    io.in(roomId).emit("receive-message", {
                        ...message,
                        senderSocketId: socket.id,
                    })
                }
            } catch (error) {
                console.error("Error saving chat message to DB:", error);
            }
        });

        // Host explicitly ends meeting for all via End Meeting button
        socket.on('end-meeting', async ({roomId})=>{
            try {
                await sql`
                UPDATE meetings
                SET status = 'ended', ended_at = NOW()
                WHERE meeting_id = ${roomId}`;

                io.in(roomId).emit("meeting-ended", { message: "The meeting has been ended by the host." });
                rooms.delete(roomId);
            } catch (err) {
                console.error("Error ending meeting:", err);
            }
        });

        // Handle Disconnect (Reloading window, network drop, or closing tab)
        socket.on('disconnect', ()=>{
            if (currentRoomId && rooms.has(currentRoomId)){
                const roomParticipants = rooms.get(currentRoomId);
                roomParticipants.delete(socket.id);

                if (roomParticipants.size === 0){
                    rooms.delete(currentRoomId);
                } else {
                    // Notify remaining peers that a user disconnected
                    socket.to(currentRoomId).emit("user-left", {
                        socketId: socket.id,
                        user: currentUser,
                    });
                }
            }
        });

    });
}