// server/providers/ollamaProvider.js

const fetch = require('node-fetch');

const OLLAMA_HOST =
  process.env.OLLAMA_HOST ||
  process.env.OLLAMA_BASE_URL ||
  'http://127.0.0.1:11434';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  'llama3.2';

async function generateResponse(prompt) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      }),
      timeout: 120000,
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      model: OLLAMA_MODEL,
      response: data.response || '',
    };

  } catch (error) {
    console.error('Ollama Provider Error:', error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}

async function testConnection() {
  return await generateResponse("Say 'GRACE-X brain connected.'");
}

module.exports = {
  generateResponse,
  testConnection,
};