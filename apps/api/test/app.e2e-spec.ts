import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Businesses (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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
      fields: [
        { key: 'patientName', label: 'Paciente' },
        { key: 'preferredDate', label: 'Fecha preferida' },
        { key: 'insurance', label: 'Obra social' },
      ],
    });
    expect(response.body[0].suggestions.length).toBeGreaterThan(0);
    const body = JSON.stringify(response.body);
    // Prompt details stay on the server: rules, examples and field descriptions.
    expect(body).not.toContain('priorityRules');
    expect(body).not.toContain('examples');
    expect(body).not.toContain('description":"Nombre del paciente');
  });
});
