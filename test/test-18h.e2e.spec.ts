import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { preparedUser, superUser } from './helper/prepeared-data';
import { createApp } from '../src/helpers/create-app';
import { EmailManager } from '../src/modules/public/auth/email-transfer/email.manager';
import { EmailManagerMock } from './mock/emailAdapter.mock';
import {getErrorMessage} from "./helper/helpers";

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
    //app.use({ "trust proxy": true})
    await app.init();
    server = await app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('sa/users', () => {

    it('Drop all data.', () => {
      request(server)
          .delete('/testing/all-data')
          .expect(204)
    })

    it('Unauthorized sa try create user', async () => {
      await request(server)
        .post(`/sa/users`)
        .send(preparedUser.valid)
        .auth(superUser.notValid.login, superUser.notValid.password, { type: 'basic' })
        .expect(401)
    })

      it('Sa try create user with short input data', async () => {
          const response = await request(server)
              .post(`/sa/users`)
              .send(preparedUser.short)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(400)

          expect(response.body).toEqual(getErrorMessage(['login', 'password', 'email']))
      })

      it('Sa try create user with long input data', async () => {
          const response = await request(server)
              .post(`/sa/users`)
              .send(preparedUser.long)
              .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
              .expect(400)

          expect(response.body).toEqual(getErrorMessage(['login', 'password', 'email']))
      })
  })

  describe(
    'DELETE -> /security/devices/:deviceId: should' +
      'return error if :id from uri param not found; status 404;',
    () => {
      it('Drop all data.', async () => {
        await request(server).delete('/testing/all-data').expect(204);
      });

      it('Create user', async () => {
        await request(server)
          .post(`/sa/users`)
          .send({
            login: 'loSer',
            password: 'qwerty1',
            email: 'email2p@gg.om',
          })
          .auth(superUser.valid.login, superUser.valid.password, {
            type: 'basic',
          })
          .expect(201);
      });

      it('Login, get token and try delete', async () => {
        const token = await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'loSer',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'chrome/0.1' })
          .expect(200);

        await request(server)
          .delete('/security/devices/1')
          .set('Cookie', [token.headers['set-cookie'][0]])
          .expect(404);
      });
    },
  );

  describe(
    'GET -> "/security/devices": login user 4 times from different' +
      'browsers, then get device list; status 200; content: device list; used' +
      'additional methods: POST => /auth/login;GET -> "/security/devices": login' +
      'user 4 times from different browsers, then get device list; status 200;' +
      'content: device list; used additional methods: POST => /auth/login;',
    () => {
      it('Drop all data.', async () => {
        await request(server).delete('/testing/all-data').expect(204);
      });

      it('Registration user', async () => {
        await request(server)
          .post(`/sa/users`)
          .send({
            login: 'loSer',
            password: 'qwerty1',
            email: 'email2p@gg.om',
          })
          .auth(superUser.valid.login, superUser.valid.password, {
            type: 'basic',
          })
          .expect(201);
      });

      it('login user 4 times from different browsers', async () => {
        await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'loSer',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'chrome/0.1' })
          .expect(200);

        await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'loSer',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'Firefox/0.1' })
          .expect(200);

        await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'loSer',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'Safari/0.1' })
          .expect(200);

        const token = await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'loSer',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'Opera/0.1' })
          .expect(200);

        await request(server)
          .get('/security/devices')
          .set('Cookie', [token.headers['set-cookie'][0]])
          .expect(200);
      });
    },
  );

  describe(
    'DELETE -> "/security/devices/:sessionId": should return error' +
      'if access denied; status 403; used additional methods: GET -> /security/devices,' +
      'POST -> /sa/users;',
    () => {
      it('Drop all data.', async () => {
        await request(server).delete('/testing/all-data').expect(204);
      });

      it('Registration 2 users', async () => {
        await request(server)
          .post(`/sa/users`)
          .send({
            login: 'user1',
            password: 'qwerty1',
            email: 'email1p@gg.om',
          })
          .auth(superUser.valid.login, superUser.valid.password, {
            type: 'basic',
          })
          .expect(201);

        await request(server)
          .post(`/sa/users`)
          .send({
            login: 'user2',
            password: 'qwerty2',
            email: 'email2p@gg.om',
          })
          .auth(superUser.valid.login, superUser.valid.password, {
            type: 'basic',
          })
          .expect(201);
      });

      it('Login users and get devise id', async () => {
        const token1 = await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'user1',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'Firefox/0.1' })
          .set('X-Forwarded-For', '192.168.2.1')
          .expect(200);

        const device = await request(server)
          .get('/security/devices')
          .set('Cookie', [token1.headers['set-cookie'][0]])
          .expect(200);

        const deviceId = device.body[0].deviceId;

        const token2 = await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'user1',
            password: 'qwerty1',
          })
          .set({ 'user-agent': 'Opera/0.1' })
          .set('X-Forwarded-For', '192.168.2.2')
          .expect(200);

        await request(server)
          .delete(`/security/devices/${deviceId}`)
          .set('Cookie', [token2.headers['set-cookie'][0]])
          .expect(403);
      });
    },
  );
});
