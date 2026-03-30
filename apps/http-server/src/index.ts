import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "@routes/auth.routes";
import leaderboardRouter from "@routes/leaderboard.routes";
import gameRouter from "@routes/game.routes";

const app = express();
const PORT = parseInt(process.env.HTTP_PORT ?? "8080", 10);

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/games", gameRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});
