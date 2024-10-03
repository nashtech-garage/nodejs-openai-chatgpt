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
  }, 
  {
    type: "function",
    function: {
      name: 'getEC2Status',
      description: `Lấy trạng thái thông tin của EC2.`,
      parameters: {
        type: 'object',
        properties: {
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: 'setAWSRegion',
      description: `Thay đổi region của AWS. Hàm này chỉ được gọi khi muốn thay đổi region của AWS
      Không gọi khi người dùng muốn biết region đang sử dụng`,
      parameters: {
        type: 'object',
        properties: {
          region: {
            type: 'string',
            description: 'Region cần set trong AWS',
          },
        },
        required: ['region'],
      },
    },
  }, 
  {
    type: "function",
    function: {
      name: 'getAWSCost',
      description: `Lấy cost của AWS theo thời điểm. Hàm này được gọi khi người dùng muốn biết chi phí họ đang phải trả cho AWS.
      Ta cần thông tin về start date, end date trước khi gọi hàm.
      Start Date, End Date khi đưa vào hàm cần có định dạng YYYY-MM-DD
      granularity chỉ cho phép 'DAILY' | 'MONTHLY' | 'HOURLY'
      metrics cho phép 'BlendedCost' | 'UnblendedCost' | 'AmortizedCost', metrics cần là 1 mảng string`,
      parameters: {
        type: 'object',
        properties: {
          start_date: {
            type: 'string',
            description: 'Thông tin start date trong phần tính cost',
          },
          end_date: {
            type: 'string',
            description: 'Thông tin end date trong phần tính cost',
          },
          granularity: {
            type: 'string',
            enum: ["DAILY", "MONTHLY", "HOURLY"],
            description: 'Thông tin granularity trong phần tính cost',
          },
          metrics: {
            type: 'array',
            items: {
              type: "string", // Định nghĩa kiểu phần tử trong mảng
              enum: ["BlendedCost", "UnblendedCost", "AmortizedCost"], // Ví dụ các giá trị hợp lệ
            },
            description: 'Thông tin metrics trong phần tính cost',
          }
        },
        required: ['start_date', 'end_date'],
      },
    },
  }
];