import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class Security {
  @PrimaryColumn('uuid') userId: string;

  @PrimaryColumn('uuid') deviceId: string;

  @Column() deviceTitle: string;

  @Column() browser: string;

  @Column() ipAddress: string;

  @Column() iat: string;

  @Column() exp: string;

  @OneToOne(() => Users, u => u.security)
  @JoinColumn()
  user: Users
}
