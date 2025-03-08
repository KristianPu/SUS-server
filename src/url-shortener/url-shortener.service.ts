import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Url } from '../schemas/url.schema';

@Injectable()
export class UrlShortenerService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async createShortUrl(originalUrl: string): Promise<Url> {
    const base = 'basetext';
    const urlId = nanoid();

    try {
      let url = this.urlModel.findOne({ originalUrl });
      console.log(url, 'NISTA', typeof url);
      if (url) return url;

      const shortUrl = `${base}/${urlId}`;
      const newUrl = new this.urlModel({ originalUrl, shortUrl, clicks: 0 });
      return newUrl.save();
    } catch (error) {
      console.log(error);
    }
  }

  async getUrl(urlId: number): Promise<string> {
    try {
      const url = await this.urlModel.findOne({ urlId });
      if (url) {
        await url.updateOne({ urlId }, { $inc: { clicks: 1 } });
        return url.originalUrl;
      }
    } catch (error) {
      console.log(error);
    }
  }

  validateUrl(value: string) {
    return new RegExp(
      '/^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:[/?#]\\S*)?$/i',
    ).test(value);
  }
}
