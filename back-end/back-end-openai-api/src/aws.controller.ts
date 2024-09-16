import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AwsService } from './aws.service';

@ApiTags('aws')
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('configure')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        awsKey: { type: 'string', description: 'AWS Access Key ID' },
        awsSecretKey: { type: 'string', description: 'AWS Secret Access Key' },
      },
      required: ['awsKey', 'awsSecretKey'],
    },
  })
  configureAws(
    @Body('awsKey') awsKey: string, 
    @Body('awsSecretKey') awsSecretKey: string
  ): string {
    this.awsService.cau_hinh_aws(awsKey, awsSecretKey);
    return 'AWS configuration updated';
  }

  @Get('ec2')
  async listEC2Instances(): Promise<any> {
    return this.awsService.listEC2Instances();
  }
}
