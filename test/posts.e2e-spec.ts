import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { createApp } from "../src/helpers/create-app";
import request from "supertest";
import { preparedPost, preparedUser, superUser } from "./helper/prepeared-data";
import { getPostsByBlogId } from "./helper/expect-models";
import { UserViewModelWithBanInfo } from "../src/modules/super-admin/api/dto/user.view.model";

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
        .send(preparedUser.valid)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(201)

      const token = await request(server)
        .post(`/auth/login`)
        .send(preparedUser.login)
        .set({ 'user-agent': 'chrome/0.1' })
        .expect(200)

      const blog1 = await request(server)
        .post(`/blogger/blogs`)
        .send({
          name: 'BlogName5',
          description: 'valid description',
          websiteUrl: 'https://someUrl1.io/'
        })
        .set({Authorization: `Bearer ${token.body.accessToken}`})
        .expect(201)

      const blog2 = await request(server)
        .post(`/blogger/blogs`)
        .send({
          name: 'BlogName4',
          description: 'valid description',
          websiteUrl: 'https://someUrl2.io/'
        })
        .set({Authorization: `Bearer ${token.body.accessToken}`})
        .expect(201)

      expect.setState({user: user.body})
      expect.setState({token: token.body})
      expect.setState({blog1: blog1.body})
      expect.setState({blog2: blog2.body})
    })

    it('Create posts', async () => {
      const { token, blog1 , blog2} = expect.getState()

      console.log(blog2, 'blog2');
      console.log(token, 'token');

      await request(server)
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .send(preparedPost.valid)
        // .set({Authorization: `Bearer ${token.accessToken}`})
        .auth(token.accessToken, {type: 'bearer'})
        .expect(201)

      console.log(blog1, 'blog1');
      const post1 = await request(server)
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send({
          title: 'PostName1',
          shortDescription: 'SomeOneShortDescription1',
          content: 'SomeOneContent3'
        })
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      const post2 = await request(server)
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send({
          title: 'PostName2',
          shortDescription: 'SomeOneShortDescription2',
          content: 'SomeOneContent1'
        })
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      const post3 = await request(server)
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send({
          title: 'PostName3',
          shortDescription: 'SomeOneShortDescription3',
          content: 'SomeOneContent1'
        })
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      expect.setState({items1: [post3.body, post2.body, post3.body]})
    })

    it('Create posts', async () => {
      const token = expect.getState().token
      const blog1 = expect.getState().blog1
      const blog2 = expect.getState().blog2

        console.log(blog2, 'blog from test') // TODO trabl1

      const post0 = await request(server)
        .post(`/blogger/blogs/${blog2.id}/posts`)
        .send(preparedPost.valid)
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

        console.log(post0, 'post from test')

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
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      const post2 = await request(server)
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send({
          title: 'PostName2',
          shortDescription: 'SomeOneShortDescription2',
          content: 'SomeOneContent1'
        })
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      const post3 = await request(server)
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send({
          title: 'PostName3',
          shortDescription: 'SomeOneShortDescription3',
          content: 'SomeOneContent1'
        })
        .set({Authorization: `Bearer ${token.accessToken}`})
        .expect(201)

      expect.setState({post0: post0.body})
      expect.setState({post1: post1.body})
      expect.setState({post2: post2.body})
      expect.setState({post3: post3.body})
    })

    // describe('Return all posts', () => {
    //   it('Return posts without query', async () => {
    //     const blog = expect.getState().blog1
    //
    //     const response = await request(server)
    //       .get(`/posts`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: [
    //         getPostsByBlogId(3, 3, blog),
    //         getPostsByBlogId(2, 3, blog),
    //         getPostsByBlogId(1, 3, blog),
    //       ]
    //     })
    //   })
    //
    //   it('Return posts with sorting and pagination', async () => {
    //     const blog = expect.getState().blog1
    //
    //     const response = await request(server)
    //       .get(`/posts?sortBy=title&sortDirection=asc&pageNumber=2&pageSize=2`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: [
    //         getPostsByBlogId(3, 3, blog)
    //       ]
    //     })
    //   })
    //
    //   it('Return posts with sorting and pagination', async () => {
    //     const blog = expect.getState().blog1
    //
    //     const response = await request(server)
    //       .get(`/posts?sortBy=content&sortDirection=desc&pageSize=2`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: [
    //         getPostsByBlogId(3, 3, blog),
    //         getPostsByBlogId(2, 3, blog)
    //       ]
    //     })
    //   })
    // })

    // describe('Return post by id', () => {
    //   it('Try find not exist post', async () => {
    //     await request(server)
    //       .get(`/posts/500`)
    //       .expect(404)
    //   })
    //
    //   it('Should return post by id', async () => {
    //     const blog = expect.getState().blog1
    //     const post = expect.getState().post1
    //     const response = await request(server)
    //       .get(`/posts/${post.id}`)
    //       .expect(200)
    //
    //     expect(response.body).toBe(getPostsByBlogId(1, 1, blog))
    //   })
    // })

    // describe('Create new comment', () => {
    //   it('Unauthorized user try create comment', async () => {
    //     const post = expect.getState().post1
    //
    //     await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "stringstringstringst"})
    //       .expect(401)
    //   })
    //
    //   it('Try create comment for post with specified postId doesn`t exists', async () => {
    //     const token = expect.getState().token
    //
    //     await request(server)
    //       .post(`/posts/500/comments`)
    //       .send({content: "aBqFljveZokLojESGyqiRg"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(404)
    //   })
    //
    //   it('Try create comment with short input data', async () => {
    //     const post = expect.getState().post1
    //     const token = expect.getState().token
    //
    //     await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "BqFljveZokLojESGyqi"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(400)
    //   })
    //
    //   it('Try create comment with long input data', async () => {
    //     const post = expect.getState().post1
    //     const token = expect.getState().token
    //
    //     await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "WOYrXLGOlXAYUYiZWdISgtqlRVZeakwOeRbRDDfJkpqsjZpAPkLsmTyhIOhifNjMoyRNrTnKWlTKZxfTscTYLBFmNWUBrLopVUXKVrsgeFZPVMWzVnCsbQJqwvHwviyZzgpBpdbUSfnVvktIWyBFvfqPTNFfohVFSHikdXfmgdWtTCmlZBynERyjFcIlMUmYSPPjhnXIPxhJIyHDBDstPGFHuzepkmktMyvJyXYFHztZRpqAdjmAbPHfnCooIBkwWfIyqApnKHhjgXlVNsQdYsxSqvkrdewtmabbXRRqJlwwv"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(400)
    //   })
    //
    //   it('Should return created comment', async () => {
    //     const post = expect.getState().post1
    //     const token = expect.getState().token
    //     const user: UserViewModelWithBanInfo = expect.getState().user
    //
    //     const response = await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "aBqFljveZokLojESGyqiRg"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(201)
    //
    //     expect(response.body).toBe({
    //       id: expect.any(String),
    //       content: "aBqFljveZokLojESGyqiRg",
    //       userId: user.id,
    //       userLogin: user.login,
    //       createdAt: expect.any(String),
    //       likesInfo: {
    //         likesCount: 0,
    //         dislikesCount: 0,
    //         myStatus: "None"
    //       }
    //     })
    //   })
    // })

    // describe('Return comments for specified post', () => {
    //   it('Create comments', async () => {
    //     const post = expect.getState().post2
    //     const token = expect.getState().token
    //
    //     const comment1 = await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "3aBqFljveZokLojESGyqiRg"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(201)
    //
    //     const comment2 = await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "2aBqFljveZokLojESGyqiRg"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(201)
    //
    //     const comment3 = await request(server)
    //       .post(`/posts/${post.id}/comments`)
    //       .send({content: "1aBqFljveZokLojESGyqiRg"})
    //       .set({Authorization: `Bearer ${token.body.accessToken}`})
    //       .expect(201)
    //
    //     expect.setState({comment1: comment1.body})
    //     expect.setState({items1: [comment3.body, comment2.body, comment1.body]})
    //     expect.setState({items2: [comment1.body, comment2.body]})
    //   })
    //
    //   it('Try find comment for passed postId doesn`t exist', async () => {
    //     await request(server)
    //       .get(`/posts/500/comments`)
    //       .expect(404)
    //   })
    //
    //   it('Return all comments without query', async () => {
    //     const post = expect.getState().post2
    //     const items = expect.getState().items1
    //
    //     const response = await request(server)
    //       .get(`/posts/${post.id}/comments`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: items
    //     })
    //   })
    //
    //   it('Return comments with sorting and pagination', async () => {
    //     const post = expect.getState().post2
    //     const comment = expect.getState().comment1
    //
    //     const response = await request(server)
    //       .get(`/posts/${post.id}/comments?sortBy=content&sortDirection=asc&pageNumber=2&pageSize=2`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: [comment]
    //     })
    //   })
    //
    //   it('Return comments with sorting and pagination', async () => {
    //     const post = expect.getState().post2
    //     const items = expect.getState().items2
    //
    //     const response = await request(server)
    //       .get(`/posts/${post.id}/comments?sortBy=content&sortDirection=desc&pageSize=2`)
    //       .expect(200)
    //
    //     expect(response.body).toBe({
    //       pagesCount: 1,
    //       page: 1,
    //       pageSize: 10,
    //       totalCount: 3,
    //       items: items
    //     })
    //   })
    // })
  })
});