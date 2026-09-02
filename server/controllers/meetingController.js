import { sql } from "../config/db.js";

const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len) => Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
}

// create meeting
export const createMeeting = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;

        // Fetch user details & plan
        const users = await sql`SELECT name, plan FROM users WHERE id = ${userId}`;
        const userPlan = users[0]?.plan || "free";

        // check meetings limit per calendar month
        if (userPlan === "free") {
            const monthlyCountResult = await sql`
                SELECT COUNT(*) as count
                FROM meetings
                WHERE host_id = ${userId}
                AND created_at >= date_trunc('month', NOW())`;
            
            const monthlyCount = parseInt(monthlyCountResult[0]?.count || '0');

            if (monthlyCount >= 30) {
                return res.status(403).json({
                    error: "Monthly limit reached. Free plan includes 30 meetings per month. Please upgrade to Premium for unlimited meetings!",
                    limitReached: true,
                    monthlyCount,
                    limit: 30,
                });
            }
        }

        let meetingId = generateMeetingId();

        // Ensure unique ID
        let existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
        while (existing.length > 0) {
            meetingId = generateMeetingId();
            existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
        }

        const [meeting] = await sql`
        INSERT INTO meetings(meeting_id, title, host_id, status)
        VALUES (${meetingId}, ${title || "Instant Meeting"}, ${userId}, 'active')
        RETURNING id, meeting_id, title, host_id, status, created_at
        `;

        const hostName = users[0]?.name || "Host";

        // Insert host into participants
        await sql`INSERT INTO meeting_participants (meeting_id, user_id, name)
        VALUES (${meeting.id}, ${userId}, ${hostName})`;

        res.status(201).json({
            meeting: {
                id: meeting.id,
                meetingId: meeting.meeting_id,
                title: meeting.title,
                host: meeting.host_id,
                status: meeting.status,
                createdAt: meeting.created_at,
            }
        });

    } catch (error) {
        console.error("create meeting failed:", error);
        res.status(500).json({ error: "Failed to create meeting" });
    }
}

// get meeting by id
export const getMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const meetings = await sql`SELECT m.*, u.id as host_user_id, u.name as host_name, u.email as host_email FROM meetings m JOIN users u ON m.host_id = u.id WHERE m.meeting_id = ${meetingId}`;

        if (meetings.length === 0) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        const meeting = meetings[0];

        if (meeting.status === "ended") {
            return res.status(400).json({ error: "This meeting has ended" });
        }

        res.json({
            meeting: {
                id: meeting.id,
                meetingId: meeting.meeting_id,
                title: meeting.title,
                status: meeting.status,
                createdAt: meeting.created_at,
                host: {
                    id: meeting.host_user_id,
                    name: meeting.host_name,
                    email: meeting.host_email,
                }
            }
        });

    } catch (error) {
        console.error("fetch meeting failed:", error);
        res.status(500).json({ error: "Failed to fetch meeting" });
    }
}

