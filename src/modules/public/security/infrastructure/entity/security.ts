import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../../../../super-admin/infrastructure/entity/user";

@Entity()
export class Security {
  @PrimaryColumn('uuid') userId: string;

  @PrimaryColumn('uuid') deviceId: string;

  @Column() deviceTitle: string;

  @Column() browser: string;

  @Column() ipAddress: string;

  @Column() iat: string;

  @Column() exp: string;

  @OneToOne(() => User, u => u.security)
  @JoinColumn()
  user: User
}
