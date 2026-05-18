// src/features/auth/hooks/useLogin.ts
import { useState } from "react";
// import { login } from "../services/authApi";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      //   return await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin };
}
