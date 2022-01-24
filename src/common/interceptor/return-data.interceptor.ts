import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// @todo: Sanitation of data
const sanitizeMongooseData = (d: any) => {
  if (d?.toJSON) {
    d = d.toJSON();
  }
  if (Array.isArray(d)) {
    d = d.map((subData) => sanitizeMongooseData(subData));
  } else if (typeof d === 'object' && d !== null) {
    if (d?._id !== undefined) {
      delete d._id;
    }
    if (d?.__v !== undefined) {
      delete d.__v;
    }
    if (d?.deletedAt !== undefined) {
      delete d.deletedAt;
    }
    Object.getOwnPropertyNames(d).forEach((key) => {
      d[key] = sanitizeMongooseData(d[key]);
    });
  }
  return d;
};

@Injectable()
export class ReturnDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return next.handle().pipe(map((data) => sanitizeMongooseData(data)));
    }
    return next.handle();
  }
}
