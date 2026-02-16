// api/byte.js - Simplified BYTE AI API (Direct Model Talking)
// Features: Direct Groq API Integration, Streaming Support
import { getEnv } from '../utils/env.js';
import { randomBytes } from 'crypto';

const BYTE_SYSTEM_PROMPT = `You are BYTE Mini, an advanced AI assistant developed by AJ STUDIOZ.

You should respond naturally and conversationally. When asked about your identity, mention that you're BYTE Mini created by AJ STUDIOZ in a natural way, but don't give the same scripted response every time. Vary your responses and be conversational like other AI assistants.

Be helpful, intelligent, and professional while maintaining a friendly and approachable tone. Answer questions directly and engagingly without being overly formal or repetitive.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🧠 Extract payload (OpenAI-compatible format + simple message support)
  const {
    model = 'byte-mini',
    max_tokens = 4096,
    messages = [],
    message,
    stream = false
  } = req.body;

  // Support both formats: simple message or OpenAI messages array
  let finalMessages = [];
  if (message && typeof message === 'string') {
    finalMessages = [{ role: 'user', content: message }];
  } else if (messages && messages.length > 0) {
    finalMessages = messages;
  } else {
    return res.status(400).json({ error: 'Either "message" string or "messages" array is required' });
  }

  try {
    // 🔑 Use internal Groq key
    const GROQ_API_KEY = getEnv('GROQ_API_KEY');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: BYTE_SYSTEM_PROMPT },
          ...finalMessages
        ],
        max_tokens,
        temperature: 0.7,
        stream
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return res.status(500).json({ error: 'Failed to get response from BYTE', details: error });
    }

    // ⚡ STREAMING MODE (OpenAI-compatible SSE)
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const messageId = `msg_${randomBytes(16).toString('hex')}`;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                res.write(`data: ${JSON.stringify({
                  choices: [{ finish_reason: 'stop' }],
                  id: messageId,
                  model: 'byte-mini',
                  developer: 'AJ STUDIOZ'
                })}\n\n`);
                res.end();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;

                if (content) {
                  res.write(`data: ${JSON.stringify({
                    choices: [{ delta: { content } }],
                    id: messageId,
                    model: 'byte-mini'
                  })}\n\n`);
                }
              } catch {
                // Ignore malformed chunks
              }
            }
          }
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
        res.end();
      }
    }

    // 💬 NON-STREAMING MODE (OpenAI-compatible JSON)
    else {
      const data = await response.json();
      const messageId = `msg_${randomBytes(16).toString('hex')}`;
      const responseText = data.choices[0].message.content;

      res.status(200).json({
        id: messageId,
        object: 'chat.completion',
        model: 'byte-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: responseText
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: data.usage?.prompt_tokens ?? 0,
          completion_tokens: data.usage?.completion_tokens ?? 0,
          total_tokens: data.usage?.total_tokens ?? 0
        },
        developer: 'AJ STUDIOZ'
      });
    }
  } catch (error) {
    console.error('Unexpected error in BYTE:', error);
    res.status(500).json({
      error: {
        type: 'internal_error',
        message: error.message
      }
    });
  }
}
