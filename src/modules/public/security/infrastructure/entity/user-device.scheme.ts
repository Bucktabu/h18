import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDeviceDocument = HydratedDocument<UserDevice>;

@Schema()
export class UserDevice {
  @Prop({ String, required: true })
  deviceId: string;

  @Prop({ String, required: true })
  deviceTitle: string;

  @Prop({ String, required: true })
  browser: string;

  @Prop({ String, required: true })
  ipAddress: string;

  @Prop({ Number, required: true })
  iat: number;

  @Prop({ Number, required: true })
  exp: number;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);
