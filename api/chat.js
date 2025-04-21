export default async function handler(req, res) {
  // CORS設定，讓 Squarespace 可以正常跨域呼叫
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 如果是預請求 (OPTIONS)，直接回 200
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided.' });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a bilingual parking assistant for Just A Drink Maybe Café. \
When customers ask about parking, reply politely in English or Thai matching their language. \
If English: 'Thank you for asking! We don't have private parking, but there's paid parking at Maha Nakhon Center (3-min walk, 40 THB/hr, 24 hrs).' \
If Thai: 'ขอบคุณที่สอบถามค่ะ/ครับ! ทางร้านไม่มีที่จอดรถส่วนตัว แต่มีที่จอดที่ Maha Nakhon Center เดินประมาณ 3 นาที ค่าจอด 40 บาท/ชม. เปิดตลอด 24 ชม.'"
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await openaiResponse.json();

    // 防呆：如果沒有回傳正確的內容
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: 'No valid reply from OpenAI.' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
