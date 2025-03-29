import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Url } from './schema/url.schema';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class UrlShortenerService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async createShortUrl(shortenUrlDto: ShortenUrlDto) {
    const { url, shrotenUrlBase } = shortenUrlDto;
    const urlHash = nanoid();

    if (!this.isValidUrl(url)) return new BadRequestException('Invalid url');

    try {
      const currentUrl = await this.urlModel.findOne({ url }).exec();
      if (currentUrl) return currentUrl;

      const shortUrl = `${shrotenUrlBase}/${urlHash}`;
      return new this.urlModel({
        url,
        shortUrl,
        clicks: 0,
      }).save();
    } catch (error) {
      console.log(error);
    }
  }

  async getUrl(originalUrl: string): Promise<Url> {
    try {
      const url = await this.urlModel.findOne({ originalUrl }).exec();
      if (url) {
        return await url.updateOne({ originalUrl }, { $inc: { clicks: 1 } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  isValidUrl(url: string) {
    return /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
      url,
    );
  }
}
