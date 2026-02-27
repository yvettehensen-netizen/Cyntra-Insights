import express from "express";
import { resolveSectorSignals } from "./signalsCore.js";

const router = express.Router();

router.get("/api/sector/signals", async (req, res) => {
  const sector = String(req.query.sector || "").trim();

  if (!sector) {
    return res.status(400).json({ error: "sector query parameter ontbreekt" });
  }

  const payload = await resolveSectorSignals(sector);
  return res.json(payload);
});

export default router;
