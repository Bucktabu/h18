import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users";

@Entity()
export class EmailConfirmation {
  @PrimaryColumn('uuid') userId: string;

  @Column() confirmationCode: string;

  @Column() expirationDate: string;

  @Column({ default: false }) isConfirmation: boolean;

  @OneToOne(() => Users, u => u.emailConfirmation)
  @JoinColumn()
  user: Users
}
