import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ShortenUrlDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  originalUrl: string;
}
