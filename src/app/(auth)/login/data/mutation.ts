import { z } from "zod";

import { loginSchema } from "@/lib/schema/login.schema";
type LoginBody = z.infer<typeof loginSchema.create.body>;
type LoginResponse = z.infer<typeof loginSchema.create.response>;

export const registerUser = async (payload: LoginBody) => {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const data = await response.json();
    return data.error as string;
  }
  return (await response.json()) as LoginResponse;
};
