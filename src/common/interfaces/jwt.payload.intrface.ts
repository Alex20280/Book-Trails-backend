export interface JwtPayload {
  email: string;
  role: string;
  sub: number;
  name: string;
  iat: number;
  exp: number;
  sessionId: number;
}
