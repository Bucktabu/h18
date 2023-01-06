import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user";


@Entity()
export class BanInfo {
  @PrimaryColumn('uuid') userId: string;

  @Column({ default: false }) isBanned: boolean;

  @Column({ default: null }) banDate: string | null;

  @Column({ default: null }) banReason: string | null;

  @Column({ default: null }) blogId: string | null;

  @OneToOne(() => User, u => u.banInfo)
  @JoinColumn()
  user: User
}
