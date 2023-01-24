import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Users } from '../../../../super-admin/infrastructure/entity/users';
import { BannedUsersForBlog } from '../../../../super-admin/infrastructure/entity/banned-users-for-blog.entity';
import { Posts } from '../../../posts/infrastructure/entity/posts.entity';
import { BannedBlog } from '../../../../super-admin/infrastructure/entity/banned_blog.entity';

@Entity()
export class Blogs {
  @PrimaryColumn('uuid') id: string;

  @Column() name: string;

  @Column() description: string;

  @Column() websiteUrl: string;

  @Column() createdAt: string;

  @ManyToOne(() => Users, (u) => u.blogs)
  @JoinColumn()
  blogger: Users;
  @Column() bloggerId: string;

  @OneToMany(() => BannedUsersForBlog, (bu) => bu.blog)
  bannedUsers: BannedUsersForBlog[];

  @OneToMany(() => Posts, (p) => p.blog)
  posts: Posts;

  @OneToOne(() => BannedBlog, (bb) => bb.blog)
  isBanned: BannedBlog;
}
