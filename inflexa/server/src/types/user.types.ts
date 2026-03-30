export interface IUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export interface IUserRow extends IUser {
  password: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserRow {
  username: string;
  email: string;
  hashedPassword: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  new_password: string;
}

export interface IPasswordResetToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: IUser;
}
