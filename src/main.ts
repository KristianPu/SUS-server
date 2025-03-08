import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
