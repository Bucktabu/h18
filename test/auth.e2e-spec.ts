import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { banUserDto, preparedUser, superUser } from './helper/prepeared-data';
import { isEmail, isUUID } from 'class-validator';
import { getErrorMessage } from './helper/helpers';
import { createApp } from '../src/helpers/create-app';
import { EmailManager } from '../src/modules/public/auth/email-transfer/email.manager';
import { EmailManagerMock } from './mock/emailAdapter.mock';

jest.setTimeout(30000);

describe('e2e tests', () => {
  let app: INestApplication;
  let server;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('Drop all data.', async () => {
    await request(server)
        .delete('/testing/all-data')
        .expect(204)
  })

  describe('Users route tests.', () => {
    const errorsMessages = getErrorMessage(['login', 'password', 'email']);

    it('Delete all data', () => {
      request(server)
        .delete('/testing/all-data')
        .expect(204)
      }
    )

    it('Shouldn`t create new user. 401 - Unauthorized.', () => {
      request(server)
        .post('/sa/users')
        .send(preparedUser.valid)
        .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
        .expect(401)
    })

    it('Shouldn`t create new user. 400 - Short input data.', async () => {
      const response = await request(server)
        .post('/sa/users')
        .send(preparedUser.short)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(400)

      expect(response.body).toStrictEqual({ errorsMessages })
    })

    it('Shouldn`t create new user. 400 - Long input data.', async () => {
      const response = await request(server)
        .post('/sa/users')
        .send(preparedUser.long)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(400)

      expect(response.body).toStrictEqual({ errorsMessages })
    })

    it('Should create new user. 201 - Created.', async () => {
      const response = await request(server)
        .post('/sa/users')
        .send(preparedUser.valid)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(201)

      expect(isUUID(response.body.id)).toBeTruthy()
      expect(isEmail(response.body.email)).toBeTruthy()
      expect(response.body).toStrictEqual({
        id: expect.any(String),
        login: preparedUser.valid.login,
        email: preparedUser.valid.email,
        createdAt: expect.stringMatching(
          /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
        ),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
      })

      expect.setState({ user1: response.body })
    })

    it('Shouldn`t create new user. 400 - Existed login and email.', async () => {
      const response = await request(server)
        .post('/sa/users')
        .send(preparedUser.long)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(400)

      const errorsMessages = getErrorMessage(['login', 'password', 'email'])
      expect(response.body).toStrictEqual({ errorsMessages })
    })

    it('Shouldn`t ban user. 401 - Unauthorized', () => {
      const user = expect.getState().user1

      request(server)
        .put(`/sa/users/${user.id}/ban`)
        .send(
          {
            "isBanned": true,
            "banReason": "stringstringstringst"
          }
        )
        .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
        .expect(401)
    })

    it('Shouldn`t ban user. 400 - Incorrect input model', async () => {
      const user = expect.getState().user1

      const response = await request(server)
        .put(`/sa/users/${user.id}/ban`)
        .send(banUserDto.notValid)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(400)

      const errorsMessages = getErrorMessage(['isBanned', 'banReason'])

      expect(response.body).toStrictEqual({ errorsMessages })
    })

    it('Should ban user. 204 - No content.', async () => {
      const user = expect.getState().user1

      const res = await request(server)
        .put(`/sa/users/${user.id}/ban`)
        .send(banUserDto.valid)
          .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
          .expect(204)
    })

    it('Shouldn`t return users. 401 - Unauthorized.', () => {
      request(server)
        .get('/sa/users')
        .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
        .expect(401)
    })

    it('Should return user. 200 - Success.', async () => {
      const response = await request(server)
        .get('/sa/users')
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(200)
      console.log(response.body.items, 'dsfsfsf')
      expect(response.body).toStrictEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: preparedUser.valid.login,
            email: preparedUser.valid.email,
            createdAt: expect.stringMatching(
              /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
            ),
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: expect.any(String)
            }
          }
        ]
      })
    })

    it('Shouldn`t delete user. 401 - Unauthorized.', () => {
      const user = expect.getState().user1

      request(server)
        .delete(`/sa/users/${user.id}`)
        .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
        .expect(401)
    })

    it('Should delete user. 204 - No Content.', () => {
      const user = expect.getState().user1

      request(server)
        .delete(`/sa/users/${user.id}`)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(204)
    })

    it('Can`t delete an already deleted user. 404 - Not found.', () => {
      const user = expect.getState().user1

      request(server)
        .delete(`/sa/users/${user.id}`)
        .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
        .expect(404)
    })
  })

  describe('Auth router testing (without 429)', () => {
    it('Shouldn`t registration user. 400 - Short input data.', () => {
      request(server)
        .post('/auth/registration')
        .send(preparedUser.short)
        .expect(400)
    })

    it('Shouldn`t registration user. 400 - Long input data.', () => {
      request(server)
        .post('/auth/registration')
        .send(preparedUser.long)
        .expect(400)
    })

    it('Should registration user. 204 - Input data is accepted. Email with confirmation code will be send to passed email address.', () => {
      request(server)
        .post('/auth/registration')
        .send(preparedUser.valid)
        .expect(204)
    })

    it('Shouldn`t registration user. 400 - Existed login and email', () => {
      request(server)
        .post('/auth/registration')
        .send(preparedUser.valid)
        .expect(400)
    })

    it('Shouldn`t resending confirmation code. 400 - Incorrect input data', () => {
      request(server)
        .post('/auth/registration-email-resending')
        .send({email: 'notmailgmail.com'})
        .expect(400)

      request(server)
        .post('/auth/registration-email-resending')
        .send({email: 'notmail@g.com'})
        .expect(400)

      request(server)
        .post('/auth/registration-email-resending')
        .send({email: 'notmail@gmail.c'})
        .expect(400)
    })

    it('Shouldn`t resending confirmation code. 400 - Unregistered mail.', async () => {
      const response = await request(server)
        .post('/auth/registration-email-resending')
        .send({email: 'unregistered@gmail.com'})
        .expect(400)

      const errorsMessages = getErrorMessage(['email'])
      expect(response.body).toStrictEqual({ errorsMessages })
    })

    it('Should resending confirmation code. 204 - Input data is accepted.Email with confirmation code will be send.', () => {
      request(server)
        .post('/auth/registration-email-resending')
        .send(preparedUser.valid.email)
        .expect(204)
    })
  })
});
