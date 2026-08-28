import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5050;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "notifier" });
});

app.post("/notify", async (req, res) => {
  const { title, message, severity } = req.body ?? {};

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  // Local-only phase: just log. Wire up Slack/email once you have
  // credentials — SLACK_WEBHOOK_URL is already read below if you set it.
  console.log(`[notify] (${severity ?? "info"}) ${title ?? ""}: ${message}`);

  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `*${title ?? "Alert"}*\n${message}` }),
      });
    } catch (err) {
      console.error("[notify] failed to post to Slack:", err);
    }
  }

  res.status(202).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`notifier listening on http://localhost:${PORT}`);
});
