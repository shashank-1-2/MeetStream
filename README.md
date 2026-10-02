# MeetStream

A full-stack, real-time video conferencing application utilizing a **WebRTC Peer-to-Peer (P2P) Mesh architecture**. Built with React, Node.js, Socket.io, and Neon Postgres, featuring enterprise-grade identity management via Clerk and secure JWT API interceptors.

---

## 🚀 Key Features

- **Real-Time P2P Video & Audio** — Direct browser-to-browser media streaming utilizing WebRTC, STUN servers for NAT traversal, and custom hooks (`useWebRTC`) for efficient hardware resource management and graceful degradation.
- **Low-Latency Signaling Engine** — Built on Socket.io for sub-millisecond exchanges of Session Description Protocol (SDP) payloads, ICE Candidates, and real-time chat bridging.
- **Idempotent User Synchronization** — Backend integrates with Clerk Webhooks using Postgres `ON CONFLICT DO UPDATE` (Upsert) operations to guarantee database integrity during asynchronous identity synchronization.
- **Secure API Pipeline** — Express API guarded by custom middleware that cryptographically verifies short-lived Clerk JWTs attached via Axios interceptors.
- **Smart State Management** — Heavy utilization of React `useRef` to maintain active network peer connections without triggering expensive UI re-renders, and `useMemo`/`useCallback` for optimized performance.
- **Meeting History & Analytics** — Persistent tracking of user sessions, chat logs, and hosted meetings backed by a serverless Neon PostgreSQL database.

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- WebRTC API (MediaStreams, RTCPeerConnection)
- Socket.io-client
- Clerk (Authentication)
- Axios

**Backend**
- Node.js & Express
- Socket.io (WebSocket Server)
- Neon (Serverless PostgreSQL)
- Clerk Webhooks (Svix cryptography)

---

## 📐 System Architecture

MeetStream separates media routing from signaling. The Node.js server handles authentication, chat, and connection negotiations, while heavy video traffic flows directly between users.

```mermaid
graph TD
    classDef admin fill:#8a2be2,stroke:#333,stroke-width:2px,color:white
    classDef signal fill:#f39c12,stroke:#333,stroke-width:2px,color:black
    classDef engine fill:#2a9d8f,stroke:#333,stroke-width:2px,color:white
    classDef helper fill:#e74c3c,stroke:#333,stroke-width:2px,color:white
    classDef payload fill:#f1c40f,stroke:#333,stroke-width:2px,color:black

    Webhook["Clerk Webhooks<br/>Syncs Identity"]:::admin
    Socket["Socket.io Server<br/>Signaling"]:::signal
    WebRTC_A["WebRTC Engine<br/>User A"]:::engine
    WebRTC_B["WebRTC Engine<br/>User B"]:::engine
    STUN["STUN Servers<br/>IP Resolvers"]:::helper

    Webhook -.->|Validates users| Socket
    WebRTC_A -->|1. Asks for IP| STUN
    STUN -->|2. Returns IP ICE| WebRTC_A
    WebRTC_A -->|3. Generates SDP| WebRTC_A
    WebRTC_A -->|4. Sends SDP/ICE via| Socket
    Socket -->|5. Delivers to| WebRTC_B
    WebRTC_B ===|6. Direct P2P Video Stream| WebRTC_A
```

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js (v18+)
- A Neon Postgres database URL
- A Clerk application (for Auth)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/MeetStream.git
cd MeetStream
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=3000
DATABASE_URL=postgres://user:password@ep-cold-sky-123456.us-east-2.aws.neon.tech/neondb
ORIGINS=http://localhost:5173
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

---

## 📈 Future Scaling Roadmap

While the current P2P Mesh architecture is highly efficient for small groups (2–6 users), exponential bandwidth growth makes it unsuitable for large enterprise webinars.

**Planned Architecture V2:**

- **Selective Forwarding Unit (SFU)** — Replace the P2P Mesh with a WebRTC SFU (like `mediasoup` or `Pion`) to route media streams through a central server, reducing client-side bandwidth from O(N²) to O(N).
- **Horizontal Scaling (Redis)** — Migrate the in-memory Socket.io `Map()` to an external Redis cluster utilizing the `@socket.io/redis-adapter`, allowing the deployment of multiple Node.js instances behind a load balancer without dropping meeting state.
- **TURN Servers** — Implement enterprise TURN servers (e.g., Coturn) to guarantee video delivery for corporate users restricted by Symmetric NAT firewalls.
