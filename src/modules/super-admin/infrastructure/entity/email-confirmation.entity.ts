import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";

@Entity()
export class EmailConfirmation {
  @PrimaryColumn('uuid') user_id: string;

  @Column() confirmation_code: string;

  @Column() expiration_date: string;

  @Column({ default: false }) is_confirmation: boolean;

  @OneToOne(() => Users, u => u.emailConfirmation)
  @JoinColumn()
  user: Users
}
