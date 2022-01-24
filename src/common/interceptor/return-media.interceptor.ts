import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { URL } from 'url';

// @todo: Sanitation of data
const SanitizeMediaUrl = (
  d: any,
  options = {
    isMediaArray: false,
    bucket: '',
    bucketReplaceOrigin: '',
  },
) => {
  if (d?.toJSON) {
    d = d.toJSON();
  }
  if (Array.isArray(d)) {
    /**
     * @todo do something with media options
     */
    d = d.map((subData) => SanitizeMediaUrl(subData, options));
  } else if (typeof d === 'object' && d !== null) {
    let mediaList: any[] = [];
    if (d?.media) {
      mediaList = d?.media || [];
      if (!Array.isArray(mediaList)) {
        mediaList = [mediaList];
      }
    } else if (options.isMediaArray) {
      mediaList = [d];
    }
    mediaList.forEach((media) => {
      if (media?.key) {
        let pathname = media.key;
        if (!pathname.startsWith('/')) {
          pathname = `/${pathname}`;
        }
        media.filepath = pathname
          .split('/')
          .map((t) => {
            if (t.indexOf(' ') !== -1) {
              return encodeURIComponent(t);
            }
            return t;
          })
          .join('/');
      } else if (media?.location) {
        const location = media.location.startsWith('http')
          ? media.location
          : `https://${media.location}`;

        const parsedLocation = new URL(location);
        let pathname = parsedLocation.pathname;
        if (options.bucket && options.bucketReplaceOrigin) {
          if (parsedLocation.origin.indexOf(options.bucketReplaceOrigin)) {
            pathname = pathname.replace(`/${options.bucket}/`, '/');
            pathname = pathname.replace(`${options.bucket}/`, '/');
          }
        }
        media.filepath = pathname
          .split('/')
          .map((t) => {
            if (t.indexOf(' ') !== -1) {
              return encodeURIComponent(t);
            }
            return t;
          })
          .join('/');
      }
      delete media.key;
      delete media.location;
    });
    Object.getOwnPropertyNames(d).forEach((key) => {
      d[key] = SanitizeMediaUrl(d[key], options);
    });
  }
  return d;
};

@Injectable()
export class ReturnMediaInterceptor implements NestInterceptor {
  private bucket = process.env?.MEDIA_BUCKET ?? '';
  private bucketReplaceOrigin = process.env?.MEDIA_ENDPOINT ?? '';
  private options = {
    isMediaArray: false,
    bucket: '',
    bucketReplaceOrigin: '',
  };

  constructor(options = { isMediaArray: false }) {
    let bucketReplaceOrigin = '';
    if (this.bucketReplaceOrigin) {
      try {
        const url = new URL(this.bucketReplaceOrigin);
        bucketReplaceOrigin = url.origin;
      } catch {}
    }
    this.options = {
      isMediaArray: options.isMediaArray,
      bucket: this.bucket,
      bucketReplaceOrigin,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return next
        .handle()
        .pipe(map((data) => SanitizeMediaUrl(data, this.options)));
    }
    return next.handle();
  }
}
