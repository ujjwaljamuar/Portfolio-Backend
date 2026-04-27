export interface JwtPayload {
  id: string;
  role: "admin";
  iat?: number;
  exp?: number;
}
