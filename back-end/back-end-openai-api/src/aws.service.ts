import { Injectable } from '@nestjs/common';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

@Injectable()
export class AwsService {
  private ec2Client: EC2Client;

  constructor() {
    // Thiết lập client cho EC2, sẽ được cấu hình khi `cau_hinh_aws` được gọi
    this.ec2Client = new EC2Client({
      region: 'us-east-1', // Thiết lập vùng mặc định, bạn có thể thay đổi
    });
  }

  // Hàm này sẽ cấu hình AWS credentials khi được gọi từ API
  cau_hinh_aws(awsKey: string, awsSecretKey: string): void {
    process.env.AWS_ACCESS_KEY_ID = awsKey;
    process.env.AWS_SECRET_ACCESS_KEY = awsSecretKey;

    this.ec2Client = new EC2Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: awsKey,
        secretAccessKey: awsSecretKey,
      },
    });
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
}
