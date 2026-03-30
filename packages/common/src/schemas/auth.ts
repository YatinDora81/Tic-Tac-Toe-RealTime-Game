import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const anonymousSchema = z.object({
  name: z.string().min(2).max(20),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AnonymousInput = z.infer<typeof anonymousSchema>;
