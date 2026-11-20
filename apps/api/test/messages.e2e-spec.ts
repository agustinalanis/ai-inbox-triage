import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import {
  ClassifierService,
  type Classification,
} from '../src/classifier/classifier.service.js';
import { SEED_MESSAGES } from '../src/messages/seed-messages.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// Gemini is the external boundary: an urgent message when the text says so, a normal one otherwise.
const fakeClassifier = {
  classify: vi.fn((text: string): Promise<Classification> =>
    Promise.resolve({
      category: 'general',
      priority: text.includes('urgente') ? 'urgent' : 'normal',
      extracted: {},
      suggestedReply: 'Gracias por escribirnos.',
      needsHuman: false,
      confidence: 0.9,
      model: 'fake-model',
      latencyMs: 1,
    }),
  ),
};

const SEED_COUNT = SEED_MESSAGES.filter(
  (m) => m.businessId === 'consultorio',
).length;

describe('Messages (e2e)', () => {
  let app: INestApplication<App>;
  const sessions: string[] = [];

  const newSession = () => {
    const id = randomUUID();
    sessions.push(id);
    return id;
  };
  const post = (session: string, body: object) =>
    request(app.getHttpServer())
      .post('/messages')
      .set('X-Demo-Session', session)
      .send(body);
  const list = (session: string, businessId = 'consultorio') =>
    request(app.getHttpServer())
      .get('/messages')
      .query({ businessId })
      .set('X-Demo-Session', session);

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClassifierService)
      .useValue(fakeClassifier)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app
      .get(PrismaService)
      .message.deleteMany({ where: { sessionId: { in: sessions } } });
    await app.close();
  });

  it('classifies, stores and returns a message without the session id', async () => {
    const session = newSession();
    const response = await post(session, {
      businessId: 'consultorio',
      text: '  Hola, quiero un turno  ',
      senderEmail: 'laura@example.com',
    }).expect(201);

    expect(response.body).toMatchObject({
      businessId: 'consultorio',
      text: 'Hola, quiero un turno',
      senderEmail: 'laura@example.com',
      category: 'general',
      model: 'fake-model',
      isExample: false,
    });
    expect(response.body).not.toHaveProperty('sessionId');

    const inbox = await list(session).expect(200);
    expect(inbox.body.map((m: { id: string }) => m.id)).toContain(
      response.body.id,
    );
  });

  it('rejects a text longer than 1000 characters', async () => {
    await post(newSession(), {
      businessId: 'consultorio',
      text: 'a'.repeat(1001),
    }).expect(400);
    expect(fakeClassifier.classify).not.toHaveBeenCalledWith(
      'a'.repeat(1001),
      expect.anything(),
    );
  });

  it('rejects an unknown business', async () => {
    await post(newSession(), { businessId: 'nope', text: 'Hola' }).expect(400);
    await list(newSession(), 'nope').expect(400);
  });

  it('rejects a missing or invalid session header', async () => {
    await request(app.getHttpServer())
      .get('/messages')
      .query({ businessId: 'consultorio' })
      .expect(400);
    await list('not-a-uuid').expect(400);
  });

  it('seeds the inbox on the first visit, once, even with concurrent requests', async () => {
    const session = newSession();
    const [first, second] = await Promise.all([list(session), list(session)]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const inbox = await list(session).expect(200);
    expect(inbox.body).toHaveLength(SEED_COUNT);
    expect(inbox.body.every((m: { isExample: boolean }) => m.isExample)).toBe(
      true,
    );
    expect(fakeClassifier.classify).not.toHaveBeenCalledWith(
      SEED_MESSAGES[0].text,
      expect.anything(),
    );
  });

  it('keeps each session inbox separate', async () => {
    const sessionA = newSession();
    const sessionB = newSession();
    await post(sessionA, {
      businessId: 'consultorio',
      text: 'Mensaje de A',
    }).expect(201);

    const inboxB = await list(sessionB).expect(200);
    expect(inboxB.body.map((m: { text: string }) => m.text)).not.toContain(
      'Mensaje de A',
    );
    expect(inboxB.body).toHaveLength(SEED_COUNT);
  });

  it('sorts the inbox by priority, then newest first', async () => {
    const session = newSession();
    await post(session, { businessId: 'consultorio', text: 'Primero' });
    await post(session, { businessId: 'consultorio', text: 'Segundo' });
    await post(session, { businessId: 'consultorio', text: 'Es urgente' });

    const inbox = await list(session).expect(200);
    const rank = { low: 0, normal: 1, high: 2, urgent: 3 } as const;
    const items: {
      priority: keyof typeof rank;
      createdAt: string;
      text: string;
    }[] = inbox.body;
    for (let i = 1; i < items.length; i++) {
      const [prev, next] = [items[i - 1], items[i]];
      expect(rank[prev.priority]).toBeGreaterThanOrEqual(rank[next.priority]);
      if (prev.priority === next.priority) {
        expect(prev.createdAt >= next.createdAt).toBe(true);
      }
    }
    const texts = items.map((m) => m.text);
    expect(texts.indexOf('Segundo')).toBeLessThan(texts.indexOf('Primero'));
  });

  it('answers 429 after 5 messages per minute from the same IP', async () => {
    const session = newSession();
    const allowed = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        post(session, { businessId: 'consultorio', text: `Hola ${i}` }),
      ),
    );
    expect(allowed.map((r) => r.status)).toEqual([201, 201, 201, 201, 201]);
    const limited = await post(session, {
      businessId: 'consultorio',
      text: 'Uno más',
    }).expect(429);
    expect(limited.body.message).toMatch(/Esperá un minuto/);
  });
});
