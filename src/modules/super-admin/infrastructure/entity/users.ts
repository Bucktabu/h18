import {
  Column,
  Entity, OneToOne,
  PrimaryColumn
} from "typeorm";
import { UserBanInfo } from "./userBanInfo";
import { Security } from "../../../public/security/infrastructure/entity/security";
import { EmailConfirmation } from "./email-confirmation.entity";

@Entity()
export class Users {
  @PrimaryColumn('uuid') id: string;

  @Column() login: string;

  @Column() email: string;

  @Column() passwordSalt: string;

  @Column() passwordHash: string;

  @Column() createdAt: string;

  @OneToOne(() => UserBanInfo, bi => bi.user)
  banInfo: UserBanInfo

  @OneToOne(() => Security, s => s.user)
  security: Security

  @OneToOne(() => EmailConfirmation, ec => ec.user)
  emailConfirmation: EmailConfirmation
}
