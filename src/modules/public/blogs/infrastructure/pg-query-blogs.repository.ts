import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QueryParametersDto} from "../../../../global-model/query-parameters.dto";
import {giveSkipNumber, paginationContentPage} from "../../../../helper.functions";
import {ContentPageModel} from "../../../../global-model/contentPage.model";
import { dbBlogWithAdditionalInfo} from "./entity/blog-db.model";
import {toBlogWithAdditionalInfoModel} from "../../../../data-mapper/to-blog-with-additional-info.model";
import {BlogViewModel} from "../api/dto/blogView.model";
import {query} from "express";

@Injectable()
export class PgQueryBlogsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {
    }

    async getBlogs(queryDto: QueryParametersDto, userId?: string): Promise<ContentPageModel> {
        const filter = this.getFilter(userId)
        const query = `
            SELECT id, title AS name, description, "websiteUrl", "createdAt"
              FROM public.blogs
                   ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT $1 OFFSET ${giveSkipNumber(
                queryDto.pageNumber,
                queryDto.pageSize,
            )};
        `

        const blogs = await this.dataSource.query(query, [queryDto.pageSize])

        const totalCountQuery = `
          SELECT COUNT(id)
            FROM public.blogs
                 ${filter}
        `;
        const totalCount = await this.dataSource.query(totalCountQuery);

        return paginationContentPage(
            queryDto.pageNumber,
            queryDto.pageSize,
            blogs,
            Number(totalCount[0].count),
        );
    }

    async saGetBlogs(queryDto: QueryParametersDto): Promise<ContentPageModel> {
        const filter = this.searchNameFilter(queryDto)

        const blogsQuery = `
            SELECT b.id, b.title AS name, b.description, b."websiteUrl", b."createdAt"
                   u.id AS "userId", u.login AS "userLogin",
                   (SELECT "isBanned" FROM public.banned_blog WHERE "blogId" = b.id),
                   (SELECT "banDate" FROM public.banned_blog WHERE "blogId" = b.id) 
              FROM public.blogs
              LEFT JOIN public.users u
                ON b."bloggerId" = u.id
             WHERE ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT $1 OFFSET ${giveSkipNumber(
                queryDto.pageNumber,
                queryDto.pageSize,
             )};
        `
        const blogsDB: dbBlogWithAdditionalInfo[] = await this.dataSource.query(blogsQuery, [queryDto.pageSize])

        const blogs = blogsDB.map(b => toBlogWithAdditionalInfoModel(b))

        const totalCountQuery = `
          SELECT COUNT(id)
            FROM public.blogs
            LEFT JOIN public.users u
              ON b."bloggerId" = u.id
           WHERE ${filter}
        `;
        const totalCount = await this.dataSource.query(totalCountQuery);

        return paginationContentPage(
            queryDto.pageNumber,
            queryDto.pageSize,
            blogs,
            Number(totalCount[0].count),
        );
    }

    async getBloggerId(blogId: string): Promise<BlogViewModel> {
        const query = `
            SELECT id, title AS name, description, "websiteUrl", "createdAt"
              FROM public.blogs
             WHERE id = $1
        `
        const result = await this.dataSource.query(query, [blogId])

        return result[0]
    }

    async blogExist(blogId: string): Promise<string> {
        const query = `
            SELECT "bloggerId"
              FROM public.blogs
             WHERE id = $1
        `
        const result = await this.dataSource.query(query, [blogId])

        return result[0].bloggerId
    }

    private getFilter(userId: string | null): string {
        if (userId) {
            return `WHERE "userId" = '${userId}'`
        }
        return ''
    }

    private searchNameFilter(query: QueryParametersDto): string {
        const { searchNameTerm } = query

        const name = `name ILIKE '%${searchNameTerm}%'`;

        if (name) return name;
        return '';
    }
}
