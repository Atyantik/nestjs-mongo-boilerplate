import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async getUsers() {
    const authorization = this.request.headers.authorization ?? '';
    const token = authorization.replace(/bearer /i, '');
    const kcAdmin = new KcAdminClient({
      baseUrl: this.configService.get('app.keycloak.baseUrl'),
      realmName: this.configService.get('app.keycloak.realm'),
    });
    kcAdmin.setAccessToken(token);
    const users = await kcAdmin.users.find();
    return users;
  }
}
