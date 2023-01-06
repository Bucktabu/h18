// import mongoose, { Model } from 'mongoose';
// import { EmailConfirmationModel } from './emailConfirmation.model';
//
// const emailConfirmationScheme = new mongoose.Schema({
//   id: { type: String, required: true },
//   confirmationCode: { type: String, required: true },
//   expirationDate: { type: Date, required: true },
//   isConfirmed: { type: Boolean, required: true, default: false },
// });

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>;

@Schema()
export class EmailConfirmation {
  @Prop({ String, required: true })
  id: string;

  @Prop({ String, required: true })
  confirmationCode: string;

  @Prop({ String, required: true })
  expirationDate: string;

  @Prop({ Boolean, default: false }) // TODO ! for boolean need use default options not required!
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
