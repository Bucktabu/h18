import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";
import {BannedUsersForBlog} from "./banned-users-for-blog.entity";

@Entity()
export class Blogs {
  @PrimaryColumn('uuid') id: string;

  @Column() title: string;

  @Column() description: string;

  @Column() website_url: string;

  @Column() created_at: string;

  @Column() is_banned: string;

  @ManyToOne(() => Users, u => u.blogs)
  @JoinColumn()
  blogger: Users;
  @PrimaryColumn() bloggerId: string;

  // @OneToMany(() => BannedUsersForBlog, bu => bu.blog)
  // bannedUsers: BannedUsersForBlog[];
}