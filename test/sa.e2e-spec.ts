import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { EmailManager } from "../src/modules/public/auth/email-transfer/email.manager";
import { EmailManagerMock } from "./mock/emailAdapter.mock";
import { createApp } from "../src/helpers/create-app";
import request from "supertest";
import { banUserDto, preparedUser, superUser } from "./helper/prepeared-data";
import { getErrorMessage } from "./helper/helpers";


describe("e2e tests", () => {
    const second = 1000
    const minute = second * 60
    jest.setTimeout(15 * second);

    let app: INestApplication;
  let server;



  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      // .overrideProvider(EmailManager)
      // .useValue(new EmailManagerMock())
      .compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
     await request(server)
          .delete('/testing/all-data')
          .expect(204)
  });


  // create -> ban -> delete | support method get

  const errorsMessage = getErrorMessage(["login, password, email"]);

  describe('Add new user to the sistem', () => {
      it('SA try create new user without autorisation', async () => {
          await request(server)
              .post(`/sa/users`)
              .send(preparedUser.valid)
              .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
              .expect(401)
      })

      it('SA try create user with short input data', async () => {
          const response = await request(server)
              .post(`/sa/users`)
              .send(preparedUser.short)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(400)

          expect(response.body).toEqual(errorsMessage)
      })

      it('SA try create user with long input data', async () => {
          const response = await request(server)
              .post(`/sa/users`)
              .send(preparedUser.long)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(400)

          expect(response.body).toEqual(errorsMessage)
      })

      it('SA should create user', async () => {
          const response = await request(server)
              .post(`sa/users`)
              .send(preparedUser.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          expect(response.body).toEqual({
              id: expect.any(String),
              login: preparedUser.valid.login,
              email: preparedUser.valid.email,
              createdAt: expect.any(String),
              banInfo: {
                  isBanned: false,
                  banDate: null,
                  banReason: null
              }
          })
      })
  })

  describe('Return users with pagination', () => {
      it('Create five users and ban even users', async() => {
          const user1 = await request(server)
              .post(`sa/users`)
              .send({login: 'User5',
                          password: 'qwerty',
                          email: 'somemail1@gmail.com'})
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          const user2 = await request(server)
              .post(`sa/users`)
              .send({login: 'User4',
                          password: 'qwerty',
                          email: 'somemail2@gmail.com'})
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          const user3 = await request(server)
              .post(`sa/users`)
              .send({login: 'User3',
                          password: 'qwerty',
                          email: 'somemail3@gmail.com'})
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          const user4 = await request(server)
              .post(`sa/users`)
              .send({login: 'User2',
                          password: 'qwerty',
                          email: 'somemail4@gmail.com'})
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          const user5 = await request(server)
              .post(`sa/users`)
              .send({login: 'User1',
                          password: 'qwerty',
                          email: 'somemail5@gmail.com'})
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          expect.setState({
              user1: user1.body,
              user2: user2.body,
              user3: user3.body,
              user4: user4.body,
              user5: user5.body,
              items1: [user5.body, user4.body, user3.body, user2.body, user1.body],
              items2: [user1.body, user3.body, user5.body],
              items3: [user4.body, user2.body],
              items4: [user2.body, user1.body],
              items5: [user5.body, user1.body]
          })

          await request(server)
              .put(`sa/users/${user2.body.id}/ban`)
              .send(banUserDto.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(204)

          await request(server)
              .put(`sa/users/${user4.body.id}/ban`)
              .send(banUserDto.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(204)
      })

      it('Get users without query, should return all users', async () => {
          const response = await request(server)
              .get('sa/users')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const items1 = expect.getState().items1

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 5,
              items: items1
          })
      })

      it('Should return not banned users', async () => {
          const response = await request(server)
              .get('sa/users?banStatus=notBanned&sortBy=login&sortDirection=asc')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const items2 = expect.getState().items2

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 3,
              items: items2
          })
      })

      it('Should return banned users', async () => {
          const response = await request(server)
              .get('sa/users?banStatus=banned&sortBy=email&sortDirection=desc')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const items3 = expect.getState().items3

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 3,
              items: items3
          })
      })

      it('Should return all users with pagination', async () => {
          const response = await request(server)
              .get('sa/users?banStatus=all&pageNumber=2&pageSize=3')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const items4 = expect.getState().items4

          expect(response.body).toEqual({
              pagesCount: 2,
              page: 2,
              pageSize: 3,
              totalCount: 5,
              items: items4
          })
      })

      it('Should return users with pagination and search login term', async () => {
          const response = await request(server)
              .get('sa/users?searchLoginTerm=1')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const userWithTerm = expect.getState().user5

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 1,
              items: [userWithTerm]
          })
      })

      it('Should return users with pagination and search email term', async () => {
          const response = await request(server)
              .get('sa/users?searchEmailTerm=1')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const userWithTerm = expect.getState().user1

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 1,
              items: [userWithTerm]
          })
      })

      it('Should return users with pagination and search login or email term', async () => {
          const response = await request(server)
              .get('sa/users?searchLoginTerm=1&searchEmailTerm=1')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          const items5 = expect.getState().items5

          expect(response.body).toEqual({
              pagesCount: 1,
              page: 1,
              pageSize: 10,
              totalCount: 2,
              items: items5
          })
      })
  })

  describe('Ban/unban user, additional method GET users', () => {
      const errorsMessage = getErrorMessage(['banReason'])

      it('Create user', async () => {
          const response = await request(server)
              .post(`sa/users`)
              .send(preparedUser.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          expect.setState({user: response.body})
      })

      const user = expect.getState().user

      it('SA try ban user without autorisation', async () => {
          await request(server)
              .put(`sa/users/${user.id}/ban`)
              .send(banUserDto.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(401)
      })

      it('SA try ban user with incorrect input data', async () => {
          const response = await request(server)
              .put(`sa/users/${user.id}/ban`)
              .send(banUserDto.notValid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(400)

          expect(response.body).toEqual(errorsMessage)
      })

      it('SA should ban user', async () => {
          await request(server)
              .put(`sa/users/${user.id}/ban`)
              .send(banUserDto.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(204)

          const response = await request(server)
              .get('sa/users')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          expect(response.body.items.banInfo).toEqual({
              isBanned: true,
              banDate: expect.any(String),
              banReason: banUserDto.valid.banReason
          })
      })

      it('SA should unban user', async () => {
          await request(server)
              .put(`sa/users/${user.id}/ban`)
              .send(banUserDto.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(204)

          const response = await request(server)
              .get('sa/users')
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(200)

          expect(response.body.items.banInfo).toEqual({
              isBanned: false,
              banDate: null,
              banReason: null
          })
      })
  })

  describe('Delete user specified by id', () => {
      it('Create user', async () => {
          const response = await request(server)
              .post(`sa/users`)
              .send(preparedUser.valid)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(201)

          expect.setState({user: response.body})
      })

      const user = expect.getState().user

      it('SA try delete user without autorisation', async () => {
          await request(server)
              .delete(`sa/users/${user.id}`)
              .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
              .expect(401)
      })

      it('Should delete user', async () => {
          await request(server)
              .delete(`sa/users/${user.id}`)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(204)
      })

      it('Try delete already deleted user', async () => {
          await request(server)
              .delete(`sa/users/${user.id}`)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(404)
      })
  })
});