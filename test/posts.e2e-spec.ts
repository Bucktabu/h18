import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { createApp } from "../src/helpers/create-app";
import request from "supertest";
import { preparedPost, preparedUser, superUser } from "./helper/prepeared-data";
import {getPosts, getPostsByBlogId, getStandardPosts} from "./helper/expect-post-models";
import { v4 as uuidv4 } from 'uuid';
import {UserViewModelWithBanInfo} from "../src/modules/super-admin/api/dto/user.view.model";
import {getCreatedComment} from "./helper/expect-comment-model";

describe('e2e tests', () => {
  const second = 1000;
  jest.setTimeout(30 * second);

  let app: INestApplication;
  let server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public posts', () => {
    it('Clear date base', async () => {
      await request(server)
          .delete(`/testing/all-data`)
          .expect(204)
    })

    it('Creat blogs', async () => {
      const user = await request(server)
          .post(`/sa/users`)
          .send(preparedUser.valid1)
          .auth(superUser.valid.login, superUser.valid.password, {type: 'basic'})
          .expect(201)

      const token = await request(server)
          .post(`/auth/login`)
          .send(preparedUser.login1)
          .set({'user-agent': 'chrome/0.1'})
          .expect(200)

      const blog1 = await request(server)
          .post(`/blogger/blogs`)
          .send({
            name: 'BlogName5',
            description: 'valid description',
            websiteUrl: 'https://someUrl1.io/'
          })
          .auth(token.body.accessToken, {type: 'bearer'})
          .expect(201)

      const blog2 = await request(server)
          .post(`/blogger/blogs`)
          .send({
            name: 'BlogName4',
            description: 'valid description',
            websiteUrl: 'https://someUrl2.io/'
          })
          .auth(token.body.accessToken, {type: 'bearer'})
          .expect(201)

      expect.setState({user: user.body})
      expect.setState({token: token.body})
      expect.setState({blog1: blog1.body})
      expect.setState({blog2: blog2.body})
    })

    it('Create posts', async () => {
      const token = expect.getState().token
      const blog1 = expect.getState().blog1
      const blog2 = expect.getState().blog2

      const post0 = await request(server)
          .post(`/blogger/blogs/${blog2.id}/posts`)
          .send(preparedPost.valid)
          .auth(token.accessToken, {type: 'bearer'})
          .expect(201)

      // TODO fabric
      // const posts = []
      //
      // for (let i = 1; i <= 3; i++){
      //   const post = await request(server)
      //     .post(`/blogger/blogs/${blog1.id}/posts`)
      //     .send({
      //       title: `PostName${i}`,
      //       shortDescription: `SomeOneShortDescription${i}`,
      //       content: `SomeOneContent${4 - i}`
      //     })
      //     .set({Authorization: `Bearer ${token.accessToken}`})
      //     .expect(201)
      //   posts.push(post.body)
      // }

      const post1 = await request(server)
          .post(`/blogger/blogs/${blog1.id}/posts`)
          .send({
            title: 'PostName1',
            shortDescription: 'SomeOneShortDescription1',
            content: 'SomeOneContent3'
          })
          .auth(token.accessToken, {type: 'bearer'})
          .expect(201)

      const post2 = await request(server)
          .post(`/blogger/blogs/${blog1.id}/posts`)
          .send({
            title: 'PostName2',
            shortDescription: 'SomeOneShortDescription2',
            content: 'SomeOneContent2'
          })
          .auth(token.accessToken, {type: 'bearer'})
          .expect(201)

      const post3 = await request(server)
          .post(`/blogger/blogs/${blog1.id}/posts`)
          .send({
            title: 'PostName3',
            shortDescription: 'SomeOneShortDescription3',
            content: 'SomeOneContent1'
          })
          .auth(token.accessToken, {type: 'bearer'})
          .expect(201)

      expect.setState({post0: post0.body})
      expect.setState({post1: post1.body})
      expect.setState({post2: post2.body})
      expect.setState({post3: post3.body})
    })

    describe('Return all posts', () => {
      it('Return posts without query', async () => {
        const blog1 = expect.getState().blog1
        const blog2 = expect.getState().blog2

        const response = await request(server)
          .get(`/posts`)
          .expect(200)

        expect(response.body).toStrictEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [
            getPosts(3, 3, blog1),
            getPosts(2, 3, blog1),
            getPosts(1, 3, blog1),
            getStandardPosts(blog2)
          ]
        })
      })

      it('Return posts with sorting and pagination', async () => {
        const blog1 = expect.getState().blog1
        const blog2 = expect.getState().blog2

        const response = await request(server)
          .get(`/posts?sortBy=title&sortDirection=asc&pageNumber=2&pageSize=2`)
          .expect(200)

        expect(response.body).toStrictEqual({
          pagesCount: 2,
          page: 2,
          pageSize: 2,
          totalCount: 4,
          items: [
            getPosts(3, 3, blog1),
            getStandardPosts(blog2)
          ]
        })
      })

      it('Return posts with sorting and pagination', async () => {
        const blog = expect.getState().blog1

        const response = await request(server)
          .get(`/posts?sortBy=content&sortDirection=desc&pageSize=2`)
          .expect(200)

        expect(response.body).toStrictEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [
            getPostsByBlogId(3, 3, blog),
            getPostsByBlogId(2, 3, blog)
          ]
        })
      })
    })

    describe('Return post by id', () => {
      it('Try find not exist post', async () => {
        const randomUUID = uuidv4()

        await request(server)
          .get(`/posts/${randomUUID}`)
          .expect(404)
      })

      it('Should return post by id', async () => {
        const blog = expect.getState().blog1
        const post = expect.getState().post1
        const response = await request(server)
          .get(`/posts/${post.id}`)
          .expect(200)

        expect(response.body).toStrictEqual(getPosts(1, 3, blog))
      })
    })

    describe('Create new comment', () => {
      it('Unauthorized user try create comment', async () => {
        const post = expect.getState().post1

        await request(server)
          .post(`/posts/${post.id}/comments`)
          .send({content: "stringstringstringst"})
          .expect(401)
      })

      it('Try create comment for post with specified postId doesn`t exists', async () => {
        const token = expect.getState().token
        const randomId = uuidv4()

        await request(server)
          .post(`/posts/${randomId}/comments`)
          .send({content: "aBqFljveZokLojESGyqiRg"})
          .auth(token.accessToken, {type: 'bearer'})
          .expect(404)
      })

      it('Try create comment with short input data', async () => {
        const post = expect.getState().post1
        const token = expect.getState().token

        await request(server)
          .post(`/posts/${post.id}/comments`)
          .send({content: "BqFljveZokLojESGyqi"})
          .auth(token.accessToken, {type: 'bearer'})
          .expect(400)
      })

      it('Try create comment with long input data', async () => {
        const post = expect.getState().post1
        const token = expect.getState().token

        await request(server)
          .post(`/posts/${post.id}/comments`)
          .send({content: "WOYrXLGOlXAYUYiZWdISgtqlRVZeakwOeRbRDDfJkpqsjZpAPkLsmTyhIOhifNjMoyRNrTnKWlTKZxfTscTYLBFmNWUBrLopVUXKVrsgeFZPVMWzVnCsbQJqwvHwviyZzgpBpdbUSfnVvktIWyBFvfqPTNFfohVFSHikdXfmgdWtTCmlZBynERyjFcIlMUmYSPPjhnXIPxhJIyHDBDstPGFHuzepkmktMyvJyXYFHztZRpqAdjmAbPHfnCooIBkwWfIyqApnKHhjgXlVNsQdYsxSqvkrdewtmabbXRRqJlwwv"})
          .auth(token.accessToken, {type: 'bearer'})
          .expect(400)
      })

      it('Should return created comment', async () => {
        const post = expect.getState().post1
        const token = expect.getState().token
        const user: UserViewModelWithBanInfo = expect.getState().user

        const response = await request(server)
          .post(`/posts/${post.id}/comments`)
          .send({content: "aBqFljveZokLojESGyqiRg"})
          .auth(token.accessToken, {type: 'bearer'})
          .expect(201)

        expect(response.body).toStrictEqual(getCreatedComment(user))
        })
      })
    })

    describe('Return comments for specified post', () => {
      it('Create comments', async () => {
        const post = expect.getState().post2
        const token = expect.getState().token

        const comment1 = await request(server)
            .post(`/posts/${post.id}/comments`)
            .send({content: "3aBqFljveZokLojESGyqiRg"})
            .auth(token.accessToken, {type: 'bearer'})
            .expect(201)

        const comment2 = await request(server)
            .post(`/posts/${post.id}/comments`)
            .send({content: "2aBqFljveZokLojESGyqiRg"})
            .auth(token.accessToken, {type: 'bearer'})
            .expect(201)

        const comment3 = await request(server)
            .post(`/posts/${post.id}/comments`)
            .send({content: "1aBqFljveZokLojESGyqiRg"})
            .auth(token.accessToken, {type: 'bearer'})
            .expect(201)

        expect.setState({comment1: comment1.body, comment2: comment2.body, comment3: comment3.body})
      })

      it('Try find comment for passed postId doesn`t exist', async () => {
        const randomId = uuidv4()

        await request(server)
            .get(`/posts/${randomId}/comments`)
            .expect(404)
      })

      it('Return all by post id comments without query', async () => {
        const post = expect.getState().post2
        const {comment1} = expect.getState()
        const {comment2} = expect.getState()
        const {comment3} = expect.getState()

        const response = await request(server)
            .get(`/posts/${post.id}/comments`)
            .expect(200)

        expect(response.body).toStrictEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [comment3, comment2, comment1]
        })
      })

      it('Return comments with sorting and pagination', async () => {
        const {user, post2, comment1, comment2, comment3} = expect.getState()

        const response1 = await request(server)
            .get(`/posts/${post2.id}/comments?sortBy=content&sortDirection=asc&pageNumber=2&pageSize=2`)
            .expect(200)

        expect(response1.body).toStrictEqual({
          pagesCount: 2,
          page: 2,
          pageSize: 2,
          totalCount: 3,
          items: [comment1]
        })

        const response = await request(server)
          .get(`/posts/${post2.id}/comments?sortDirection=desc&pageSize=2`)
          .expect(200)

        expect(response.body).toStrictEqual({
          pagesCount: 2,
          page: 1,
          pageSize: 2,
          totalCount: 3,
          items: [comment3, comment2]
        })
      })
    })
});