// Dummy data & assets for frontend

export const dummyUser = {
    id: "user_mock_001",
    fullName: "Alex Rivera",
    firstName: "Alex",
    lastName: "Rivera",
    name: "Alex Rivera",
    primaryEmailAddress: {
        emailAddress: "alex.rivera@example.com",
    },
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const dummyStats = {
    plan: "premium",
    monthlyCount: 8,
    monthlyLimit: null, // Unlimited for premium
    maxParticipants: 100,
};



export const dummySessions = [
    {
        id: 1,
        meetingId: "qwe-rty-uio",
        title: "Sprint Planning & Roadmap Review",
        status: "ended",
        createdAt: "2026-08-14T09:30:00.000Z",
        endedAt: "2026-08-14T10:45:00.000Z",
        host: {
            id: "user_mock_001",
            name: "Alex Rivera",
            email: "alex.rivera@example.com",
        },
        participants: [
            {
                user: { id: "user_mock_001", email: "alex.rivera@example.com" },
                name: "Alex Rivera",
                joinedAt: "2026-08-14T09:30:00.000Z",
                leftAt: "2026-08-14T10:45:00.000Z",
            },
            {
                user: { id: "user_mock_002", email: "sarah.chen@example.com" },
                name: "Sarah Chen",
                joinedAt: "2026-08-14T09:31:12.000Z",
                leftAt: "2026-08-14T10:44:20.000Z",
            },
            {
                user: { id: "user_mock_003", email: "marcus.vance@example.com" },
                name: "Marcus Vance",
                joinedAt: "2026-08-14T09:32:05.000Z",
                leftAt: "2026-08-14T10:45:00.000Z",
            },
            {
                user: { id: "user_mock_004", email: "elena.rostova@example.com" },
                name: "Elena Rostova",
                joinedAt: "2026-08-14T09:35:40.000Z",
                leftAt: "2026-08-14T10:40:15.000Z",
            },
        ],
        messages: [
            {
                id: "m1",
                senderId: "user_mock_001",
                senderName: "Alex Rivera",
                text: "Welcome everyone! Let's kick off with the Q3 milestone updates.",
                timestamp: "2026-08-14T09:31:00.000Z",
            },
            {
                id: "m2",
                senderId: "user_mock_002",
                senderName: "Sarah Chen",
                text: "The frontend redesign is 90% completed and currently in QA review.",
                timestamp: "2026-08-14T09:34:10.000Z",
            },
            {
                id: "m3",
                senderId: "user_mock_003",
                senderName: "Marcus Vance",
                text: "Backend API endpoints are ready on staging server.",
                timestamp: "2026-08-14T09:36:22.000Z",
            },
            {
                id: "m4",
                senderId: "user_mock_001",
                senderName: "Alex Rivera",
                text: "Awesome work team. Let's aim for shipping next Wednesday!",
                timestamp: "2026-08-14T09:42:00.000Z",
            },
        ],
    },
    {
        id: 2,
        meetingId: "zxc-vbn-mas",
        title: "Product Design Critique & Demo",
        status: "active",
        createdAt: "2026-08-14T14:15:00.000Z",
        endedAt: null,
        host: {
            id: "user_mock_002",
            name: "Sarah Chen",
            email: "sarah.chen@example.com",
        },
        participants: [
            {
                user: { id: "user_mock_002", email: "sarah.chen@example.com" },
                name: "Sarah Chen",
                joinedAt: "2026-08-14T14:15:00.000Z",
                leftAt: null,
            },
            {
                user: { id: "user_mock_001", email: "alex.rivera@example.com" },
                name: "Alex Rivera",
                joinedAt: "2026-08-14T14:16:30.000Z",
                leftAt: null,
            },
            {
                user: { id: "user_mock_005", email: "david.kim@example.com" },
                name: "David Kim",
                joinedAt: "2026-08-14T14:18:10.000Z",
                leftAt: null,
            },
        ],
        messages: [
            {
                id: "m10",
                senderId: "user_mock_002",
                senderName: "Sarah Chen",
                text: "Sharing my screen now to show the updated mobile layout.",
                timestamp: "2026-08-14T14:17:00.000Z",
            },
            {
                id: "m11",
                senderId: "user_mock_001",
                senderName: "Alex Rivera",
                text: "The new sidebar drawer looks super clean!",
                timestamp: "2026-08-14T14:19:40.000Z",
            },
        ],
    },
    {
        id: 3,
        meetingId: "abc-def-ghi",
        title: "Weekly Engineering Standup",
        status: "ended",
        createdAt: "2026-08-13T10:00:00.000Z",
        endedAt: "2026-08-13T10:30:00.000Z",
        host: {
            id: "user_mock_001",
            name: "Alex Rivera",
            email: "alex.rivera@example.com",
        },
        participants: [
            {
                user: { id: "user_mock_001", email: "alex.rivera@example.com" },
                name: "Alex Rivera",
                joinedAt: "2026-08-13T10:00:00.000Z",
                leftAt: "2026-08-13T10:30:00.000Z",
            },
            {
                user: { id: "user_mock_004", email: "elena.rostova@example.com" },
                name: "Elena Rostova",
                joinedAt: "2026-08-13T10:01:00.000Z",
                leftAt: "2026-08-13T10:30:00.000Z",
            },
        ],
        messages: [
            {
                id: "m20",
                senderId: "user_mock_004",
                senderName: "Elena Rostova",
                text: "All automated test suites are passing.",
                timestamp: "2026-08-13T10:10:00.000Z",
            },
        ],
    },
];

export const dummyMeetingDetails = {
    id: 101,
    meetingId: "abc-def-ghi",
    title: "Instant Meeting",
    status: "active",
    createdAt: new Date().toISOString(),
    host: {
        id: "user_mock_001",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
    },
};

export const dummyRemoteParticipants = [
    {
        socketId: "socket_sarah_002",
        userId: "user_mock_002",
        userName: "Sarah Chen",
        stream: null,
        audioEnabled: true,
        videoEnabled: true,
    },
    {
        socketId: "socket_marcus_003",
        userId: "user_mock_003",
        userName: "Marcus Vance",
        stream: null,
        audioEnabled: false,
        videoEnabled: true,
    },
    {
        socketId: "socket_elena_004",
        userId: "user_mock_004",
        userName: "Elena Rostova",
        stream: null,
        audioEnabled: true,
        videoEnabled: false,
    },
];

export const dummyInitialChatMessages = [
    {
        id: "chat_01",
        senderId: "user_mock_002",
        senderName: "Sarah Chen",
        text: "Hey Alex! Can you hear me clearly?",
        time: "02:15 PM",
    },
    {
        id: "chat_02",
        senderId: "user_mock_003",
        senderName: "Marcus Vance",
        text: "Loud and clear! Ready for the walkthrough.",
        time: "02:16 PM",
    },
];
