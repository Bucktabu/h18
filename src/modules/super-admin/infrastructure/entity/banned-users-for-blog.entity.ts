// import {
//     Column,
//     Entity,
//     JoinColumn,
//     ManyToOne,
//     OneToMany,
//     OneToOne,
//     PrimaryColumn,
//     PrimaryGeneratedColumn
// } from "typeorm";
// import {Blogs} from "../../../public/blogs/infrastructure/entity/blogs.entity";
// import {Users} from "./users";
//
// @Entity()
// export class BannedUsersForBlog {
//     @PrimaryColumn()
//     blogId: string;
//     // @ManyToOne(() => Blogs, b => b.bannedUsers)
//     // blog: Blogs;
//
//     @PrimaryColumn()
//     userId: string;
//     @ManyToOne(() => Users, u => u.bannedForBlog)
//     user: Users;
//
//     @Column() ban_reason: string;
//
//     @Column() ban_date: string;
// }