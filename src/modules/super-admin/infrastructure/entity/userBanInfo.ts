import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";


@Entity()
export class UserBanInfo {
  @Column({ default: false }) ban_status: boolean;

  @Column({ default: null }) ban_date: string | null;

  @Column({ default: null }) ban_reason: string | null;

  @OneToOne(() => Users, u => u.banInfo)
  @JoinColumn()
  user: Users;
  @PrimaryColumn() userId: string;
}
