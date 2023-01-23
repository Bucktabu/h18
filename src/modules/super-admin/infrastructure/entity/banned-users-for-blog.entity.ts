import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from './users';
import { Blogs } from '../../../public/blogs/infrastructure/entity/blogs.entity';

@Entity()
export class BannedUsersForBlog {
  @Column()
  blogId: string;
  @ManyToOne(() => Blogs, (b) => b.bannedUsers)
  blog: Blogs;

  @PrimaryColumn()
  userId: string;
  @ManyToOne(() => Users, (u) => u.bannedForBlog)
  user: Users;

  @Column() banReason: string;

  @Column() banDate: string;
}
