import { ChatCompletionTool } from 'openai/resources';

export const functionToolsDefine: ChatCompletionTool[] = [
	{
		type: "function",
		function: {
			name: 'getMyBestFood',
			description: `Danh sách đồ ăn ngon Việt Nam. Không gọi hàm này nếu không có chữ Việt Nam, mà thay vào đó dùng GPT để trả về kết quả`,
			parameters: {
				type: 'object',
				properties: {
					count: {
						type: 'string',
						description: 'Lấy bao nhiêu món',
					},
				},
				required: ['count'],
			},
		}
	}
];