import { Injectable } from '@nestjs/common';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { CostExplorerClient, GetCostAndUsageCommand, GetCostAndUsageCommandInput, GetCostAndUsageCommandOutput } from '@aws-sdk/client-cost-explorer';

// Định nghĩa kiểu cho tham số granularity
type GranularityType = 'DAILY' | 'MONTHLY' | 'HOURLY';

// Định nghĩa kiểu cho tham số metrics
type MetricsType = 'BlendedCost' | 'UnblendedCost' | 'AmortizedCost';

@Injectable()
export class AwsService {
  private ec2Client: EC2Client;
  private costClient: CostExplorerClient;
  private awsKey: string;
  private awsSecretKey: string;
  private region: string = 'us-east-1';

  constructor() {
    this.awsKey = process.env.AWS_KEY;
    this.awsSecretKey = process.env.AWS_SECRET_KEY;
    this.createEc2Client();
    this.createCostClient();
  }

  async createEc2Client(): Promise<void> {
    const region = this.region;
    this.ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: this.awsKey,
        secretAccessKey: this.awsSecretKey,
      },
    });
  }

  async createCostClient(): Promise<void> {
    const region = this.region;
    this.ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: this.awsKey,
        secretAccessKey: this.awsSecretKey,
      },
    });

    this.costClient = new CostExplorerClient({
      region,
      credentials: {
        accessKeyId: this.awsKey,
        secretAccessKey: this.awsSecretKey,
      },
    });

  }

  async setRegion(region: string='us-east-1'): Promise<string> {
    this.region = region;
    await this.createEc2Client();
    await this.createCostClient();
    return 'Done';
  }

  // Liệt kê các EC2 instances sử dụng AWS SDK v3
  async listEC2Instances(): Promise<any> {
    const command = new DescribeInstancesCommand({});
    try {
      const instances = await this.ec2Client.send(command);
      return instances.Reservations;
    } catch (error) {
      throw new Error('Error fetching EC2 instances');
    }
  }

  // Hàm lấy chi phí từ AWS Cost Explorer
  // Hàm lấy chi phí từ AWS Cost Explorer
async getAWSCost(start_date: string, end_date: string, granularity: GranularityType='MONTHLY', metrics: MetricsType[]=['AmortizedCost']): Promise<GetCostAndUsageCommandOutput | undefined> {

    // Tạo command để lấy chi phí
    const params: GetCostAndUsageCommandInput = {
      TimePeriod: {
        Start: start_date, // Ngày bắt đầu (YYYY-MM-DD)
        End: end_date,   // Ngày kết thúc (YYYY-MM-DD)
      },
      Granularity: granularity, // Có thể là DAILY, MONTHLY, hoặc HOURLY
      Metrics: metrics, // Có thể là 'BlendedCost', 'UnblendedCost', hoặc 'AmortizedCost'
    };

    try {
      // Gọi API để lấy chi phí
      const command = new GetCostAndUsageCommand(params);
      const response = await this.costClient.send(command);
      
      // Trả về kết quả
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy chi phí từ AWS:', error);
      throw error;
    }
  };

}
