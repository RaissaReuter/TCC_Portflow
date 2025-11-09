import { Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import RegisterForm from './RegisterForm'; // <-- Importando nosso novo componente de formulário

// Componente Wrapper para garantir que os hooks de cliente sejam usados dentro do Suspense
function RegisterPageContent() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <RegisterForm />
    </GoogleOAuthProvider>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}