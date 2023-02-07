import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blogs} from "./blogs.entity";
import {Users} from "../../../../super-admin/infrastructure/entity/users";

@Entity()
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    blogId: string;
    @ManyToOne(() => Blogs, (b) => b.membership)
    blog: Blogs;

    @Column()
    userId: string;
    @ManyToOne(() => Users, (u) => u.membership)
    user: Users;

    @Column()
    subscriptionDate: string;
}