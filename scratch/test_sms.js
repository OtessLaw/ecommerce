async function testAllFastReachFields() {
  const apiKey = 'bms_live_1785502841008_np14a00zkx';

  const variations = [
    { name: 'recipient + message + sender + type', body: { recipient: '233200000000', message: 'Test JNJ Vintage', sender: 'JNJVINTAGE', type: 'plain' } },
    { name: 'recipients array', body: { recipients: ['233200000000'], message: 'Test JNJ Vintage', sender: 'JNJVINTAGE' } },
    { name: 'to + message + senderId', body: { to: '233200000000', message: 'Test JNJ Vintage', senderId: 'JNJVINTAGE' } },
    { name: 'recipient + sms + sender', body: { recipient: '233200000000', sms: 'Test JNJ Vintage', sender: 'JNJVINTAGE' } },
  ];

  for (const v of variations) {
    try {
      console.log(`Testing ${v.name}...`);
      const res = await fetch('https://fasreach.com/api/sms/send', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(v.body),
      });
      const data = await res.json();
      console.log(`[RESULT ${v.name}]:`, res.status, JSON.stringify(data));
    } catch (err) {
      console.error(`[ERROR ${v.name}]:`, err.message);
    }
  }
}

testAllFastReachFields();
