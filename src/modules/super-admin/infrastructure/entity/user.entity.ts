import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
  @PrimaryColumn() id: number;

  @Column() login: string;

  @Column() email: string;

  @Column() passwordSalt: string;

  @Column() passwordHash: string;

  @CreateDateColumn() createdAt: string;
}