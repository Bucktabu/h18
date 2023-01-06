import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";


@Entity()
export class UserBanInfo {
  @PrimaryColumn('uuid') user_id: string;

  @Column({ default: false }) is_banned: boolean;

  @Column({ default: null }) ban_date: string | null;

  @Column({ default: null }) ban_reason: string | null;

  @Column({ default: null }) blog_id: string | null;

  @OneToOne(() => Users, u => u.banInfo)
  @JoinColumn()
  user: Users
}
