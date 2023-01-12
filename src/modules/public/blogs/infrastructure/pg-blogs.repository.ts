import { Injectable } from '@nestjs/common';
import { giveSkipNumber } from '../../../../helper.functions';
import { BlogDto } from '../../../blogger/api/dto/blog.dto';
import { BanStatusModel } from '../../../../global-model/ban-status.model';
import { BindBlogDto } from '../../../super-admin/api/dto/bind-blog.dto';

import {QueryParametersDto} from "../../../../global-model/query-parameters.dto";
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
             (id, title, description, website_url, created_at, is_banned, "bloggerId")
      VAlUES ($1, $2, $3, $4, $5, $6, $7)  
             RETURNING (id, title, description, website_url, created_at, is_banned, "bloggerId")
    `
    const result = await this.dataSource.query(query, [
      newBlog.id,
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isBanned,
      newBlog.userId
    ]);

    const blogArr = result[0].row.slice(1, -1).split(',');

    //TODO here
  }

  async bindBlog(params: BindBlogDto): Promise<boolean> {
    const result = await this.blogsRepository.updateOne(
      { id: params.id },
      { $set: { userId: params.userId } },
    );

    return result.matchedCount === 1;
  }

  async updateBlog(id: string, inputModel: BlogDto): Promise<boolean> {
    const result = await this.blogsRepository.updateOne(
      { id },
      {
        $set: {
          name: inputModel.name,
          description: inputModel.description,
          websiteUrl: inputModel.websiteUrl,
        },
      },
    );

    return result.matchedCount === 1;
  }

  async updateBanStatus(id: string, isBanned: boolean): Promise<boolean> {
    const result = await this.blogsRepository.updateOne(
      { $or: [{ id }, { userId: id }] },
      { $set: { isBanned } },
    );

    return result.matchedCount === 1;
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    const result = await this.blogsRepository.deleteOne({ id: blogId });

    return result.deletedCount === 1;
  }

  private userIdFilter(userId: string | null) {
    let filter = {};
    if (userId) {
      filter = { userId };
    }

    return filter;
  }

  private banStatusFilter(banStatus: string | null) {
    let filter = {};
    if (banStatus === BanStatusModel.Banned) {
      filter = { isBanned: true };
    } else if (banStatus === BanStatusModel.NotBanned) {
      filter = { isBanned: false };
    }

    return filter;
  }
}
