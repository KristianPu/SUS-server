import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { UrlShortenerModule } from './modules/url-shortener/url-shortener.module';
import { validate } from './config/env';
import { UserModule } from './modules/user/user.module';
import { JwtGlobalModule } from './guards/jwt.module';
import { LinkDetailModule } from './modules/link-detail/link-detail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('SUS-server', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UrlShortenerModule,
    UserModule,
    LinkDetailModule,
    JwtGlobalModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
