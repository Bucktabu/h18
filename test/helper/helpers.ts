import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { preparedUser, superUser } from './prepeared-data';
import { UserViewModel } from '../../src/modules/super-admin/api/dto/userView.model';
import { isUUID } from 'class-validator';
import { UserDto } from '../../src/modules/super-admin/api/dto/userDto';

export const createNewUser = async (
  request: typeof supertest,
  app: INestApplication,
  // body: UserDTO
) => {
  const response = await request(app.getHttpServer())
    .post('/sa/users')
    .auth(superUser.valid.login, superUser.valid.password, { type: 'basic' })
    .send(preparedUser.valid);

  expect(response).toBeDefined();
  expect(response.status).toBe(201);

  const user: UserViewModel = response.body;
  expect(user).toEqual({
    id: expect.any(String),
    login: preparedUser.valid.login,
    email: preparedUser.valid.email,
    createdAt: expect.stringMatching(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    ),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null,
    },
  });

  expect(isUUID(user.id)).toBeTruthy();
  expect(new Date(user.createdAt) < new Date()).toBeTruthy();
  return user;
};

export const createErrorMessage = (fields) => {
  const errorsMessages = [];
  for (let i = 0, length = fields.length; i < length; i++) {
    errorsMessages.push({
      message: expect.any(String),
      field: fields[i],
    });
  }

  return errorsMessages;
};
