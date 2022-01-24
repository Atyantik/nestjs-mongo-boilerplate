import { default as textSlugify } from 'slugify';
import ShortUniqueId from 'short-unique-id';

export const slugify = (str: string) =>
  textSlugify(str, {
    lower: true,
    strict: true,
    trim: true,
  });

export const shortId = new ShortUniqueId({ length: 6 });
export const mediaShortId = new ShortUniqueId({ length: 32 });
export const votingShortId = new ShortUniqueId({ length: 32 });
export const reviewShortId = new ShortUniqueId({ length: 32 });
export const reviewVerificationShortId = new ShortUniqueId({ length: 16 });
