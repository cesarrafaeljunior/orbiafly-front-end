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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetPayload {
  login: string;
}

export interface ConfirmPasswordResetPayload {
  login: string;
  code: string;
  newPassword: string;
}
