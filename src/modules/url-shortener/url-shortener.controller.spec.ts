import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
import { Url, UrlSchema } from './schema/url.schema';
import { validate } from '../../config/env';

describe('UrlShortenerController', () => {
  let controller: UrlShortenerController;

  const mockUrlShortenerService = {
    createShortUrl: jest.fn((dto) => {
      return {};
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          validate,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
      ],
      controllers: [UrlShortenerController],
      providers: [UrlShortenerService],
    })
      // .overrideProvider(UrlShortenerService)
      // .useValue(mockUrlShortenerService)
      .compile();

    controller = module.get<UrlShortenerController>(UrlShortenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create shortened url', () => {
    expect(
      controller.shortenUrl({
        url: 'https://www.youtube.com/',
        shrotenUrlBase: 'testBase',
      }),
    ).toMatch(/^testBase\/[a-zA-Z0-9_-]{21}$/);
  });
});
