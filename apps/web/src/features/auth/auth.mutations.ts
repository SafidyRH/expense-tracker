import { useMutation } from "@tanstack/react-query";

import {
  login,
  logout,
  register,
} from "./auth.api";

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}