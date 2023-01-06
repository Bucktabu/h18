import mongoose, { HydratedDocument, Model } from 'mongoose';
import { UserDBModel } from './userDB.model';
import { UserDto } from '../../api/dto/userDto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// const usersScheme = new mongoose.Schema<UserDBModel /*, UserModelStaticType*/>({
//   id: { type: String, required: true },
//   login: { type: String, required: true },
//   email: { type: String, required: true },
//   passwordHash: { type: String, required: true },
//   passwordSalt: { type: String, required: true },
//   createdAt: { type: String, required: true },
//   banStatus: { type: Boolean, default: false}
// });
//
// export const UserScheme = mongoose.model<UserDBModel /*, UserModelStaticType*/>(
//   'users',
//   usersScheme,
// );

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ String, required: true })
  id: string;

  @Prop({ String, required: true })
  login: string;

  @Prop({ String, required: true })
  email: string;

  @Prop({ String, required: true })
  passwordHash: string;

  @Prop({ String, required: true })
  passwordSalt: string;

  @Prop({ String, required: true })
  createdAt: string;

  @Prop({ Boolean, default: false })
  banStatus: boolean;
}

export const UserScheme = SchemaFactory.createForClass(User);
