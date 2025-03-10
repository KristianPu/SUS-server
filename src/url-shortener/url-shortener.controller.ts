import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { UrlShortenerService } from './url-shortener.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post()
  shorten(@Body() shortenUrlDto: ShortenUrlDto) {
    return this.urlShortenerService.createShortUrl(shortenUrlDto);
  }

  @Get(':id')
  getUrl(@Param('id') id: string) {
    return this.urlShortenerService.getUrl(id);
  }
}
