import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import {
  giveSkipNumber,
  paginationContentPage,
} from '../../../../helper.functions';
import { ContentPageModel } from '../../../../global-model/contentPage.model';
import { toPostsViewModel } from '../../../../data-mapper/to-posts-view.model';
import { DbPostModel } from './entity/db-post.model';
import { PostViewModel } from '../api/dto/postsView.model';

@Injectable()
export class PgQueryPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPosts(
    queryDto: QueryParametersDto,
    blogId?: string | undefined,
    userId?: string | undefined,
  ): Promise<ContentPageModel> {
    const myStatusFilter = this.myStatusFilter(userId);
    const blogIdFilter = this.getBlogIdFilter(blogId);

    const query = `
            SELECT id, title, "shortDescription", content, "createdAt", "blogId",
                   (SELECT name AS "blogName" FROM public.blogs WHERE blogs.id = posts."blogId"),
                   (SELECT COUNT("postId")
                      FROM public.post_reactions
                     WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Like') AS "likesCount"
                   (SELECT COUNT("postId")
                      FROM public.post_reactions
                     WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Dislike') AS "dislikesCount"
                   (SELECT "addedAt", "userId",
                           (SELECT id AS "userId", login, "addedAt"
                              FROM public.users
                             WHERE id.users = "usersId".post_reactions)) AS "newestLikes"
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
        `;
    const postsDB: DbPostModel[] = await this.dataSource.query(query, [
      queryDto.pageNumber,
    ]);
    // SELECT id,
    //     (SELECT name AS "blogName" FROM public.blogs WHERE blogs.id = posts."blogId"),
    // (SELECT COUNT("postId")
    // FROM public.post_reactions
    // WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Like') AS "likesCount",
    //     (SELECT COUNT("postId")
    // FROM public.post_reactions
    // WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Dislike') AS "dislikesCount",
    //     (SELECT "addedAt", "userId",
    //     (SELECT id AS "userId", login, "addedAt"
    // FROM public.users
    // WHERE users.id = post_reactions."userId")
    // FROM public.post_reactions
    // WHERE post_reactions.postId = posts.id) AS "newestLikes"
    // FROM public.posts
    // WHERE "blogId" = '7b528e6e-49d5-4d61-9e52-2a80717bad07'
    const posts = postsDB.map((p) => toPostsViewModel(p));

    const totalCountQuery = `
          SELECT COUNT(id)
            FROM public.posts
           WHERE "blogId" = $1 AND (SELECT "isBanned" FROM public.blogs WHERE id = $1) = false
        `;
    const totalCount = await this.dataSource.query(totalCountQuery, [blogId]);

    return paginationContentPage(
      queryDto.pageNumber,
      queryDto.pageSize,
      posts,
      Number(totalCount[0].count),
    );
  }

  async getPostById(
    id: string,
    userId: string | undefined,
  ): Promise<PostViewModel | null> {
    const myStatusFilter = this.myStatusFilter(userId);

    const query = `
            SELECT id, title, "shortDescription", content, "createdAt", "blogId",
                   (SELECT title AS "blogName" FROM public.blogs WHERE blogs.id = posts."blogId"),
                   (SELECT SUM("postID") AS "likesCount" FROM public.post_reactions WHERE post_reactions."postId" = posts.id AND status = "Like"),
                   (SELECT SUM("postID") AS "dislikesCount" FROM public.post_reactions WHERE post_reactions."postId" = posts.id AND status = "Dislike"),
                   (SELECT "addedAt", "userId",
                           (SELECT id AS "userId", login, "addedAt" FROM public.users WHERE users.id = pr."usersId")) AS "newestLikes"
                      FROM public.post_reactions pr
                     WHERE pr."postId" = posts.id)
                   ${myStatusFilter}
              FROM public.posts
             WHERE id = $1
        `;
    const postDB: DbPostModel[] = await this.dataSource.query(query, [id]);

    if (!postDB.length) {
      return null;
    }
    return toPostsViewModel(postDB[0]);
  }

  async postExist(id: string): Promise<boolean> {
    const query = `
            SELECT id FROM public.posts
             WHERE id = $1 AND is_banned = false
        `;
    const result = await this.dataSource.query(query, [id]);

    if (!result.length) {
      return false;
    }
    return true;
  }

  private myStatusFilter(userId: string | undefined): string {
    if (userId) {
      return `, (SELECT status AS "myStatus" FROM public.post_reactions WHERE "postId".post_reactions = id.posts AND "userId".post_reactions = '${userId}')`;
    }
    return '';
  }

  private getBlogIdFilter(blogId: string | undefined): string {
    if (blogId) {
      return `"blogId" = $1 AND (SELECT is_banned FROM public.blogs WHERE id = $1) = false`;
    }
    return `(SELECT is_banned FROM public.blogs WHERE id = $1) = false`;
  }
}
