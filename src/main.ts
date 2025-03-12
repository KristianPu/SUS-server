import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  const showSwagger = !(configService.get<string>('NODE_ENV') === 'prod');
  const baseUrl = configService.get<string>('BASE_URL');

  if (baseUrl) app.setGlobalPrefix(baseUrl);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  if (showSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Url Shortener API')
      .setDescription('The Url Shortener API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      baseUrl ? `${baseUrl}/api-docs` : 'api-docs',
      app,
      document,
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggerInterceptor(logger, configService));

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
