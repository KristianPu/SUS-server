import { Test, TestingModule } from '@nestjs/testing';

import { UrlShortenerController } from '../url-shortener.controller';
import { UrlShortenerService } from '../url-shortener.service';

describe('UrlShortenerController', () => {
  let controller: UrlShortenerController;

  const mockUrlShortenerService = {
    createShortUrl: jest.fn((dto) => {
      const urlId = '123456789';
      return {
        urlId,
        originalUrl: dto.url,
        shortUrl: `${dto.shrotenUrlBase}/${urlId}`,
        clicks: 0,
        dateCreated: new Date(),
      };
    }),
    getUrl: jest.fn((url) => {
      return {
        urlId: '123456789',
        originalUrl: url,
        shortUrl: 'testBase/123456789',
        clicks: 0,
        dateCreated: new Date(),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [UrlShortenerService],
    })
      .overrideProvider(UrlShortenerService)
      .useValue(mockUrlShortenerService)
      .compile();

    controller = module.get<UrlShortenerController>(UrlShortenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create shortened url', async () => {
    expect(
      await controller.shortenUrl({
        url: 'https://www.youtube.com/',
        shrotenUrlBase: 'testBase',
      }),
    ).toEqual({
      urlId: expect.any(String),
      originalUrl: 'https://www.youtube.com/',
      shortUrl: 'testBase/123456789',
      clicks: 0,
      dateCreated: expect.any(Date),
    });
  });

  it('should get url', async () => {
    expect(await controller.getUrl('https://www.youtube.com/')).toEqual({
      urlId: expect.any(String),
      originalUrl: 'https://www.youtube.com/',
      shortUrl: 'testBase/123456789',
      clicks: 0,
      dateCreated: expect.any(Date),
    });
  });
});
