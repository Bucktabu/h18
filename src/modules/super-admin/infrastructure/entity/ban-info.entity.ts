import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class BanInfoEntity {
  @PrimaryColumn() userId: number;

  @Column() isBanned: boolean;

  @UpdateDateColumn() banDate: string | null;

  @Column() banReason: string | null;

  @Column() blogId: string | null;
}
