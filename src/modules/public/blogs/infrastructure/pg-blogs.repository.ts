import { Injectable } from '@nestjs/common';
import { BlogDto } from '../../../blogger/api/dto/blog.dto';
import { BanStatusModel } from '../../../../global-model/ban-status.model';
import { BindBlogDto } from '../../../super-admin/api/dto/bind-blog.dto';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {BlogDBModel} from "./entity/blog-db.model";
import {BlogViewModel} from "../api/dto/blogView.model";

@Injectable()
export class PgBlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async createBlog(newBlog: BlogDBModel): Promise<BlogViewModel | null> {
    const query = `
      INSERT INTO public.blogs
             (id, title, description, website_url, created_at, "bloggerId")
      VAlUES ($1, $2, $3, $4, $5, $6)  
             RETURNING (id, title, description, website_url, created_at)
    `
    const result = await this.dataSource.query(query, [
      newBlog.id,
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.userId
    ]);

    try {
      const blogArr = result[0].row.slice(1, -1).split(',');
      return {
        id: blogArr[0],
        name: blogArr[1],
        description: blogArr[2],
        websiteUrl: blogArr[3],
        createdAt: blogArr[4],
      }
    } catch (e) {
      return null
    }
  }

  async bindBlog(params: BindBlogDto): Promise<boolean> {
    const query = `
      UPDATE public.blogs
         SET "bloggerId" = $1
       WHERE id = $2
    `
    const result = await this.dataSource.query(query, [params.userId, params.id])

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async updateBlog(id: string, dto: BlogDto): Promise<boolean> {
    const query = `
      UPDATE public.blogs
         SET title = $1, description = $2, website_url = $3
       WHERE id = $4
    `
    const result = await this.dataSource.query(query, [dto.name, dto.description, dto.websiteUrl, id])

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    const query = `
      DELETE FROM public.blogs
       WHERE id = $1;
    `;
    const result = await this.dataSource.query(query, [blogId]);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }
}
