import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MediaResourceInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const args = context.getArgs();
    const bodyResourceType = args?.[0]?.body?.resourceType;
    const bodyResourceId = args?.[0]?.body?.resourceId;
    if (bodyResourceType && bodyResourceId) {
      const resourceType = bodyResourceType?.toLowerCase?.()?.trim?.();
      if (!resourceType) {
        throw new BadRequestException('Invalid resourceType.');
      }

      const resourceId = bodyResourceId?.trim?.() ?? '';
      if (!resourceId) {
        throw new BadRequestException(
          'Empty resourceId! Please provide a valid resource ID for the media',
        );
      }
    }
    return next.handle();
  }
}
