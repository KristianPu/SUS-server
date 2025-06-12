import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { UrlShortenerService } from './url-shortener.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post()
  async shortenUrl(@Body() shortenUrlDto: ShortenUrlDto) {
    return await this.urlShortenerService.createShortUrl(shortenUrlDto);
  }

  @Get(':urlHash')
  async redirectToOriginalUrl(
    @Param('urlHash') urlHash: string,
    @Res() res: Response,
  ) {
    const url = await this.urlShortenerService.getUrl(urlHash);
    if (!url) {
      return res.status(404).send('URL not found');
    }
    return res.redirect(301, url.originalUrl);
  }
}
