import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env';

import { UrlShortenerModule } from './url-shortener/url-shortener.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'mandm',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UrlShortenerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
