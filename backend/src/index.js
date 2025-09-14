const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const adminRoutes = require("./routes/admin.routes.js");
const candidateRoutes = require("./routes/candidate.routes.js");
const Candidate = require("./models/candidate");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin:  process.env.FRONTEND_URL,
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

connectDB();
app.use("/admin", adminRoutes);
app.use("/candidate", candidateRoutes);

// -------------------- SOCKET.IO --------------------

// Store connected admins and candidates
const admins = new Map();
const candidates = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // When a candidate joins
  socket.on("candidate-join", async(candidateId) => {
    candidates.set(socket.id, candidateId);
    console.log(`Candidate joined: ${candidateId}`);
    const candidate = await Candidate.findById(candidateId);
    // Optionally notify all admins
    io.to("admins").emit("candidate-joined", { candidate });
  });

  // When an admin joins
  socket.on("admin-join", (adminId) => {
    admins.set(socket.id, adminId);
    socket.join("admins"); // admins can be in a room
    console.log(`Admin joined: ${adminId}`);
  });

  // Candidate sends an event
  socket.on("candidate-event", (event) => {
    const candidateId = candidates.get(socket.id);
    if (!candidateId) return;

    console.log(`Event from candidate ${candidateId}:`, event);

    // Notify all admins
    io.to("admins").emit("candidate-event", { candidateId, event });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (admins.has(socket.id)) {
      console.log(`Admin disconnected: ${admins.get(socket.id)}`);
      admins.delete(socket.id);
    } else if (candidates.has(socket.id)) {
      console.log(`Candidate disconnected: ${candidates.get(socket.id)}`);
      candidates.delete(socket.id);
    }
  });
});

// -------------------- END SOCKET.IO --------------------

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
