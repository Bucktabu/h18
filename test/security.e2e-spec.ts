import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {EmailManager} from "../src/modules/public/auth/email-transfer/email.manager";
import {EmailManagerMock} from "./mock/emailAdapter.mock";
import {createApp} from "../src/helpers/create-app";
import request from "supertest";
import {preparedUser} from "./helper/prepeared-data";

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

    describe('Security router testing', () => {
        it('Create devises', async () => {
            await request(server)
                .post('/auth/registration')
                .send(preparedUser.valid)
                .expect(204)
        })

        describe('Return all devises with active sessions for current user', () => {

        })

        describe('Terminate specified device session',  () => {

        })

        describe('Terminate all other (exclude current) device`s session',  () => {

        })
    })
})