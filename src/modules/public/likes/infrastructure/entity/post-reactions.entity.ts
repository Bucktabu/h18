// import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
// import {Users} from "../../../../super-admin/infrastructure/entity/users";
// import {Posts} from "../../../posts/infrastructure/entity/posts.entity";
//
// @Entity()
// export class PostReactions {
//     @Column() status: string;
//
//     @Column() added_at: string;
//
//     @ManyToOne(() => Users, u => u.pReactions)
//     @JoinColumn()
//     user: Users
//     @Column() userId: string
//
//     @ManyToOne(() => Posts, c => c.reactions)
//     @JoinColumn()
//     post: Posts
//     @PrimaryColumn() postId: string
// }