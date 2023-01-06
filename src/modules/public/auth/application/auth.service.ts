import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { Inject, Injectable } from '@nestjs/common';
import { EmailManager } from '../email-transfer/email.manager';
import { InjectRepository } from "@nestjs/typeorm";
import { EmailConfirmationEntity } from "../../../super-admin/infrastructure/entity/email-confirmation.entity";
import { PgEmailConfirmationRepository } from "../../../super-admin/infrastructure/pg-email-confirmation.repository";

@Injectable()
export class AuthService {
  constructor(
    protected emailConfirmationRepository: PgEmailConfirmationRepository,
    protected emailsManager: EmailManager,
  ) {}

  async sendPasswordRecovery(userId: string, email: string): Promise<boolean> {
    const newRecoveryCode = uuidv4();
    const result =
      await this.emailConfirmationRepository.updateConfirmationCode(
        userId,
        newRecoveryCode,
      );

    if (!result) {
      return false;
    }

    await this.emailsManager.sendPasswordRecoveryEmail(email, newRecoveryCode);
    return true;
  }

  async updateConfirmationCode(userId: string): Promise<string | null> {
    const newConfirmationCode = uuidv4();
    const newExpirationDate = add(new Date(), { hours: 24 });
    const result =
      await this.emailConfirmationRepository.updateConfirmationCode(
        userId,
        newConfirmationCode,
        newExpirationDate,
      );

    if (!result) {
      return null;
    }

    return newConfirmationCode;
  }
}
