import request from 'supertest';
import app from '../app';
import { db } from '../db/client';
import bcrypt from 'bcryptjs';

jest.mock('../db/client', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    full_name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      (db.query as jest.fn).mockResolvedValueOnce({ rows: [] }); // Check existing user
      (db.query as jest.fn).mockResolvedValueOnce({ 
        rows: [{ 
          id: '123', 
          email: testUser.email, 
          full_name: testUser.full_name,
          tier: 'free',
          is_onboarded: false
        }] 
      }); // Insert user

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should return 400 if user already exists', async () => {
      (db.query as jest.fn).mockResolvedValueOnce({ rows: [{ id: '123' }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      (db.query as jest.fn).mockResolvedValueOnce({ 
        rows: [{ 
          id: '123', 
          email: testUser.email, 
          password: hashedPassword,
          full_name: testUser.full_name,
          tier: 'free',
          is_onboarded: false
        }] 
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 with incorrect password', async () => {
      (db.query as jest.fn).mockResolvedValueOnce({ 
        rows: [{ 
          id: '123', 
          email: testUser.email, 
          password: 'wrong_hash' 
        }] 
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(401);
    });
  });
});
