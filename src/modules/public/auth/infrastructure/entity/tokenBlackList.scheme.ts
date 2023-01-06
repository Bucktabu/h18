import mongoose, { HydratedDocument } from 'mongoose';
import { TokenModel } from './token.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// const tokenBlackListScheme = new mongoose.Schema<TokenModel>({
//   refreshToken: { type: String, required: true },
// });
//
// export const TokenBlackListScheme = mongoose.model(
//   'blackList',
//   tokenBlackListScheme,
// );

export type TokenBlackListDocument = HydratedDocument<TokenBlackList>;

@Schema()
export class TokenBlackList {
  @Prop({ String, required: true })
  refreshToken: string;
}

export const TokenBlackListSchema =
  SchemaFactory.createForClass(TokenBlackList);
