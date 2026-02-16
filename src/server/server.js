import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sendReportRouter from "./sendReport.js";
import aiRouter from "./ai.js";
import intelligenceRouter from "./intelligence.js";
import analysesRouter from "./analyses.js";

dotenv.config();

const app = express();
const resolvedPort = Number.parseInt(
  String(process.env.CONTROL_ROOM_API_PORT || process.env.PORT || "5100"),
  10
);
const apiPort = Number.isFinite(resolvedPort) && resolvedPort > 0 ? resolvedPort : 5100;

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api", sendReportRouter);
app.use("/api", aiRouter);
app.use("/api", analysesRouter);
app.use("/api/intelligence", intelligenceRouter);
app.use("/intelligence", intelligenceRouter);

app.listen(apiPort, () => {
  console.log(`✅ Backend draait op http://localhost:${apiPort}`);
});
