import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SecurityEntity {
  @PrimaryColumn() userId: string;

  @PrimaryColumn() deviceId: string;

  @Column() deviceTitle: string;

  @Column() browser: string;

  @Column() ipAddress: string;

  @Column() iat: string;

  @Column() exp: string;
}
