import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class Security {
  @PrimaryColumn('uuid') user_id: string;

  @PrimaryColumn('uuid') device_id: string;

  @Column() device_title: string;

  @Column() ip_address: string;

  @Column() iat: string;

  @Column() exp: string;

  @OneToOne(() => Users, u => u.security)
  @JoinColumn()
  user: Users
}
