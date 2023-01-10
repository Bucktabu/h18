import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './modules/super-admin/api/users.controller';
import { JwtService } from './modules/public/auth/application/jwt.service';
import { AuthController } from './modules/public/auth/api/auth.controller';
import { SecurityController } from './modules/public/security/api/security.controller';
import { TestingController } from './modules/testing/testingController';
import { AuthService } from './modules/public/auth/application/auth.service';
import { EmailConfirmationService } from './modules/super-admin/application/emailConfirmation.service';
import { EmailAdapters } from './modules/public/auth/email-transfer/email.adapter';
import { EmailManager } from './modules/public/auth/email-transfer/email.manager';
import { SecurityService } from './modules/public/security/application/security.service';
import { EmailExistValidator } from './validation/email-exist-validator.service';
import { LoginExistValidator } from './validation/login-exist-validator.service';
import { ConfirmationCodeValidator } from './validation/confirmation-code.validator';
import { CreateUserBySaUseCase } from './modules/super-admin/use-cases/create-user-by-sa.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgJwtRepository } from './modules/public/auth/infrastructure/pg-jwt.repository';
import { UsersService } from './modules/super-admin/application/users.service';
import { PgBanInfoRepository } from './modules/super-admin/infrastructure/pg-ban-info.repository';
import { PgEmailConfirmationRepository } from './modules/super-admin/infrastructure/pg-email-confirmation.repository';
import { PgUsersRepository } from './modules/super-admin/infrastructure/pg-users.repository';
import { UserBanInfo } from './modules/super-admin/infrastructure/entity/userBanInfo';
import { EmailConfirmation } from './modules/super-admin/infrastructure/entity/email-confirmation.entity';
import { Users } from './modules/super-admin/infrastructure/entity/users';
import { PgSecurityRepository } from './modules/public/security/infrastructure/pg-security.repository';
import { PgQuerySecurityRepository } from './modules/public/security/infrastructure/pg-query-security.repository';
import { CreateUserUseCase } from './modules/super-admin/use-cases/create-user.use-case';
import { PgQueryUsersRepository } from './modules/super-admin/infrastructure/pg-query-users.repository';
import { EmailResendingValidator } from './validation/email-resending.validator';
import { ThrottlerModule } from '@nestjs/throttler';
import { settings } from './settings';
import { Security } from "./modules/public/security/infrastructure/entity/security";
import { TokenBlackList } from "./modules/public/auth/infrastructure/entity/tokenBlackList";
import { Blogs } from "./modules/public/blogs/infrastructure/entity/blogs.entity";
import {
  BannedUsersForBlog,
} from "./modules/public/blogs/infrastructure/entity/banned-users-for-blog.entity";

const controllers = [
  AuthController,
  SecurityController,
  TestingController,
  UsersController,
];

 const entity = [
   UserBanInfo,
   Blogs,
   BannedUsersForBlog,
   EmailConfirmation,
   TokenBlackList,
   Security,
   Users
 ];

const repositories = [
  PgBanInfoRepository,
  PgEmailConfirmationRepository,
  PgJwtRepository,
  PgSecurityRepository,
  PgQuerySecurityRepository,
  PgUsersRepository,
  PgQueryUsersRepository,
];

const services = [
  AuthService,
  EmailAdapters,
  EmailManager,
  EmailConfirmationService,
  JwtService,
  SecurityService,
  UsersService,
];

const validators = [
  /*BlogExistValidator,*/
  ConfirmationCodeValidator,
  EmailResendingValidator,
  EmailExistValidator,
  LoginExistValidator,
];

const useCases = [CreateUserUseCase, CreateUserBySaUseCase];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.POSTGRES_URI,
      // host: 'localhost',
      // port: Number(settings.postgres.PORT),
      // username: settings.postgres.USERNAME,
      // password: settings.postgres.PASSWORD,
      // database: settings.postgres.DATABASE_NAME,
      entities: [...entity],
      autoLoadEntities: true,
      synchronize: true,
    }),
    // ThrottlerModule.forRoot({
    //   ttl: Number(settings.throttler.CONNECTION_TIME_LIMIT),
    //   limit: Number(settings.throttler.CONNECTION_COUNT_LIMIT)
    // }),
  ],
  controllers: [...controllers],
  providers: [...repositories, ...services, ...validators, ...useCases],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {}
}
