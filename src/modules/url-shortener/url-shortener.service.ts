import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';

import { Url } from './schema/url.schema';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class UrlShortenerService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async createShortUrl(shortenUrlDto: ShortenUrlDto) {
    const { originalUrl, shrotenUrlBase } = shortenUrlDto;
    const urlHash = nanoid();

    if (!this.isValidUrl(originalUrl))
      return new BadRequestException('Invalid url');

    try {
      const currentUrl = await this.urlModel.findOne({ originalUrl }).exec();
      if (currentUrl) return currentUrl;

      const shortUrl = `${shrotenUrlBase}-${urlHash}`;
      return new this.urlModel({
        originalUrl,
        shortUrl,
        clicks: 0,
      }).save();
    } catch (error) {
      console.log(error);
    }
  }

  async getUrl(urlHash: string): Promise<Url> | null {
    try {
      const url = await this.urlModel.findOne({ shortUrl: urlHash }).exec();
      console.log(url, '1', urlHash);
      if (url) {
        await url
          .updateOne({ shortUrl: urlHash }, { $inc: { clicks: 1 } })
          .exec();
        return url;
      }
      return null;
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
