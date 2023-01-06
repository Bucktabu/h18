import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Jwt {
  @PrimaryGeneratedColumn() id: number;
  @Column() token: string;
}
