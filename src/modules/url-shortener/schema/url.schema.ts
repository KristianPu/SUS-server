import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UrlDocument = HydratedDocument<Url>;

@Schema()
export class Url {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  shortUrl: string;

  @Prop({ required: true, default: 0 })
  clicks: number;

  @Prop({ default: Date.now() })
  dateCreated: string;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
