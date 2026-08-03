async function testPollinations() {
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are ChatGPT, a brilliant, warm, and helpful AI assistant.' },
          { role: 'user', content: 'how are u ? Tell me a short fun response.' }
        ],
        model: 'openai'
      })
    });

    const text = await res.text();
    console.log('--- POLLINATIONS FREE GPT-4 RESPONSE ---');
    console.log(text);
  } catch (err) {
    console.error('POLLINATIONS ERROR:', err);
  }
}

testPollinations();
