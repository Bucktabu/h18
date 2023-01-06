import {
  Column,
  Entity, OneToOne,
  PrimaryColumn
} from "typeorm";
import { BanInfo } from "./ban.info";
import { Security } from "../../../public/security/infrastructure/entity/security";
import { EmailConfirmation } from "./email-confirmation.entity";

@Entity()
export class User {
  @PrimaryColumn('uuid') id: string;

  @Column() login: string;

  @Column() email: string;

  @Column() passwordSalt: string;

  @Column() passwordHash: string;

  @Column() createdAt: string;

  @OneToOne(() => BanInfo, bi => bi.user)
  banInfo: BanInfo

  @OneToOne(() => Security, s => s.user)
  security: Security

  @OneToOne(() => EmailConfirmation, ec => ec.user)
  emailConfirmation: EmailConfirmation
}
