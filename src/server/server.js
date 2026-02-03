import express from "express";
import dotenv from "dotenv";
import sendReportRouter from "./sendReport.js";
import aiRouter from "./ai.js";

dotenv.config();

const app = express();
app.use(express.json());

// ROUTES
app.use("/api", sendReportRouter);
app.use("/api", aiRouter);

app.listen(5000, () => {
  console.log("✅ Backend draait op http://localhost:5000");
});
