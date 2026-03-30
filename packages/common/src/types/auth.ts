export interface AuthTokenPayload {
  id: string;
  name: string;
  isGuest: boolean;
  email?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
}
