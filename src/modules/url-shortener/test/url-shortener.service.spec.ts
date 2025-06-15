import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UrlShortenerService } from '../url-shortener.service';
import { Url } from '../schema/url.schema';

jest.mock('nanoid', () => ({
  nanoid: () => '123abc',
}));

const mockUrl = {
  _id: 'mockId',
  urlId: '123abc',
  url: 'https://example.com',
  shortUrl: 'https://sho.rt/123abc',
  clicks: 0,
};

const mockUrlModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  updateOne: jest.fn(),
};

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let model: Model<Url>;

  beforeEach(async () => {
    const modelMock = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlShortenerService,
        {
          provide: getModelToken(Url.name),
          useValue: Object.assign(function FakeModel(this: any, data: any) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue(mockUrl);
          }, modelMock),
        },
      ],
    }).compile();

    service = module.get<UrlShortenerService>(UrlShortenerService);
    model = module.get<Model<Url>>(getModelToken(Url.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidUrl', () => {
    it('should return true for a valid URL', () => {
      expect(service.isValidUrl('https://example.com')).toBe(true);
    });

    it('should return false for an invalid URL', () => {
      expect(service.isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('createShortUrl', () => {
    it('should return BadRequestException for invalid URL', async () => {
      const dto = {
        originalUrl: 'invalid-url',
        shrotenUrlBase: 'https://sho.rt',
      };
      const result = await service.createShortUrl(dto);
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return existing shortened URL if already exists', async () => {
      const dto = {
        originalUrl: 'https://example.com',
        shrotenUrlBase: 'https://sho.rt',
      };
      const existingUrl = { ...mockUrl };

      (model.findOne as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(existingUrl),
      });

      const result = await service.createShortUrl(dto);
      expect(result).toEqual(existingUrl);
    });

    it('should create and return new short URL', async () => {
      (model.findOne as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const dto = {
        originalUrl: 'https://example.com',
        shrotenUrlBase: 'https://sho.rt',
      };

      const result = await service.createShortUrl(dto);

      expect(result).toEqual(mockUrl);
    });
  });

  describe('getUrl', () => {
    it('should return null if url is not found', async () => {
      (model.findOne as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getUrl('https://example.com');
      expect(result).toBeUndefined();
    });

    it('should increment clicks and return url if found', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        updateOne: jest.fn().mockResolvedValue(mockUrl),
      });

      (model.findOne as jest.Mock).mockReturnValueOnce({
        exec: mockExec,
      });

      const result = await service.getUrl('https://example.com');
      expect(result).toEqual(mockUrl);
    });
  });
});
