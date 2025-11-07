// ARQUIVO CORRIGIDO: frontend/src/app/login/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface ApiErrorData {
  message: string;
}

// Tipo para o objeto de erro do Axios
interface AxiosErrorWithResponse {
  response?: {
    data?: ApiErrorData;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post<{ token: string }>('http://localhost:3001/api/auth/login', { email, password });
      localStorage.setItem('authToken', response.data.token);
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (err: unknown) {
      let message = "Não foi possível fazer o login.";
      // CORREÇÃO: Usar o tipo explícito para evitar 'any'
      const axiosError = err as AxiosErrorWithResponse;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post<{ token: string }>('http://localhost:3001/api/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('authToken', response.data.token);
      toast.success("Login com Google bem-sucedido!");

      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);

    } catch { // 'err' removido pois não é usado
      setError("Não foi possível fazer o login com o Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Se conecte</h2>
            <p className="text-gray-600">Bem-vindo de volta!</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/></div>
            <div><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"/></div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">{isLoading ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <div className="mt-6">
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou continue com</span></div></div>
            <div className="mt-4 flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Falha no login com Google.")} /></div>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">Não tem uma conta?{" "}<Link href={`/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className="text-teal-600 hover:underline">Cadastre-se</Link></p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}