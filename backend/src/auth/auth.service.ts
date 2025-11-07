import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // В реальном приложении данные должны храниться в БД
  private readonly users = [
    {
      id: 1,
      username: 'admin',
      password: '$2b$10$V1ShQ2DmJjyUC3roWjyhZu0g9GbjZR10EPuRjBqRujWf8MZWyJlAK', // bcrypt hash of 'admin123'
    },
  ];

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // В реальном приложении используйте JWT
    const token = Buffer.from(`${user.username}:${Date.now()}`).toString('base64');
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async validateToken(token: string): Promise<boolean> {
    // Простая валидация для демо
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      return decoded.includes('admin');
    } catch {
      return false;
    }
  }
}
