const request = require('supertest');
const app = require('../src/index');
const http = require('http');
import { removeUser } from '../src/database/users';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('GET /api/test', () => {
  it('should return a 200 status and a message', async () => {
    const response = await request(server).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello from API Route!" });
  });
});

describe('POST /api/auth/register', () => {
  it('should return a 201 status and a user object for valid data', async () => {
    const getCSRF = await request(server).get('/api/csrf');
    const csrf = getCSRF.body.token;
    const csrfCookie = getCSRF.headers['set-cookie'];
    const response = await request(server)
      .post('/api/auth/register')
      .set('x-csrf-token', csrf)
      .set('Cookie', csrfCookie)
      .send({ name: 'testuser23', email:"user@test.com", password: 'testpassword1Z!' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message','Utilisateur créé avec succès');
  });

  it('should return a 400 status for missing data', async () => {
    const getCSRF = await request(server).get('/api/csrf');
    const csrf = getCSRF.body.token;
    const csrfCookie = getCSRF.headers['set-cookie'];
    const response = await request(server)
      .post('/api/auth/register')
      .set('x-csrf-token', csrf)
      .set('Cookie', csrfCookie)
      .send({ name: '' });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Erreur lors de l\'enregistrement');

  });
});
let cookie;
describe('POST /api/auth/login', () => {
  it('should return a 200 status and a user for valid credentials', async () => {
    const getCSRF = await request(server).get('/api/csrf');
    const csrf = getCSRF.body.token;
    const csrfCookie = getCSRF.headers['set-cookie'];
    const response = await request(server)
      .post('/api/auth/login')
      .set('x-csrf-token', csrf)
      .set('Cookie', csrfCookie)
      .send({ username: 'user@test.com', password: 'testpassword1Z!' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    cookie = response.headers['set-cookie'];
  });

  it('should return a 401 status for invalid credentials', async () => {
    const getCSRF = await request(server).get('/api/csrf');
    const csrf = getCSRF.body.token;
    const csrfCookie = getCSRF.headers['set-cookie'];
    const response = await request(server)
      .post('/api/auth/login')
      .set('x-csrf-token', csrf)
      .set('Cookie', csrfCookie)
      .send({ username: 'wronguser', password: 'wrongpassword' });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({message: "Email incorrect"});
  });

  it('remove user', async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: "user@test.com"
      }
    });
    await removeUser(user.id);
  }
  );
});

