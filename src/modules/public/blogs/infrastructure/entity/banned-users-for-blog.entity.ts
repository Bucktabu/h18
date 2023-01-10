import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {Blogs} from "./blogs.entity";
import {Users} from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class BannedUsersForBlogEntity {
    @PrimaryColumn()
    blog_id: string;
    @ManyToOne(() => Blogs, b => b.bannedUsers)
    blog: Blogs;

    @PrimaryColumn()
    user_id: string;
    @ManyToOne(() => Users, u => u.bannedForBlog)
    user: Users;

    @Column() ban_reason: string;

    @Column() ban_date: string;
}