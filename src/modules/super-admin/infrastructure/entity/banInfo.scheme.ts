import mongoose, { HydratedDocument } from 'mongoose';
import { BanInfoModel } from './banInfo.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// const banInfoScheme = new mongoose.Schema<BanInfoModel>({
//   parentId: { type: String, required: true },
//   isBanned: { type: Boolean, required: true, default: false },
//   banDate: { type: Date},
//   banReason: { type: String },
//   blogId: { type: String }, // used when blogger banned user for his blog
//   userLogin: { type: String }
// });
//
// export const BanInfoScheme = mongoose.model('banInfo', banInfoScheme);

export type BanInfoDocument = HydratedDocument<BanInfo>;

@Schema()
export class BanInfo {
  @Prop({ String, required: true })
  parentId: string;

  @Prop({ Boolean, default: false })
  isBanned: boolean;

  @Prop({ String })
  banDate: string;

  @Prop({ String })
  banReason: string;

  @Prop({ String })
  blogId: string;

  @Prop({ String })
  userLogin: string;
}

//export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
