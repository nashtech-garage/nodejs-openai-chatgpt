import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OpenApiService } from './openapi.service';
import { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from 'openai/resources';

import { vietnamBestFoods } from './function-tools/vietnam-best-foods';
import { AwsService } from '../aws/aws.service';

// Định nghĩa kiểu cho tham số granularity
type GranularityType = 'DAILY' | 'MONTHLY' | 'HOURLY';

// Định nghĩa kiểu cho tham số metrics
type MetricsType = 'BlendedCost' | 'UnblendedCost' | 'AmortizedCost';

@Injectable()
export class FunctionToolsService {
  constructor(@Inject(forwardRef(() => OpenApiService )) private readonly openApiService: OpenApiService, private readonly awsService: AwsService) {}

	buildMessage = async (messages: ChatCompletionMessageParam[], toolCallId: string, content: string): Promise<ChatCompletionMessageParam[]> => {
		// Ta phải gán giá trị của OpenAI trả về (assistant vào trong message chain đang có)
		const updatedMessages: ChatCompletionMessageParam[] = [
			...messages,
			{
				role: 'tool',
				tool_call_id: toolCallId, // Gắn ID của tool call
				content: JSON.stringify({ content }) // Trả về danh sách món ăn
			}
		];
		console.log('updatedMessages: ', JSON.stringify(updatedMessages, null ,"\t") );
		return updatedMessages;
	}

	callOpenAIApi = async( messages: ChatCompletionMessageParam[], toolCallId: string, content: string): Promise<string> => {
		const updatedMessages: ChatCompletionMessageParam[] = await this.buildMessage(messages, toolCallId, content);
		return this.openApiService.getOpenApiResponse(updatedMessages, true);
	}

	getMyBestFood = async (count: number, messages: ChatCompletionMessageParam[], toolCall: ChatCompletionMessageToolCall): Promise<string> => {
		const danhsach =  await vietnamBestFoods(count);
		console.log('Danh sach: ', danhsach);
		// Ta phải gán giá trị của OpenAI trả về (assistant vào trong message chain đang có)
		return await this.callOpenAIApi(messages, toolCall.id, danhsach);
		// const updatedMessages: ChatCompletionMessageParam[] = await this.buildMessage(messages, toolCall.id, danhsach);
		// return this.openApiService.getOpenApiResponse(updatedMessages, true);
	};

	getEC2Status = async (messages: ChatCompletionMessageParam[], toolCall: ChatCompletionMessageToolCall): Promise<string> => {
		const instances = await this.awsService.listEC2Instances();
		return await this.callOpenAIApi(messages, toolCall.id, instances);
		// const updatedMessages: ChatCompletionMessageParam[] = await this.buildMessage(messages, toolCall.id, instances);
		// return this.openApiService.getOpenApiResponse(updatedMessages, true);
	};

	setAWSRegion = async (region: string, messages: ChatCompletionMessageParam[], toolCall: ChatCompletionMessageToolCall): Promise<string> => {
		const result = await this.awsService.setRegion(region);
		return await this.callOpenAIApi(messages, toolCall.id, result);
		// const updatedMessages: ChatCompletionMessageParam[] = await this.buildMessage(messages, toolCall.id, result);
		// return this.openApiService.getOpenApiResponse(updatedMessages, true);
	};

	getAWSCost = async (messages: ChatCompletionMessageParam[], toolCall: ChatCompletionMessageToolCall, start_date: string, end_date: string, granularity: GranularityType='MONTHLY', metrics: MetricsType[]=['AmortizedCost']): Promise<string> => {
		const costResult = await this.awsService.getAWSCost(start_date, end_date, granularity, metrics);
		return await this.callOpenAIApi(messages, toolCall.id, JSON.stringify(costResult));
		// const updatedMessages: ChatCompletionMessageParam[] = await this.buildMessage(messages, toolCall.id, result);
		// return this.openApiService.getOpenApiResponse(updatedMessages, true);
	};

	async processToolChain(toolCall: ChatCompletionMessageToolCall, messages: ChatCompletionMessageParam[]) {

		const { name: funcName, arguments: args } = toolCall.function;
		const parsedArgs = JSON.parse(args);
		console.log(toolCall);

		switch (funcName) {
			case 'getMyBestFood':
				return await this.getMyBestFood(parsedArgs.count, messages, toolCall);
			case 'getEC2Status':
				return await this.getEC2Status(messages, toolCall);
			case 'setAWSRegion':
				return await this.setAWSRegion(parsedArgs.region, messages, toolCall);
			case 'getAWSCost':
				const start_date: string = parsedArgs.start_date;
				const end_date: string = parsedArgs.end_date;
				const granularity: GranularityType = parsedArgs.granularity;
				const metrics: MetricsType[] = parsedArgs.metrics;
				return await this.getAWSCost(messages, toolCall, start_date, end_date, granularity, metrics);
				
		}
	}
}
