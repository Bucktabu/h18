import {
  Column,
  Entity, ManyToOne, OneToMany, OneToOne,
  PrimaryColumn
} from "typeorm";
import { UserBanInfo } from "./userBanInfo";
import { Security } from "../../../public/security/infrastructure/entity/security";
import { EmailConfirmation } from "./email-confirmation.entity";
import { Blogs } from "../../../public/blogs/infrastructure/entity/blogs.entity";
import {BannedUsersForBlogEntity} from "../../../public/blogs/infrastructure/entity/banned-users-for-blog.entity";

@Entity()
export class Users {
  @PrimaryColumn('uuid') id: string;

  @Column() login: string;

  @Column() email: string;

  @Column() password_salt: string;

  @Column() password_hash: string;

  @Column() created_at: string;

  @OneToOne(() => UserBanInfo, bi => bi.user)
  banInfo: UserBanInfo

  @OneToOne(() => Security, s => s.user)
  security: Security

  @OneToOne(() => EmailConfirmation, ec => ec.user)
  emailConfirmation: EmailConfirmation

  @OneToMany(() => Blogs, b => b.blogger)
  blogs: Blogs[]

  @OneToMany(() => BannedUsersForBlogEntity, bu => bu.user)
  bannedForBlog: BannedUsersForBlogEntity[]
}
