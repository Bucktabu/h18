import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {AuthBearerGuard} from "../../../guards/auth.bearer.guard";
import {BloggerBlogService} from "../application/blogger-blogs.service";
import {QueryParametersDto} from "../../../global-model/query-parameters.dto";
import {User} from "../../../decorator/user.decorator";
import {UserDBModel} from "../../super-admin/infrastructure/entity/userDB.model";
import {BlogDto} from "./dto/blog.dto";
//import {BlogViewModel} from "./dto/blogView.model";
import {PgQueryBlogsRepository} from "../../public/blogs/infrastructure/pg-query-blogs.repository";
import {BloggerPostsService} from "../application/blogger-posts.service";
import {ForbiddenGuard} from "../../../guards/forbidden.guard";
import {PostDto} from "./dto/post.dto";
import {CommentsRepository} from "../../public/comments/infrastructure/comments.repository";
import {ContentPageModel} from "../../../global-model/contentPage.model";

@UseGuards(AuthBearerGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
    constructor(
        protected blogsService: BloggerBlogService,
        protected postsService: BloggerPostsService,
        protected queryBlogsRepository: PgQueryBlogsRepository,
        protected queryCommentsRepository: CommentsRepository
    ) {}

    @Get()
    getBlogs(@Query() query: QueryParametersDto, @User() user: UserDBModel): Promise<ContentPageModel> {
        return this.queryBlogsRepository.getBlogs(query, user.id);
    }

    @Get('comments')
    getComments(@Query() query: QueryParametersDto, @User() user: UserDBModel) {
        return this.queryCommentsRepository.getComments(user.id, query);
    }

    @Post()
    @HttpCode(201)
    createBlog(
        @Body() dto: BlogDto,
        @User() user: UserDBModel,
    )/*: Promise<BlogViewModel>*/ {
        const createdBlog = this.blogsService.createBlog(user.id, dto);

        if (!createdBlog) {
            throw new Error('Blog was not created');
        }

        //return createdBlog;
    }

    @UseGuards(ForbiddenGuard)
    @Post(':blogId/posts')
    @HttpCode(201)
    async createPostByBlogId(
        @Body() dto: PostDto,
        @Param('blogId') blogId: string,
    ) {
        const createdPost = await this.postsService.createPost(dto, blogId);
        return createdPost;
    }

    @UseGuards(ForbiddenGuard)
    @Put(':blogId')
    @HttpCode(204)
    async updateBlog(
        @Body() inputModel: BlogDto,
        @Param('blogId') blogId: string,
    ) {
        const result = await this.blogsService.updateBlog(blogId, inputModel);

        if (!result) {
            throw new NotFoundException();
        }

        return;
    }

    @UseGuards(ForbiddenGuard)
    @Put(':blogId/posts/:postId')
    @HttpCode(204)
    async updatePost(@Body() dto: PostDto, @Param('postId') postId: string) {
        const result = await this.postsService.updatePost(postId, dto);

        if (!result) {
            throw new NotFoundException();
        }

        return;
    }

    @UseGuards(ForbiddenGuard)
    @Delete(':blogId')
    @HttpCode(204)
    async deleteBlog(@Param('blogId') blogId: string) {
        console.log(blogId);
        const result = await this.blogsService.deleteBlog(blogId);

        if (!result) {
            throw new NotFoundException();
        }

        return;
    }

    @UseGuards(ForbiddenGuard)
    @Delete(':blogId/posts/:postId')
    @HttpCode(204)
    async deletePost(@Param('postId') postId: string) {
        const result = await this.postsService.deletePost(postId);

        if (!result) {
            throw new NotFoundException();
        }

        return;
    }
}