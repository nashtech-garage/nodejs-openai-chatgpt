import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OpenApiService } from './openapi.service';
import { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from 'openai/resources';

import { vietnamBestFoods } from './function-tools/vietnam-best-foods';

@Injectable()
export class FunctionToolsService {
  constructor(@Inject(forwardRef(() => OpenApiService )) private readonly openApiService: OpenApiService) {}

	getMyBestFood = async (count: number, messages: ChatCompletionMessageParam[], toolCall: ChatCompletionMessageToolCall): Promise<string> => {
		const danhsach =  await vietnamBestFoods(count);
		console.log('Danh sach: ', danhsach);

			// Ta phải gán giá trị của OpenAI trả về (assistant vào trong message chain đang có)
			const updatedMessages: ChatCompletionMessageParam[] = [
				...messages,
				{
					role: 'tool',
					tool_call_id: toolCall.id, // Gắn ID của tool call
					content: JSON.stringify({ danhsach }) // Trả về danh sách món ăn
				}
			];

			console.log('updatedMessages: ', updatedMessages);

			return this.openApiService.getOpenApiResponse(updatedMessages, true);
	};

	async processToolChain(toolCall: ChatCompletionMessageToolCall, messages: ChatCompletionMessageParam[]) {

		const { name: funcName, arguments: args } = toolCall.function;
		const parsedArgs = JSON.parse(args);
		console.log(toolCall);

		switch (funcName) {
			case 'getMyBestFood':
				return await this.getMyBestFood(parsedArgs.count, messages, toolCall);
				break;
		}
	}
}
