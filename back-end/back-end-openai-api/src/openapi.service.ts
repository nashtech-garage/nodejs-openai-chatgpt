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
      // Gọi API từ OpenAI với lịch sử tin nhắn
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages, // Gửi lịch sử tin nhắn tới OpenAI với đúng kiểu dữ liệu
      });

      // Trả về nội dung tin nhắn phản hồi của AI
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error('Failed to get response from OpenAI');
    }
  }
}
