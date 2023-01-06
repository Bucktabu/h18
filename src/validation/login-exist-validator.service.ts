import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../modules/super-admin/infrastructure/entity/user.entity';
import { PgUsersRepository } from '../modules/super-admin/infrastructure/pg-users.repository';
import { PgQueryUsersRepository } from '../modules/super-admin/infrastructure/pg-query-users.repository';

@Injectable()
@ValidatorConstraint({ name: 'login', async: true })
export class LoginExistValidator implements ValidatorConstraintInterface {
  constructor(protected queryUsersRepository: PgQueryUsersRepository) {}

  async validate(login) {
    const user = await this.queryUsersRepository.getUserByLoginOrEmail(login);

    if (user) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This login already exists';
  }
}
