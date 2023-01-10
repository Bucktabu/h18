import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class Security {
  @PrimaryColumn('uuid') device_id: string;

  @Column() device_title: string;

  @Column() ip_address: string;

  @Column() iat: string;

  @Column() exp: string;

  @ManyToOne(() => Users, u => u.security)
  @JoinColumn()
  user: Users
  @PrimaryColumn() userId: string;
}
