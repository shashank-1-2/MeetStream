import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { handleClerkWebhook } from "./controllers/webhookController.js";
import meetingRouter from "./routes/meetingRoutes.js";
import { Server } from "socket.io";
import { setupSocketIO } from "./socket.js";

const app = express();
const server = http.createServer(app);

// Connect to Neon & Initialize Tables
initDB().catch((err) => console.error("Failed to initialize DB:", err));

const allowedOrigins = process.env.ORIGINS.split(",");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests (curl, server-to-server)
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/meet-stream-.*\.vercel\.app$/.test(origin);
    callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/clerk", express.raw({type: "application/json"}), handleClerkWebhook)
app.use(express.json())
app.use(clerkMiddleware())

app.get("/", (req, res)=> res.send("API is Live!"))
app.use("/api/meetings", meetingRouter);

const io = new Server(server, {
  cors: corsOptions
});

setupSocketIO(io);

//Centralized Error Handler
app.use((err, _req, res, _next)=>{
    console.error(`[Error] ${err.message}`);
    res.status(500).json({error:"Internal server error"});
})

const port = process.env.PORT || 3000;

server.listen(port, ()=>{
    console.log(`Server is running at http://localhost:${port}`);
})