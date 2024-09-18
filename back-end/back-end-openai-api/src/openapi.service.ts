import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai'; // Sử dụng OpenAI từ phiên bản mới

import * as readline from 'readline';
import * as path from 'path';

import * as fs from 'fs/promises'; // Sử dụng fs.promises để làm việc với async/await

// Định nghĩa FunctionDefinition
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

// Định nghĩa ChatCompletionTool dựa trên FunctionDefinition
interface ChatCompletionTool {
  function: FunctionDefinition;
  type: 'function';
}

// Định nghĩa kiểu message
type Message =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; function_call?: any; tool_calls?: any }
  | { role: 'tool'; name: string; content: string; tool_call_id: string };

@Injectable()
export class OpenApiService {
  private openai: OpenAI;

  constructor() {
    // Khởi tạo OpenAI với API Key từ biến môi trường
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  async getOpenApiResponse(messages: Message[]): Promise<string> {
    try {
      const tools: ChatCompletionTool[] = [
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
      ]

      // Gọi API từ OpenAI với lịch sử tin nhắn
      const response = await this.openai.chat.completions.create({
        model: process.env.GPT_MODEL,
        messages, // Gửi lịch sử tin nhắn tới OpenAI với đúng kiểu dữ liệu
        tools: tools,
      });

      const messageResponse: Message = response.choices[0].message;

      console.log('Từ OpenAI tra ve: ', response.choices[0]);
      if (messageResponse.tool_calls) {
        const toolCall = response.choices[0].message.tool_calls[0];

        const { name: funcName, arguments: args } = toolCall.function;
        const parsedArgs = JSON.parse(args);
        console.log(toolCall)

        if (funcName === 'getMyBestFood') {
          const danhsach = await getMyBestFood(parsedArgs.count);

          console.log('Danh sach: ', danhsach);

          // Ta phải gán giá trị của OpenAI trả về (assistant vào trong message chain đang có)

          const updatedMessages: Message[] = [
            ...messages,
            messageResponse,
            {
              role: 'tool',
              name: 'getMyBestFood',
              tool_call_id: toolCall.id, // Gắn ID của tool call
              content: JSON.stringify({ danhsach }) // Trả về danh sách món ăn
            }
          ];

          console.log('updatedMessages: ', updatedMessages);

          // Gửi updatedMessages trở lại OpenAI
          const response = await this.openai.chat.completions.create({
            model: process.env.GPT_MODEL,
            messages: updatedMessages, // Gửi toàn bộ messages đã append
          });

          console.log("--> ", response);

          // Trả về nội dung tin nhắn phản hồi của AI
          return response.choices[0].message.content; 
        }
      }

      console.log("--> ", response.choices[0].message.content);


      // Trả về nội dung tin nhắn phản hồi của AI
      return response.choices[0].message.content;
    } catch (error) {
      console.log(error.message);
      throw new Error('Failed to get response from OpenAI');
    }
  }
}

// const getMyBestFood = async (count: number): Promise<string> => {
//   const filePath = path.join(process.cwd(), './docs/100_vietnamese_dishes.txt');
//   console.log('Số lượng: ', count);

//   try {
//     const lines: string[] = [];

//     // Sử dụng Promise để xử lý async/await
//     const rl = readline.createInterface({
//       input: fs.createReadStream(filePath),
//       crlfDelay: Infinity,
//     });

//     for await (const line of rl) {
//       lines.push(`- ${line}`);
//       if (lines.length == count) {
//         rl.close(); // Đóng stream sau khi đủ số lượng
//         break;
//       }
//     }

//     return lines.join('\n');
//   } catch (err) {
//     console.error('Lỗi:', err);
//     throw err;
//   }
// };

// const getMyBestFood = async (count: number): Promise<string> => {
//   const filePath = path.join(process.cwd(), './docs/100_vietnamese_dishes.txt');
//   console.log('Số lượng: ', count);

//   try {
//     const lines: string[] = [];

//     // Sử dụng readline để đọc tất cả các dòng trong file
//     const rl = readline.createInterface({
//       input: fs.createReadStream(filePath),
//       crlfDelay: Infinity,
//     });

//     // Đọc toàn bộ file và lưu từng dòng vào mảng `lines`
//     for await (const line of rl) {
//       lines.push(line);
//     }

//     // Nếu số lượng yêu cầu nhiều hơn số dòng hiện có, trả về tất cả các dòng
//     if (count >= lines.length) {
//       return lines.join(', ');
//     }

//     // Chọn ngẫu nhiên `count` dòng từ mảng `lines`
//     const randomLines: string[] = [];
//     const usedIndices: Set<number> = new Set();

//     while (randomLines.length < count) {
//       const randomIndex = Math.floor(Math.random() * lines.length);
//       if (!usedIndices.has(randomIndex)) {
//         randomLines.push(lines[randomIndex]);
//         usedIndices.add(randomIndex);
//       }
//     }

//     return randomLines.join(', ');
//   } catch (err) {
//     console.error('Lỗi:', err);
//     throw err;
//   }
// };

const getMyBestFood = async (count: number): Promise<string> => {
  const filePath = path.join(process.cwd(), './docs/100_vietnamese_dishes.txt');
  console.log('Số lượng: ', count);

  try {
    // Đọc toàn bộ nội dung file một lần
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Tách nội dung thành từng dòng
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Nếu số lượng yêu cầu lớn hơn hoặc bằng số dòng hiện có, trả về tất cả các dòng
    if (count >= lines.length) {
      return lines.join('\n');
    }

    // Chọn ngẫu nhiên `count` dòng từ mảng `lines`
    const randomLines: string[] = [];
    const usedIndices: Set<number> = new Set();

    while (randomLines.length < count) {
      const randomIndex = Math.floor(Math.random() * lines.length);
      if (!usedIndices.has(randomIndex)) {
        randomLines.push(`- ${lines[randomIndex]}`);
        usedIndices.add(randomIndex);
      }
    }

    return randomLines.join('\n');
  } catch (err) {
    console.error('Lỗi:', err);
    throw err;
  }
};