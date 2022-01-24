import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, lastValueFrom } from 'rxjs';
import libValidate from 'deep-email-validator';
import { IEmailValidator } from './interface';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class ZerobounceValidator implements IEmailValidator {
  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private validateFromResponse(zerobounceResponse: any) {
    if (['spamtrap', 'invalid'].includes(zerobounceResponse?.status)) {
      return false;
    }
    if (
      ['valid', 'catch-all', 'unknown', 'abuse'].includes(
        zerobounceResponse?.status,
      )
    ) {
      return true;
    }

    if (zerobounceResponse?.status === 'do_not_mail') {
      // check for sub status
      if (
        ['disposable', 'global_suppression', 'toxic'].includes(
          zerobounceResponse?.sub_status,
        )
      ) {
        return false;
      }
    }
    return true;
  }

  async isValid(email: string) {
    try {
      const localEmailValidation = await libValidate({
        email: email,
        sender: email,
        validateRegex: true,
        validateMx: true,
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: false,
      });
      if (!localEmailValidation.valid) {
        return false;
      }
    } catch {}
    let zerobounceApiKeyUsage: any = await this.cacheService.get(
      'zerobounce.key.usage',
    );
    const lastKeyIndex = zerobounceApiKeyUsage?.keyIndex ?? -1;

    const emailCachedValidation: any = await this.cacheService.get(
      `zerobounce.email.${email}`,
    );
    if (emailCachedValidation) {
      return this.validateFromResponse(emailCachedValidation);
    }
    // If the email was validated within last 12 hours, then use it from cache instead.

    // With free account on zerobounce we can only use API key 100 times
    // So if we receive response from the API, it is fine we use it
    // else we allow the email to be valid anyhow
    const zerobounceApiKeys = this.configService.get('app.zerobounceApiKeys');
    if (!zerobounceApiKeys.length) {
      return true;
    }

    try {
      const indexToBeUsed =
        lastKeyIndex + 1 >= zerobounceApiKeys.length ? 0 : lastKeyIndex + 1;
      const keyToUse =
        zerobounceApiKeys?.[indexToBeUsed] ?? zerobounceApiKeys[0];
      const data = await lastValueFrom(
        this.httpService
          .get(
            `https://api.zerobounce.net/v2/validate?api_key=${keyToUse}&email=${email}`,
          )
          .pipe(map((response) => response.data)),
      );
      zerobounceApiKeyUsage = {
        keyIndex: indexToBeUsed,
      };
      await this.cacheService.set(`zerobounce.email.${email}`, data, {
        ttl: 12 * 60 * 60,
      });
      await this.cacheService.set(
        'zerobounce.key.usage',
        zerobounceApiKeyUsage,
      );
      return this.validateFromResponse(data);
    } catch {
      return true;
    }
  }
}
