import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {banUserDto, preparedPassword, preparedSecurity, preparedUser, superUser} from './helper/prepeared-data';
import { isEmail, isUUID } from 'class-validator';
import { getErrorMessage } from './helper/helpers';
import { createApp } from '../src/helpers/create-app';
import { EmailManager } from '../src/modules/public/auth/email-transfer/email.manager';
import { EmailManagerMock } from './mock/emailAdapter.mock';
import {randomUUID} from "crypto";

describe('e2e tests', () => {
  const second = 1000;
  jest.setTimeout(30 * second);

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

  describe('Auth router testing (without 429)', () => {
    describe('Registration user in system', () => {
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

      it('Shouldn`t registration user. 400 - Existed login and email', () => {
        request(server)
            .post('/auth/registration')
            .send(preparedUser.valid)
            .expect(400)
      })

      it('Should registration user. 204 - Input data is accepted. Email with confirmation code will be send to passed email address.', async () => {
        await request(server)
            .post('/auth/registration')
            .send(preparedUser.valid)
            .expect(204)

        const response = await request(server)
            .get(`/sa/users`)
            .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
            .expect(200)

        expect(response.body.items).toHaveLength(1)

        expect.setState({user: response.body.items[0]})
      })
    })

    describe('Resending confirmation code', () => {
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

      it('Should resending confirmation code. 204 - Input data is accepted.Email with confirmation code will be send.', async () => {
        const response = await request(server)
            .get(`/sa/users`)
            .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
            .expect(200)

        const oldConfirmationCode = await request(server)
            .get(`/testing/confirmation-code/${response.body.items[0].id}`)
            .expect(200)

        await request(server)
            .post('/auth/registration-email-resending')
            .send({email: preparedUser.valid.email})
            .expect(204)

        const newConfirmationCode = await request(server)
            .get(`/testing/is-confirmed/${response.body.items[0].id}`)
            .expect(200)

        expect(oldConfirmationCode.body).not.toEqual(newConfirmationCode.body)

        expect.setState({confirmationCode: newConfirmationCode})
      })
    })

    describe('Confirm registration', () => {
      it('Shouldn`t confirmed if the confirmation code is incorrect', async () => {
        const response = await request(server)
            .get(`/sa/users`)
            .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
            .expect(200)

        expect.setState({userId: response.body.items[0].id})

        const confirmationCode = await request(server)
            .get(`/testing/confirmation-code/${response.body.items[0].id}`)
            .expect(200)

        request(server)
            .post(`/registration-confirmation`)
            .send({code: `${confirmationCode.body}-1`})
            .expect(400)
      })

      it('Shouldn`t confirmed if the confirmation code is expired', async () => {
        const { userId } = expect.getState()

        await request(server)
            .put(`/testing/set-expiration-date/${userId}`)
            .expect(204)

        const confirmationCode = await request(server)
            .get(`/testing/confirmation-code/${userId}`)
            .expect(200)

        request(server)
            .post(`/registration-confirmation`)
            .send({code: confirmationCode.body})
            .expect(400)
      })

      it('Email was verified. Account was activated', async () => {
        const { userId } = expect.getState()

        const confirmationCode = await request(server)
            .get(`/testing/confirmation-code/${userId}`)
            .expect(200)

        request(server)
            .post(`/registration-confirmation`)
            .send({code: confirmationCode.body})
            .expect(204)

        expect.setState({confirmationCode: confirmationCode})
      })

      it('Shouldn`t confirmed if the confirmation code is already been applied', async () => {
        const { confirmationCode } = expect.getState()

        request(server)
            .post(`/registration-confirmation`)
            .send({code: confirmationCode.body})
            .expect(400)
      })
    })

    describe('Password recovery via Email confirmation', () => {
      it('If the inputModel has invalid email', async () => {
        await request(server)
            .post(`/auth/password-recovery`)
            .send(preparedSecurity.email.notValid)
            .expect(400)
      })

      it('Shouldn`t return error even if current email is not registered (for prevent user`s email detection)', async () => {
        await request(server)
            .post(`/auth/password-recovery`)
            .send(preparedSecurity.email.notExist)
            .expect(204)
      })

      it('Should update confirmation code', async () => {
        const user = await request(server)
            .get('/sa/users')
            .send(preparedUser.valid)
            .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
            .expect(200)

        const oldConfirmationCode = await request(server)
            .get(`/testing/confirmation-code/${user.body.items[0].id}`)
            .expect(200)

        await request(server)
            .post(`/auth/password-recovery`)
            .send(preparedSecurity.email.valid)
            .expect(204)

        const newConfirmationCode = await request(server)
            .get(`/testing/confirmation-code/${user.body.items[0].id}`)
            .expect(200)

        expect(oldConfirmationCode).not.toEqual(newConfirmationCode)
      })
    })

    describe('Confirm password recovery (without 429)', () => {
      it('Shouldn`t confirm password recovery if incorrect input data', async () => {
        const errorsMessages = getErrorMessage(['newPassword', 'recoveryCode'])
        const randomCode = randomUUID()

        const response1 = await request(server)
            .post(`/auth/new-password`)
            .send({
              newPassword: preparedPassword.short,
              recoveryCode: randomCode
            })
            .expect(400)

        expect(response1.body).toEqual({errorsMessages})

        const response2 = await request(server)
            .post(`/auth/new-password`)
            .send({
              newPassword: preparedPassword.long,
              recoveryCode: randomCode
            })
            .expect(400)

        expect(response2.body).toEqual({errorsMessages})
      })

      it('Shouldn`t confirm password recovery if recovery code expired', async () => {
        const {user} = expect.getState()
        const errorsMessages = getErrorMessage(['recoveryCode'])

        await request(server)
            .put(`/testing/set-expiration-date/${user.id}`)
            .expect(204)

        const recoveryCode = await request(server)
            .get(`/testing/confirmation-code/${user.id}`)
            .expect(200)

        const response = await request(server)
            .post(`/auth/new-password`)
            .send({
              newPassword: preparedPassword.newPass,
              recoveryCode: recoveryCode.body
            })
            .expect(400)

        expect(response.body).toEqual({errorsMessages})
      })

      it('Confirm password recovery', async () => {

      })
    })

    describe('Try login user to the system', () => {

    })

    describe('Generate new pair of access and refresh token', () => {

    })

    describe('Get information about current user', () => {

    })

    describe('Logout user from system', () => {

    })
  })
});
