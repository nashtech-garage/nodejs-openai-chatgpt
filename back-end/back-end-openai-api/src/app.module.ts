import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenApiController } from './modules/open-api/openapi.controller';
import { OpenApiService } from './modules/open-api/openapi.service';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { FunctionToolsService } from './modules/open-api/function-tools.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Đảm bảo biến môi trường khả dụng toàn bộ ứng dụng
    }),
  ],
  controllers: [AppController, OpenApiController, AwsController],
  providers: [
    AppService, 
    OpenApiService,
    {
      provide: 'FUNCTION_TOOLS_SERVICES',
      useFactory: () => forwardRef(() => FunctionToolsService),
    },
    FunctionToolsService,
    AwsService
  ],
})
export class AppModule {}
