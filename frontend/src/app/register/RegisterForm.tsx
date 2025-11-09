"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { api } from '@/services/api'; // <-- 1. Importando nosso serviço!

interface ApiErrorResponse {
  message: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // <-- 2. USANDO O SERVIÇO 'api' PARA O CADASTRO PADRÃO
      await api.post('/users/register', { name, email, password });
      toast.success("Cadastro realizado com sucesso! Faça o login.");
      
      const redirectParam = searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : '';
      router.push(`/login${redirectParam}`);
      
    } catch (err: unknown) {
      let message = "Não foi possível fazer o cadastro.";
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: ApiErrorResponse } };
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message;
        }
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setIsLoading(true);
    try {
      // <-- 3. USANDO O SERVIÇO 'api' PARA O CADASTRO COM GOOGLE
      const response = await api.post<{ token: string }>('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('authToken', response.data.token);
      toast.success("Cadastro com Google bem-sucedido!");

      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);

    } catch { // Variável de erro removida pois não era usada
      const message = "Não foi possível fazer o cadastro com o Google.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Crie uma conta</h2>
          <p className="text-gray-600">Junte-se à nossa comunidade</p>
        </div>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div><input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          <div><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">{isLoading ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <div className="mt-6">
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou continue com</span></div></div>
          <div className="mt-4 flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Falha no cadastro com Google.")} /></div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link 
            href={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} 
            className="text-teal-600 hover:underline"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}