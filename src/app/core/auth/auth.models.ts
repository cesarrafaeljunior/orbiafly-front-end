export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: AuthenticatedUser;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
