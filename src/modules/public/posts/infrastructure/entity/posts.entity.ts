import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {Blogs} from "../../../blogs/infrastructure/entity/blogs.entity";
// import {Comments} from "../../../comments/infrastructure/entity/comments.entity";
// import {PostReactions} from "../../../likes/infrastructure/entity/post-reactions.entity";

@Entity()
export class Posts {
    @PrimaryColumn('uuid') id: string;

    @Column() title: string;

    @Column() short_description: string;

    @Column() content: string;

    @Column() created_at: string;

    @ManyToOne(() => Blogs, b => b.posts)
    @JoinColumn()
    blog: Blogs;
    @PrimaryColumn() blogId: string;

    // @OneToMany(() => Comments, c => c.post)
    // comments: Comments[]
    //
    // @OneToMany(() => PostReactions, pr => pr.post)
    // reactions: PostReactions
}