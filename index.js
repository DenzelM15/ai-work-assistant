import express from 'express';
import 'dotenv/config';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/assist', async (req, res) => {
  const { content, targetContactName } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content/Document text is required' });
  }

  // Fixed syntax: Removed the colons inside the key strings
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const result = await streamText({
      model: google('gemini-3.6-flash'),
      system: `You are an elite corporate assistant and networking strategist. 
      Your task is to analyze the provided text (which could be a job description, company page, or article) and provide two things:
      1. A bulleted Markdown summary of the core points.
      2. A highly personalized, 3-sentence networking email or LinkedIn icebreaker directed at the target contact. Keep the tone professional yet warm. Do not use generic placeholders.
      Format the entire response cleanly using Markdown headers.`,
      prompt: `Target Contact Name: ${targetContactName || 'Hiring Manager/Team Member'}\n\nSource Content:\n${content}`,
    });

    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error('Streaming API Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream assistant request' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini Streaming Server running on http://localhost:${PORT}`);
});
