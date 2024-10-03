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

	buildMessage = async (toolCallId: string, content: string): Promise<ChatCompletionMessageParam[]> => {
		const updatedMessages: ChatCompletionMessageParam[] = [{
			role: 'tool',
			tool_call_id: toolCallId, // Gắn ID của tool call
			content: JSON.stringify({ content }) // Trả về danh sách món ăn
		}]

		return updatedMessages;
	}

	getMyBestFood = async (count: number, toolCall: ChatCompletionMessageToolCall): Promise<ChatCompletionMessageParam[]> => {
		const danhsach =  await vietnamBestFoods(count);
		return await this.buildMessage(toolCall.id, danhsach);
	};

	getEC2Status = async (toolCall: ChatCompletionMessageToolCall): Promise<ChatCompletionMessageParam[]> => {
		const instances = await this.awsService.listEC2Instances();
		return await this.buildMessage(toolCall.id, instances);
	};

	setAWSRegion = async (region: string, toolCall: ChatCompletionMessageToolCall): Promise<ChatCompletionMessageParam[]> => {
		const result = await this.awsService.setRegion(region);
		return await this.buildMessage(toolCall.id, result);
	};

	getAWSCost = async (toolCall: ChatCompletionMessageToolCall, start_date: string, end_date: string, granularity: GranularityType='MONTHLY', metrics: MetricsType[]=['AmortizedCost']): Promise<ChatCompletionMessageParam[]> => {
		const costResult = await this.awsService.getAWSCost(start_date, end_date, granularity, metrics);
		return await this.buildMessage(toolCall.id, JSON.stringify(costResult));
	};

	async processToolChain(toolCall: ChatCompletionMessageToolCall): Promise<ChatCompletionMessageParam[]>  {

		const { name: funcName, arguments: args } = toolCall.function;
		const parsedArgs = JSON.parse(args);
		console.log(toolCall);

		switch (funcName) {
			case 'getMyBestFood':
				return await this.getMyBestFood(parsedArgs.count, toolCall);
			case 'getEC2Status':
				return await this.getEC2Status(toolCall);
			case 'setAWSRegion':
				return await this.setAWSRegion(parsedArgs.region, toolCall);
			case 'getAWSCost':
				const start_date: string = parsedArgs.start_date;
				const end_date: string = parsedArgs.end_date;
				const granularity: GranularityType = parsedArgs.granularity;
				const metrics: MetricsType[] = parsedArgs.metrics;
				return await this.getAWSCost(toolCall, start_date, end_date, granularity, metrics);
				
		}
	}
}
