import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { KeycloakConfigService } from './keycloak-config.service';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

@Global()
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
      imports: [ConfigModule],
    }),
    ConfigModule,
  ],
  providers: [AuthService],
  exports: [AuthService, KeycloakConnectModule],
})
export class AuthModule {}
