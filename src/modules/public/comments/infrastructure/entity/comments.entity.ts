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
import {Users} from "../../../../super-admin/infrastructure/entity/users";
import {Posts} from "../../../posts/infrastructure/entity/posts.entity";
import {CommentReactions} from "../../../likes/infrastructure/entity/comment-reactions.entity";

@Entity()
export class Comments {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() content: string;

    @Column() created_at: string;

    @OneToOne(() => Posts, p => p.comments)
    @JoinColumn()
    post: Posts;
    @Column() postId: string;

    @ManyToOne(() => Users, u => u.comments)
    @JoinColumn()
    user: Users;
    @Column() userId: string;

    @OneToMany(() => CommentReactions, r => r.comment)
    reactions: CommentReactions[]
}