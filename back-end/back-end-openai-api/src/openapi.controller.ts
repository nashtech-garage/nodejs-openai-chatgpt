import { Controller, Post, Body } from '@nestjs/common';
import { OpenApiService } from './openapi.service';

@Controller('openapi')
export class OpenApiController {
  constructor(private readonly openApiService: OpenApiService) {}

  @Post('message')
  async sendMessage(@Body('messages') messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<any> {
    try {
      const result = await this.openApiService.getOpenApiResponse(messages);
      return { result }; // Trả về phản hồi từ OpenAI
    } catch (error) {
      return { error: 'Failed to process message' };
    }
  }
}
