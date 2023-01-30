import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import {
  giveSkipNumber,
  paginationContentPage,
} from '../../../../helper.functions';
import { ContentPageModel } from '../../../../global-model/contentPage.model';
import { DbPostModel } from './entity/db-post.model';
import {PostForBlogViewModel, PostViewModel} from '../api/dto/postsView.model';
import {settings} from "../../../../settings";
import {NewestLikesModel} from "../../likes/infrastructure/entity/newestLikes.model";

@Injectable()
export class PgQueryPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPosts(
    queryDto: QueryParametersDto,
    blogId: string | undefined,
    userId?: string | undefined,
  ): Promise<ContentPageModel> {
    const blogIdFilter = this.getBlogIdFilter(blogId);
    const statusFilter = this.myStatusFilter(userId)

    const query = `
            SELECT id, title, "shortDescription", content, "createdAt", "blogId",
                       (SELECT name AS "blogName" FROM public.blogs WHERE blogs.id = posts."blogId"),
                       (SELECT COUNT("postId") 
                          FROM public.post_reactions
                         WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Like') AS "likesCount",
                       (SELECT COUNT("postId")
                          FROM public.post_reactions
                         WHERE post_reactions."postId" = posts.id AND post_reactions.status = 'Dislike') AS "dislikesCount",
                       (SELECT "addedAt"
                          FROM public.post_reactions
                         WHERE post_reactions."postId" = posts.id)
                       ${statusFilter}
                  FROM public.posts
                 ${blogIdFilter}
                 ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
                 LIMIT '${queryDto.pageSize}'OFFSET ${giveSkipNumber(
                   queryDto.pageNumber,
                   queryDto.pageSize,
                 )};      
        `;
    const postsDB: DbPostModel[] = await this.dataSource.query(query);
    const posts = await Promise.all(postsDB.map(async p => await this.addNewestLikes(p)))

    const totalCountQuery = `
          SELECT COUNT(id)
            FROM public.posts
          ${blogIdFilter}
        `;
    const totalCount = await this.dataSource.query(totalCountQuery);

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
    return await this.addNewestLikes(postDB[0])
  }

  async getPostsForBlog(queryDto: QueryParametersDto, blogId: string): Promise<ContentPageModel> {
    const blogIdFilter = this.getBlogIdFilter(blogId);

    const postQuery = `
      SELECT id, title, "shortDescription", content, "blogId",
             (SELECT name AS "blogName" FROM public.blogs WHERE blogs.id = posts."blogId")
        FROM public.posts     
       ${blogIdFilter}
       ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
                 LIMIT '${queryDto.pageSize}'OFFSET ${giveSkipNumber(
                   queryDto.pageNumber,
                   queryDto.pageSize,
                 )}; 
    `
    const posts: PostForBlogViewModel[] = await this.dataSource.query(postQuery)

    const totalCountQuery = `
      SELECT COUNT(id)
            FROM public.posts
           WHERE ${blogIdFilter}
    `;
    const totalCount = await this.dataSource.query(totalCountQuery);

    return paginationContentPage(
        queryDto.pageNumber,
        queryDto.pageSize,
        posts,
        Number(totalCount[0].count),
    );
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

  async newestLikes(postId: string): Promise<NewestLikesModel[]> {
    const newestLikesQuery = `
      SELECT "userId", "addedAt",
             (SELECT login FROM public.users WHERE users.id = post_reactions."userId")
        FROM public.post_reactions
       WHERE "postId" = $1
       LIMIT ${settings.newestLikes.limit}
    `
    return await this.dataSource.query(newestLikesQuery, [postId])
  }

  private async addNewestLikes(post: DbPostModel): Promise<PostViewModel> {
    const newestLikes = await this.newestLikes(post.id)

    let myStatus = 'None';
    if (post.myStatus) {
      myStatus = post.myStatus;;
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: Number(post.likesCount),
        dislikesCount: Number(post.dislikesCount),
        myStatus: myStatus,
        newestLikes: newestLikes,
      },
    };
  }

  private myStatusFilter(userId: string | undefined): string {
    if (userId) {
      return `, (SELECT status AS "myStatus" 
                   FROM public.post_reactions
                  WHERE post_reactions."postId" = posts.id AND post_reactions."userId" = $1`;
    }
    return '';
  }

  private getBlogIdFilter(blogId: string | undefined): string {
    if (blogId) {
      return `WHERE "blogId" = '${blogId}' AND NOT EXISTS (SELECT "blogId" FROM public.banned_blog WHERE id = '${blogId}')`;
    }
    return ``;
  }
}
