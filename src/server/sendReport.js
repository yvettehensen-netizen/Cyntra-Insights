import express from "express";
import multer from "multer";
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { generateEmailTemplate } from "./emailTemplate.js";

dotenv.config();
const router = express.Router();
const upload = multer();
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

const brands = JSON.parse(fs.readFileSync(path.resolve("./src/server/brands.json"), "utf8"));

router.post("/api/sendReport", upload.single("file"), async (req, res) => {
  const { email, brand } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Geen PDF ontvangen." });
  if (!brand || !brands[brand]) return res.status(400).json({ error: "Ongeldig merk." });

  const selected = brands[brand];
  const html = generateEmailTemplate({
    brandName: selected.brandName,
    brandUrl: selected.brandUrl,
    brandColor: selected.brandColor,
    logoUrl: selected.logoUrl,
    title: "Jouw Performance Scan Rapport",
    message: `
      <p>Beste professional,</p>
      <p>Bedankt voor het invullen van de <strong>${selected.brandName} Performance Scan</strong>.</p>
      <p>In de bijlage vind je jouw persoonlijke rapport met inzichten en aanbevelingen.</p>
      <p>Wil je jouw resultaten bespreken met een adviseur? Plan hieronder vrijblijvend een sessie.</p>`,
    ctaText: "Plan een gratis sessie",
    ctaLink: selected.brandUrl + "/afspraak"
  });

  try {
    await resend.emails.send({
      from: `${selected.brandName} <noreply@${selected.brandUrl.replace("https://", "").replace("http://", "")}>`,
      to: email,
      subject: `📊 Jouw ${selected.brandName} Performance Scan Rapport`,
      html,
      attachments: [{ filename: file.originalname, content: file.buffer.toString("base64"), encoding: "base64" }]
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
