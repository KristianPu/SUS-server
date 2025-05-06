import { Module } from '@nestjs/common';

import { LinkDetailService } from './link-detail.service';
import { LinkDetailController } from './link-detail.controller';

@Module({
  imports: [],
  controllers: [LinkDetailController],
  providers: [LinkDetailService],
})
export class LinkDetailModule {}
