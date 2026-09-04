export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}
