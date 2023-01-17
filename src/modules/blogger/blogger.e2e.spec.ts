import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../app.module";
import {EmailManager} from "../public/auth/email-transfer/email.manager";
import {EmailManagerMock} from "../../../test/mock/emailAdapter.mock";
import {createApp} from "../../helpers/create-app";
import request from "supertest";

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

    it('Drop all data.', () => {
        request(server)
            .delete('/testing/all-data')
            .expect(204)
    })


})