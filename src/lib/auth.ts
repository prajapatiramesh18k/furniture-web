import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ananya-furniture-secret-key-2024';

export interface UserPayload {
  userId: string;
  email: string;
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    return null;
  }
}
