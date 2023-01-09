import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";

@Entity()
export class EmailConfirmation {
  @Column({ default: null}) confirmation_code: string | null;

  @Column({ default: null}) expiration_date: string | null;

  @Column({ default: false }) is_confirmed: boolean;

  @OneToOne(() => Users, u => u.emailConfirmation)
  @JoinColumn()
  user: Users
  @PrimaryColumn() userId: string;
}
