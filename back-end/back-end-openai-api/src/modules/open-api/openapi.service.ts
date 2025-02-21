import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai'; // Sử dụng OpenAI từ phiên bản mới
import { ChatCompletionMessageParam } from 'openai/resources';
import { functionToolsDefine as tools } from './function-tools/function-tools.define';
import { FunctionToolsService } from './function-tools.service';

@Injectable()
export class OpenApiService {
  private openai: OpenAI;

  constructor(@Inject(forwardRef(() => FunctionToolsService)) private readonly functionToolsService: FunctionToolsService ) {
    // Khởi tạo OpenAI với API Key từ biến môi trường
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getOpenApiResponse(messages: ChatCompletionMessageParam[], isCallBackFromToolChain: Boolean = false): Promise<string> {
    try {
      // Gọi API từ OpenAI với lịch sử tin nhắn
      const response = await this.openai.chat.completions.create({
        model: process.env.GPT_MODEL,
        messages, // Gửi lịch sử tin nhắn tới OpenAI với đúng kiểu dữ liệu
        ...(isCallBackFromToolChain ? {} : { tools }), // Chỉ thêm tools nếu không phải callback từ toolchain
      });

      const messageResponse: ChatCompletionMessageParam = response.choices[0].message;

      if (messageResponse.tool_calls) {
        let processMessage = [
          ...messages,
          messageResponse
        ];

        for (const toolCall of messageResponse.tool_calls) {
          processMessage = [
            ...processMessage,
            (await this.functionToolsService.processToolChain(toolCall))[0]
          ]
        }
        return this.getOpenApiResponse(processMessage, true);
      }
      // Trả về nội dung tin nhắn phản hồi của AI
      return response.choices[0].message.content;
    } catch (error) {
      console.log(error.message);
      throw new Error('Failed to get response from OpenAI');
    }
  }
}