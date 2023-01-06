import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";


@Entity()
export class UserBanInfo {
  @PrimaryColumn('uuid') userId: string;

  @Column({ default: false }) isBanned: boolean;

  @Column({ default: null }) banDate: string | null;

  @Column({ default: null }) banReason: string | null;

  @Column({ default: null }) blogId: string | null;

  @OneToOne(() => Users, u => u.banInfo)
  @JoinColumn()
  user: Users
}
