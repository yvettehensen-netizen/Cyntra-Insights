import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.post("/ai", async (req, res) => {
  try {
    const { messages, model = "gpt-4o", max_tokens = 2000 } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "messages ontbreekt" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature: 0.3,
        }),
      }
    );

    const json = await response.json();
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
