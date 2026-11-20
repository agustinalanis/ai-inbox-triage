import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Businesses (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/businesses (GET) lists the businesses without prompt details', async () => {
    const response = await request(app.getHttpServer())
      .get('/businesses')
      .expect(200);

    expect(
      response.body.map((business: { id: string }) => business.id),
    ).toEqual(['consultorio', 'academia']);
    expect(response.body[0].categories[0]).toEqual({
      id: 'new-appointment',
      label: 'Pedir turno',
    });
    expect(JSON.stringify(response.body)).not.toContain('priorityRules');
  });

  afterEach(async () => {
    await app.close();
  });
});
