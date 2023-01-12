import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QueryParametersDto} from "../../../../global-model/query-parameters.dto";
import {giveSkipNumber, paginationContentPage} from "../../../../helper.functions";
import {ContentPageModel} from "../../../../global-model/contentPage.model";
import {toPostsViewModel} from "../../../../data-mapper/to-posts-view.model";
import {DbPostModel} from "./entity/db-post.model";
import {PostViewModel} from "../api/dto/postsView.model";

@Injectable()
export class PgQueryPostsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {
    }

    async getPosts(
        queryDto: QueryParametersDto,
        blogId?: string | undefined,
        userId?: string | undefined
    ): Promise<ContentPageModel> {
        const myStatusFilter = this.myStatusFilter(userId)
        const blogIdFilter = this.getBlogIdFilter(blogId)

        const query = `
            SELECT id, title, short_description AS "shortDescription", content, created_at AS "createdAt", "blogId",
                   (SELECT title AS "blogName" FROM public.blogs WHERE id.blogs = "blogId".posts),
                   (SELECT SUM("postID") AS "likesCount" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND status = "Like"),
                   (SELECT SUM("postID") AS "dislikesCount" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND status = "Dislike"),
                   (SELECT added_at AS "addedAt", "userId",
                           (SELECT id AS "userId", login, added_at AS "addedAt" FROM public.users WHERE id.users = "usersId".post_reactions)) AS "newestLikes"
                      FROM public.post_reactions
                     WHERE postId.post_reactions = id.posts)
                   ${myStatusFilter}
              FROM public.posts
             WHERE ${blogIdFilter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT $1 OFFSET ${giveSkipNumber(
                queryDto.pageNumber,
                queryDto.pageSize,
             )};      
        `
        const postsDB: DbPostModel[] = await this.dataSource.query(query, [blogId])

        const post = postsDB.map(p => toPostsViewModel(p))

        const totalCountQuery = `
          SELECT COUNT(id)
            FROM public.posts
           WHERE "blogId" = $1 AND (SELECT is_banned FROM public.blogs WHERE id = $1) = false
        `;
        const totalCount = await this.dataSource.query(totalCountQuery, [blogId]);

        return paginationContentPage(
            queryDto.pageNumber,
            queryDto.pageSize,
            post,
            Number(totalCount[0].count),
        );
    }

    async getPostById(id: string, userId: string | undefined): Promise<PostViewModel | null> {
        const myStatusFilter = this.myStatusFilter(userId)

        const query = `
            SELECT id, title, short_description AS "shortDescription", content, created_at AS "createdAt", "blogId",
                   (SELECT title AS "blogName" FROM public.blogs WHERE id.blogs = "blogId".posts),
                   (SELECT SUM("postID") AS "likesCount" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND status = "Like"),
                   (SELECT SUM("postID") AS "dislikesCount" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND status = "Dislike"),
                   (SELECT added_at AS "addedAt", "userId",
                           (SELECT id AS "userId", login, added_at AS "addedAt" FROM public.users WHERE id.users = "usersId".post_reactions)) AS "newestLikes"
                      FROM public.post_reactions
                     WHERE postId.post_reactions = id.posts)
                   ${myStatusFilter}
              FROM public.posts
             WHERE id = $1
        `
        const postDB: DbPostModel[] = await this.dataSource.query(query, [id])

        if (!postDB.length) {
            return null
        }
        return toPostsViewModel(postDB[0])
    }

    async postExist(id: string): Promise<boolean> {
        const query = `
            SELECT id FROM public.posts
             WHERE id = $1 AND is_banned = false
        `
        const result = await this.dataSource.query(query, [id])

        if (!result.length) {
            return false
        }
        return true
    }

    private myStatusFilter(userId: string | undefined): string {
        if (userId) {
            return `, (SELECT status AS "myStatus" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND "userId".post_reactions = '${userId}')`
        }
        return ''
    }

    private getBlogIdFilter(blogId: string | undefined): string {
        if (blogId) {
            return `"blogId" = $1 AND (SELECT is_banned FROM public.blogs WHERE id = $1) = false`
        }
        return `(SELECT is_banned FROM public.blogs WHERE id = $1) = false`
    }
}