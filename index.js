import express from 'express';
import 'dotenv/config';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));

const modes = {
  analyze: `
Analyze the provided content.

Give:
1. A concise summary.
2. Key points.
3. Practical next steps.

Use clear Markdown.
`,

  apply: `
Analyze this job description.

Identify:
1. Main requirements.
2. Technical skills.
3. Soft skills.
4. What an applicant should emphasize.
5. Interview preparation points.

Do not invent qualifications or experience.
`,

  email: `
Write a concise, professional email based on the provided information.

Make it:
- natural
- specific
- professional
- ready to copy

Do not invent facts or experience.
`,

  summarize: `
Summarize the provided content into the most important:
- facts
- requirements
- action items

Use clear Markdown.
`,

  brainstorm: `
Brainstorm practical ideas, improvements and next steps based on the provided content.

Prioritize realistic actions the user can actually take.
`,

  code: `
Act as a practical software development assistant.

Explain the problem briefly, recommend a solution and provide working code where appropriate.

Prioritize solutions that are practical for a junior developer working with:
- JavaScript
- Node.js
- Express
- HTML
- CSS
- SQL
- PostgreSQL
`
};

app.post('/api/assist', async (req, res) => {
  const {
    content,
    targetContactName,
    mode = 'analyze',
    conversation = []
  } = req.body;

  console.log('\n--- AI REQUEST ---');
  console.log('Mode:', mode);
  console.log('Content length:', content?.length);
  console.log('Conversation messages:', conversation.length);
  console.log(
    'API key exists:',
    Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  );

  if (!content?.trim()) {
    return res.status(400).json({
      error: 'Content is required.'
    });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    /*
     * Convert the browser conversation into a simple
     * text context for the AI.
     *
     * This keeps the implementation reliable while giving
     * Gemini the previous conversation.
     */
    const conversationContext = conversation
      .filter(message => message?.role && message?.content)
      .map(message => {
        const role =
          message.role === 'assistant'
            ? 'AI WORK ASSISTANT'
            : 'USER';

        return `${role}:\n${message.content}`;
      })
      .join('\n\n');

    const result = streamText({
      model: google('gemini-3.6-flash'),

      system: `
You are AI Work Assistant.

You help users with:

- careers
- job applications
- productivity
- professional writing
- business
- software development
- technical problem solving

Be:
- practical
- accurate
- concise
- professional
- helpful

Never invent facts, qualifications, experience,
companies, projects or achievements.

The user may ask follow-up questions.
Use the previous conversation to understand context
and answer naturally.

If the user corrects something, use the correction
in later responses.

${modes[mode] || modes.analyze}
`,

      prompt: `
Target Contact:
${targetContactName?.trim() || 'Not specified'}

Previous Conversation:
${conversationContext || 'No previous conversation.'}

Current User Request:
${content}

Respond directly to the current user request while
using the previous conversation when relevant.
`
    });

    console.log('AI stream created.');
    result.pipeTextStreamToResponse(res);
    console.log('Streaming response started.');

  } catch (error) {
    console.error('\n!!! AI ERROR !!!');
    console.error(error);
    console.error('Message:', error?.message);
    console.error('Cause:', error?.cause);

    if (!res.headersSent) {
      return res.status(500).json({
        error: error?.message || 'AI request failed'
      });
    }
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Work Assistant API is running'
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 AI Work Assistant running on http://localhost:${PORT}`
  );
});
