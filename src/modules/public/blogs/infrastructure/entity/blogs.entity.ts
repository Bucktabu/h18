import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class Blogs {
  @PrimaryColumn('uuid') id: string;

  @Column() title: string;

  @Column() description: string;

  @Column() website_url: string;

  @Column() created_at: string;

  @Column() is_banned: string;

  // @OneToMany(() => Users, u => u.bannedForBlog)
  // @Column() banned_users: Users;

  @Column() blogger_id: string;

  @ManyToOne(() => Users, u => u.blogs)
  blogger: Users
}