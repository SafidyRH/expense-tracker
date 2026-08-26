import { authClient } from "@/lib/auth-client";

import type {
  LoginInput,
  RegisterInput,
} from "./auth.types";

export async function register(
  input: RegisterInput
) {
  const result =
    await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
    });

  if (result.error) {
    throw new Error(
      result.error.message ??
        "Impossible de créer le compte."
    );
  }

  return result.data;
}

export async function login(
  input: LoginInput
) {
  const result =
    await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });

  if (result.error) {
    throw new Error(
      result.error.message ??
        "Email ou mot de passe incorrect."
    );
  }

  return result.data;
}

export async function logout() {
  const result =
    await authClient.signOut();

  if (result.error) {
    throw new Error(
      result.error.message ??
        "Impossible de se déconnecter."
    );
  }

  return result.data;
}