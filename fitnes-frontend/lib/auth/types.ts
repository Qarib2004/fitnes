export type UserRole = "client" | "trainer" | "admin";
export type UserStatus = "active" | "blocked";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export type LoginResponse = {
  user: AuthUser;
  session: AuthSession;
};

export type RegisterResponse = {
  user: AuthUser;
};