// get all user's meetings sessions
export const getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch meetings where user is host OR listed in participants
        const meetings = await sql`
            SELECT DISTINCT m.id, m.meeting_id, m.title, m.status, m.created_at, m.ended_at, m.host_id, u.name as host_name, u.email as host_email
            FROM meetings m
            JOIN users u ON m.host_id = u.id
            LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
            WHERE m.host_id = ${userId} OR mp.user_id = ${userId}
            ORDER BY m.created_at DESC
        `;

        const formattedMeetings = await Promise.all(
            meetings.map(async (m) => {
                const participants = await sql`
                    SELECT mp.*, u.email
                    FROM meeting_participants mp
                    LEFT JOIN users u ON mp.user_id = u.id
                    WHERE mp.meeting_id = ${m.id}
                `;

                const messages = await sql`
                    SELECT id, sender_id, sender_name, text, timestamp
                    FROM meeting_messages
                    WHERE meeting_id = ${m.id}
                    ORDER BY timestamp ASC
                `;

                return {
                    id: m.id,
                    meetingId: m.meeting_id,
                    title: m.title,
                    status: m.status,
                    createdAt: m.created_at,
                    endedAt: m.ended_at,
                    host: {
                        id: m.host_id,
                        name: m.host_name,
                        email: m.host_email,
                    },
                    participants: participants.map((p) => ({
                        user: p.user_id ? { id: p.user_id, email: p.email } : null,
                        name: p.name,
                        joinedAt: p.joined_at,
                        leftAt: p.left_at,
                    })),
                    messages: messages.map((msg) => ({
                        id: msg.id,
                        sender: msg.sender_id,
                        senderName: msg.sender_name,
                        text: msg.text,
                        timestamp: msg.timestamp,
                    }))
                }
            })
        )

        res.json({ meetings: formattedMeetings });

    } catch (error) {
        console.error("get user session failed:", error);
        res.status(500).json({ error: "Failed to get user sessions" });
    }
}

// get meeting session details by id
export const getSessionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const meetings = await sql`
            SELECT
            m.*,
            u.id AS host_user_id,
            u.name AS host_name,
            u.email AS host_email
            FROM meetings m
            JOIN users u ON m.host_id = u.id
            WHERE m.meeting_id = ${id}`;

        if (meetings.length === 0) {
            return res.status(404).json({ error: "Session details not found" });
        }

        const m = meetings[0];

        if((m.host_id !== userId)){
            const membership = await sql`
                SELECT 1 FROM meeting_participants
                WHERE meeting_id = ${m.id} AND user_id = ${userId} LIMIT 1`;
            if(membership.length === 0){
                return res.status(404).json({error:"Sessions details not found"});
            }
        }

        const participants = await sql`
            SELECT mp.*, u.email
            FROM meeting_participants mp
            LEFT JOIN users u ON mp.user_id = u.id
            WHERE mp.meeting_id = ${m.id}
        `;

        const messages = await sql`
            SELECT id, sender_id, sender_name, text, timestamp
            FROM meeting_messages
            WHERE meeting_id = ${m.id}
            ORDER BY timestamp ASC`;

        const formattedMeeting = {
            id: m.id,
            meetingId: m.meeting_id,
            title: m.title,
            status: m.status,
            createdAt: m.created_at,
            endedAt: m.ended_at,
            host: {
                id: m.host_user_id,
                name: m.host_name,
                email: m.host_email,
            },
            participants: participants.map((p) => ({
                user: p.user_id ? { id: p.user_id, email: p.email } : null,
                name: p.name,
                joinedAt: p.joined_at,
                leftAt: p.left_at,
            })),
            messages: messages.map((msg) => ({
                id: msg.id,
                sender: msg.sender_id,
                senderName: msg.sender_name,
                text: msg.text,
                timestamp: msg.timestamp,
            }))
        }

        res.json({ meeting: formattedMeeting });

    } catch (error) {
        console.error("get session details failed:", error);
        res.status(500).json({ error: "Failed to get session details" });
    }
}

// get plan & meetings statistics for user dashboard
export const getMeetingStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const users = await sql`SELECT plan FROM users WHERE id = ${userId}`;
        const plan = users[0]?.plan || "free";

        const monthlyCountResult = await sql`
            SELECT COUNT(*) as count
            FROM meetings
            WHERE host_id = ${userId}
            AND created_at >= date_trunc('month', NOW())`;

        const monthlyCount = parseInt(monthlyCountResult[0]?.count || '0', 10);
        const monthlyLimit = plan === "premium" ? null : 30;

        res.json({
            plan,
            monthlyCount,
            monthlyLimit,
            maxParticipants: plan === "premium" ? 100 : 10,
        });

    } catch (error) {
        console.error("get meeting stats failed:", error);
        res.status(500).json({ error: "Failed to get meeting status" });
    }
}