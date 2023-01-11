import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {Blogs} from "../../../blogs/infrastructure/entity/blogs.entity";
import {Comments} from "../../../comments/infrastructure/entity/comments.entity";
import {CommentReactions} from "../../../likes/infrastructure/entity/comment-reactions.entity";

@Entity()
export class Posts {
    @PrimaryColumn('uuid') id: string;

    @Column() title: string;

    @Column() shortDescription: string;

    @Column() content: string;

    @Column() created_at: string;

    @Column({ default: false }) is_banned: boolean

    @ManyToOne(() => Blogs, b => b.posts)
    @JoinColumn()
    blog: Blogs;
    @PrimaryColumn() blogId: string;

    @OneToMany(() => Comments, c => c.post)
    comments: Comments[]

    @OneToMany(() => CommentReactions, cr => cr.comment)
    reactions: CommentReactions
}