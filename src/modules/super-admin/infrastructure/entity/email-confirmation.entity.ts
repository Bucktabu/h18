import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class EmailConfirmation {
  @PrimaryColumn('uuid') userId: string;

  @Column() confirmationCode: string;

  @Column() expirationDate: string;

  @Column({ default: false }) isConfirmation: boolean;

  @OneToOne(() => User, u => u.emailConfirmation)
  @JoinColumn()
  user: User
}
