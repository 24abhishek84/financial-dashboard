import { BaseDataSource } from './BaseDataSource';
import { User, AuthPayload } from '@financial-dashboard/common';

export class UserDataSource extends BaseDataSource {
  constructor() {
    super(process.env.SERVICE_URL || 'http://localhost:8080/api');
  }

  async getUser(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/me');
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const response = await this.post<any>('/auth/login', { email, password });
    console.log('[UserDataSource] Login response:', response);
    const userId = response.user?.id || response.id || response.userId;
    if (!userId) {
      throw new Error('Backend login response missing userId or id');
    }
    return {
      token: response.token,
      id: String(userId),
      firstName: response.user?.firstName || response.firstName,
    };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<AuthPayload> {
    const response = await this.post<any>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    console.log('[UserDataSource] Register response:', JSON.stringify(response, null, 2));

    const userId = response.user?.id || response.id || response.userId;
    if (!userId) {
      console.error('[UserDataSource] Register failed - response structure:', Object.keys(response));
      throw new Error(`Backend register response missing id or userId. Response keys: ${Object.keys(response).join(', ')}`);
    }
    return {
      token: response.token,
      id: String(userId),
      firstName: response.user?.firstName || response.firstName || firstName,
    };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      this.setContext(token);
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}
