import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import { Users } from "../../../../super-admin/infrastructure/entity/users";
import {BannedUsersForBlogEntity} from "./banned-users-for-blog.entity";

@Entity()
export class Blogs {
  @PrimaryColumn('uuid') id: string;

  @Column() title: string;

  @Column() description: string;

  @Column() website_url: string;

  @Column() created_at: string;

  @Column() is_banned: string;

  @OneToOne(() => Users, u => u.blogs)
  @JoinColumn()
  blogger: Users;
  @PrimaryColumn() bloggerId: string;

  @OneToMany(() => BannedUsersForBlogEntity, bu => bu.blog)
  bannedUsers: BannedUsersForBlogEntity[];
}