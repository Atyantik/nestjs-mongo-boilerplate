import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MailerService } from './mailer.service';
import { ZerobounceValidator } from './validators/zerobounce.validator';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [MailerService, ZerobounceValidator],
  exports: [MailerService],
})
export class MailerModule {}
