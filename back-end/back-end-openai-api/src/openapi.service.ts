import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai'; // Sử dụng OpenAI từ phiên bản mới

@Injectable()
export class OpenApiService {
  private openai: OpenAI;

  constructor() {
    // Khởi tạo OpenAI với API Key từ biến môi trường
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getOpenApiResponse(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
    try {
      console.log(messages, process.env.GPT_MODEL);
      // Gọi API từ OpenAI với lịch sử tin nhắn
      const response = await this.openai.chat.completions.create({
        model: process.env.GPT_MODEL,
        messages, // Gửi lịch sử tin nhắn tới OpenAI với đúng kiểu dữ liệu
      });

      console.log("--> ", response.choices[0].message.content);

      // Trả về nội dung tin nhắn phản hồi của AI
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error('Failed to get response from OpenAI');
    }
  }
}
