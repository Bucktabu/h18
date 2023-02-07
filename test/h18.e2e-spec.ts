import {INestApplication} from "@nestjs/common";
import {Factories} from "./helper/factories";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {EmailManager} from "../src/modules/public/auth/email-transfer/email.manager";
import {EmailManagerMock} from "./mock/emailAdapter.mock";
import {createApp} from "../src/helpers/create-app";
import request from "supertest";
import {preparedBlog, preparedUser, superUser} from "./helper/prepeared-data";
import {faker} from "@faker-js/faker";
import {bannedUser} from "./helper/exect-blogger.model";

describe('e2e tests', () => {
    const second = 1000;
    jest.setTimeout(30 * second);

    let app: INestApplication;
    let server;
    let factories: Factories;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(EmailManager)
            .useValue(new EmailManagerMock())
            .compile();

        const rawApp = await moduleFixture.createNestApplication();
        app = createApp(rawApp);
        await app.init();
        server = await app.getHttpServer();
        factories = new Factories(server)
    });

    afterAll(async () => {
        await app.close();
    });

    describe('PUT -> "/blogger/users/:id/ban": should unban user by blogger for specified blog;' +
        'status 204; used additional methods: POST => blogger/blogs, GET => "blogger/users/blog/:id;"', () => {

        it('Drop all data.', async () => {
            await request(server)
                .delete('/testing/all-data')
                .expect(204)
        })

        it('Create data', async () => {
            const user1 = await request(server)
                .post(`/sa/users`)
                .send(preparedUser.valid1)
                .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
                .expect(201)

            const token = await request(server)
                .post(`/auth/login`)
                .send(preparedUser.login1)
                .set('User-Agent', faker.internet.userAgent())
                .expect(200)

            const user2 = await request(server)
                .post(`/sa/users`)
                .send(preparedUser.valid2)
                .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
                .expect(201)

            expect.setState({
                user1: user1.body,
                user2: user2.body,
                accessToken: token.body.accessToken,
                refreshToken: (token.headers['set-cookie'][0].split(';')[0]).slice(13)
            })
        })

        it('POST => blogger/blogs', async () => {
            const { accessToken } = expect.getState()

            const response = await request(server)
                .post(`/blogger/blogs`)
                .send(preparedBlog.valid)
                .auth(accessToken, {type: 'bearer'})
                .expect(201)

            expect.setState({blog: response.body})
        })

        it('PUT -> "/blogger/users/:id/ban"', async () => {
            const { accessToken, user2, blog } = expect.getState()

            await request(server)
                .put(`/blogger/users/${user2.id}/ban`)
                .send({
                    isBanned: true,
                    banReason: faker.lorem.words(5),
                    blogId: blog.id
                })
                .auth(accessToken, {type: 'bearer'})
                .expect(204)
        })

        it('1 banned user. GET => "blogger/users/blog/:id;"', async () => {
            const { accessToken, blog, user2 } = expect.getState()

            const response = await request(server)
                .get(`/blogger/users/blog/${blog.id}`)
                .auth(accessToken, {type: 'bearer'})
                .expect(200)

            console.log('banInfo:', response.body.items[0].banInfo)
            expect(response.body.items).toHaveLength(1)
            expect(response.body.items[0]).toEqual(bannedUser(user2))
        })
    })

    describe('PUT -> "/sa/blogs/:id/ban": should ban blog; status 204; used additional methods:' +
        'POST => /blogger/blogs, GET => /blogs, GET => /blogs/:id, GET => /sa/blogs;', () => {

        it('Drop all data.', async () => {
            await request(server)
                .delete('/testing/all-data')
                .expect(204)
        })

        it('Create data', async  () => {
            const [token] = await factories.createAndLoginUsers(1)
            const [blog] = await factories.createBlogs(token.accessToken, 1)

            expect.setState({blogId: blog.id})
        })

        it('PUT -> "/sa/blogs/:id/ban"', async () => {
            const { blogId } = expect.getState()

            await request(server)
                .put(`/sa/blogs/${blogId}/ban`)
                .send({
                    "isBanned": true
                })
                .auth(superUser.valid.login, superUser.valid.password, {type: "basic"})
                .expect(204)
        })

        it('GET => /sa/blogs', async () => {
            const response = await request(server)
                .get(`/sa/blogs`)
                .auth(superUser.valid.login, superUser.valid.password, {type: "basic"})
                .expect(200)

            console.log('Banned blog:', response.body.items[0])
            expect(response.body.items).toHaveLength(1)
        })
    })
})