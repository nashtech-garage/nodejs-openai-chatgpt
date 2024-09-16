import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenApiController } from './openapi.controller';
import { OpenApiService } from './openapi.service';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Đảm bảo biến môi trường khả dụng toàn bộ ứng dụng
    }),
  ],
  controllers: [AppController, OpenApiController, AwsController],
  providers: [AppService, OpenApiService, AwsService],
})
export class AppModule {}
