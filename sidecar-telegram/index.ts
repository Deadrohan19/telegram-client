import { sendCode, verifyCode, verify2FA, getUserInfo } from "./telegramAuth";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://tauri.localhost",
    "tauri://localhost"
  ],
  methods: "GET,POST",
  allowedHeaders: ["Content-Type"], // Add 'Authorization' here
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (_, res) => {
  res.send("Telegram Authenticate API is running.....");
})
app.post("/sendCode", async (req, res) => {
  const {sessionId, phoneNumber } = req.body;
  const result = await sendCode(sessionId, phoneNumber);
  res.json(result);
});

app.post("/verifyCode", async (req, res) => {
  const {sessionId, phoneNumber, phoneCode, phoneCodeHash } = req.body;
  const result = await verifyCode(sessionId, phoneNumber, phoneCode, phoneCodeHash);
  res.json(result);
});

app.post("/verify2FA", async (req, res) => {
  const {sessionId, password } = req.body;
  const result = await verify2FA(sessionId, password);
  res.json(result);
});

app.get("/getUserInfo", async (req, res) => {
  const {sessionId} = req.query;
  const result = await getUserInfo(sessionId);
  res.json(result);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
