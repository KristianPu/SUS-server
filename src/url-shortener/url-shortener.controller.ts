import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { UrlShortenerService } from './url-shortener.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post()
  async shortenUrl(@Body() shortenUrlDto: ShortenUrlDto) {
    return await this.urlShortenerService.createShortUrl(shortenUrlDto);
  }

  @Get(':id')
  async getUrl(@Param('id') id: string) {
    return await this.urlShortenerService.getUrl(id);
  }
}
