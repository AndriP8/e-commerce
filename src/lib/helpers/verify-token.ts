import { decrypt } from "./session";

export async function verifyToken(token: string) {
  const jwtToken = token.split("Bearer ")[1];
  return decrypt(jwtToken);
}
