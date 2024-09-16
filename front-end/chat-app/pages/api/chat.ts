import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { messages } = req.body; // Lấy toàn bộ lịch sử tin nhắn từ body request

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ message: 'Messages are required and should be an array' });
    return;
  }

  try {
    // Gọi OpenAI API với lịch sử tin nhắn đầy đủ
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/openapi/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }), // Gửi lịch sử tin nhắn tới backend
    });

    const data = await response.json();

    // Kiểm tra nếu backend trả về `result` hoặc `error`
    if (data.result) {
      // Trả kết quả từ OpenAI về cho front-end
      res.status(200).json({ reply: data.result });
    } else if (data.error) {
      // Trả lỗi từ backend về cho front-end
      res.status(400).json({ message: data.error });
    } else {
      res.status(500).json({ message: 'Unexpected response format from backend' });
    }
  } catch (error) {
    console.error('Error calling backend API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
