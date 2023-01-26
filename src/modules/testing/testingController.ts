import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`
      DELETE FROM post_reactions;
      DELETE FROM security;    
      DELETE FROM banned_blog;
      DELETE FROM banned_users_for_blog;
      DELETE FROM comments;
      DELETE FROM comment_reactions;
      DELETE FROM posts;
      DELETE FROM blogs;
      DELETE FROM user_ban_info;
      DELETE FROM security;
      DELETE FROM email_confirmation;
      DELETE FROM token_black_list;
      DELETE FROM users;
    `);
  }
}
