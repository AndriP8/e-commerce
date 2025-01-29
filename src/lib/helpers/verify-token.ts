import { decrypt } from "./session";

export async function verifyToken(jwtToken: string) {
  return decrypt(jwtToken);
}
