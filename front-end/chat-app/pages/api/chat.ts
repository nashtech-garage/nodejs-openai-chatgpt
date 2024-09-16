// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  reply: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { message } = req.body;

  // Giả lập phản hồi AI
  const aiReply = `AI trả lời: "${message}"`;

  res.status(200).json({ reply: aiReply });
}
