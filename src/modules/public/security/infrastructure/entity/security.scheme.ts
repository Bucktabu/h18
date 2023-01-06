import mongoose, { HydratedDocument } from 'mongoose';
import { ViewSecurityDeviseModel } from './viewSecurityDeviseModel';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDevice } from './user-device.scheme';

// const securityScheme = new mongoose.Schema<DeviceSecurityModel>({
//   userId: { type: String, required: true },
//   userDevice: {
//     deviceId: { type: String, required: true },
//     deviceTitle: { type: String, required: true },
//     browser: { type: String, required: true },
//     ipAddress: { type: String, required: true },
//     iat: { type: String, required: true },
//     exp: { type: String, required: true },
//   },
// });
//
// export const SecurityScheme = mongoose.model('security', securityScheme);

export type SecurityDocument = HydratedDocument<Security>;

@Schema()
export class Security {
  @Prop({ String, required: true })
  userId: string;

  @Prop({ type: UserDevice })
  userDevice: UserDevice;
}

export const SecuritySchema = SchemaFactory.createForClass(Security);
