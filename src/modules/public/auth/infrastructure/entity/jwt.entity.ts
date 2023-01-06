import { Column, Entity } from "typeorm";

@Entity()
export class JwtEntity {
  @Column() token: string;
}