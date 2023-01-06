import { IsString, Length, Validate } from 'class-validator';
import { ConfirmationCodeValidator } from '../../../../../validation/confirmation-code.validator';

export class NewPasswordDto {
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @Validate(ConfirmationCodeValidator)
  recoveryCode: string;
}
