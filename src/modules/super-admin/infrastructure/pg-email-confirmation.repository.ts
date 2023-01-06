import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmailConfirmationModel } from "./entity/emailConfirmation.model";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PgEmailConfirmationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  // async getEmailConfirmationByCodeOrId(
  //   userId: string,
  // ): Promise<EmailConfirmationModel | null> {
  //   const query = `
  //     SELECT user_id as "userId", confirmation_code as "confirmationCode", expiration_date as "expirationDate", is_confirmed as "isConfirmed"
  //       FROM public.email_confirmation
  //      WHERE user_id = '${userId}';
  //   `
  //   const result = await this.dataSource.query(query)
  //   //console.log(result, 'from email confirmation repo')
  //   return result[0]
  // }

  async getEmailConfirmationByCode(
    code: string,
  ): Promise<EmailConfirmationModel | null> {
    const query = `
      SELECT user_id as "userId", confirmation_code as "confirmationCode", expiration_date as "expirationDate", is_confirmed as "isConfirmed"
        FROM public.email_confirmation
       WHERE confirmation_code = '${code}';
    `
    const result = await this.dataSource.query(query)
    return result[0]
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    const query = `
      SELECT is_confirmed
        FROM public.email_confirmation
       WHERE user_id = $1;
    `
    const result = await this.dataSource.query(query, [ userId ])

    if (!result.length) {
      return null
    }
    return result[0].is_confirmed
  }

  async createEmailConfirmation(emailConfirmation: EmailConfirmationModel): Promise<EmailConfirmationModel | null> {
    const filter = this.getCreateFilter(emailConfirmation)
    const query = `
      INSERT INTO public.email_confirmation 
             (user_id, confirmation_code, expiration_date, is_confirmed)
      VALUES (${filter})
    `
    await this.dataSource.query(query)

    return emailConfirmation
  }

  async updateConfirmationInfo(confirmation_code: string): Promise<boolean> {
    const query = `
      UPDATE public.email_confirmation
         SET is_confirmed = true
       WHERE confirmation_code = $1;
    `
    const result = await this.dataSource.query(query, [confirmation_code])

    if (result[1] !== 1) {
      return false
    }
    return true
  }

  async updateConfirmationCode(
    userId: string,
    confirmationCode: string,
    expirationDate?: Date,
  ): Promise<boolean> {
    const filter = this.getUpdateConfirmationCodeFilter(confirmationCode, expirationDate)
    const query = `
      UPDATE public.email_confirmation
         SET ${filter}
       WHERE user_id = '${userId}';
    `
    const result = await this.dataSource.query(query) //TODO here

    if (result[1] !== 1) {
      return false
    }
    return true
  }

  async deleteEmailConfirmationById(userId: string): Promise<boolean> {
    const query = `
      DELETE FROM public.email_confirmation
       WHERE user_id = $1;
    `

    const result = await this.dataSource.query(query, [userId])

    if (result[1] !== 1) {
      return false
    }
    return true
  }

  private getCreateFilter(emailConfirmation: EmailConfirmationModel): string {
    let filter = `'${emailConfirmation.id}', null, null, '${emailConfirmation.isConfirmed}'`
    if (emailConfirmation.confirmationCode !== null) {
      return filter = `'${emailConfirmation.id}', '${emailConfirmation.confirmationCode}', '${emailConfirmation.expirationDate}', '${emailConfirmation.isConfirmed}'`
    }
    return filter
  }

  private getUpdateConfirmationCodeFilter(confirmationCode: string, expirationDate?: Date): string {
    if (!expirationDate) {
      return `confirmation_code = '${confirmationCode}'`
    }
    return `confirmation_code = '${confirmationCode}', expiration_date = '${expirationDate}'`
  }
}