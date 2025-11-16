"use client";

import toast from 'react-hot-toast';
import { useState, useEffect, Suspense } from "react";
import 'react-day-picker/dist/style.css';
import Chatbot from "../components/Chatbot"; 
import SimuladorRedacao from "../components/SimuladorRedacao";
import ListaSecoes from "../components/ListaSecoes";
import DetalheSecao from "../components/DetalheSecao";
import TelaAula from "../components/TelaAula";
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api'; // Importando nosso serviço

// --- INTERFACES ---
interface ProgressItem {
  hasStarted: boolean;
  progressPercentage: number;
  title: string;
}

interface DashboardData {
  userName: string;
  progress: {
    grammarLesson: ProgressItem;
    writingLesson: ProgressItem;
    figuresOfSpeechLesson: ProgressItem;
  };
}

function HomeContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<number | null>(null);
  const [etapaAtiva, setEtapaAtiva] = useState<number | null>(null);
  const [refreshTrilha, setRefreshTrilha] = useState(0);
  const [userSessionChecked, setUserSessionChecked] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const inicializarPagina = async () => {
      const pageParam = searchParams.get('page');
      
      if (pageParam === 'login') {
        router.push('/login');
        return;
      }

      // Verificar se estamos no cliente antes de acessar localStorage
      if (typeof window === 'undefined') {
        setCurrentPage('home');
        setUserSessionChecked(true);
        return;
      }

      const token = localStorage.getItem('authToken');

      if (!token) {
        setCurrentPage('home');
        setUserSessionChecked(true);
        return;
      }

      setCurrentPage('dashboard');
      try {
        // Primeiro, testar se a API está funcionando
        console.log('🔍 Testando conexão com /api/health...');
        const healthResponse = await api.get('/api/health');
        console.log('✅ API Health check:', healthResponse.data);
        
        // --- A ÚNICA CORREÇÃO NECESSÁRIA ---
        console.log('🔍 Fazendo requisição para /api/dashboard...');
        const response = await api.get('/api/dashboard');
        console.log('📊 Dados recebidos do dashboard:', response.data);
        
        // Verificar se os dados têm a estrutura esperada
        const data = response.data as Partial<DashboardData> | undefined;
        if (data && data.progress) {
          setDashboardData(data as DashboardData);
        } else {
          console.warn('⚠️ Dados do dashboard não têm a estrutura esperada:', response.data);
          // Criar dados padrão se necessário
          const defaultData: DashboardData = {
            userName: (data && data.userName) || 'Usuário',
            progress: {
              grammarLesson: { hasStarted: false, progressPercentage: 0, title: 'Gramática' },
              writingLesson: { hasStarted: false, progressPercentage: 0, title: 'Redação' },
              figuresOfSpeechLesson: { hasStarted: false, progressPercentage: 0, title: 'Figuras de Linguagem' }
            }
          };
          setDashboardData(defaultData);
        }
      } catch (err) {
        console.error("❌ Erro ao buscar dados do dashboard:", err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        router.push('/login?error=session_expired'); 
      } finally {
        setUserSessionChecked(true);
      }
    };

    inicializarPagina();
  }, [searchParams, router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setDashboardData(null);
    setCurrentPage('home');
    toast.success("Você saiu da sua conta.");
  };

  const AppLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-16 bg-white border-r h-screen sticky top-0 flex flex-col items-center py-4 space-y-4 z-40">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
            <span>🐱</span>
          </div>
          <nav className="flex flex-col space-y-3">
            <div onClick={() => setCurrentPage("dashboard")} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200" title="Dashboard">
              <span>🏠</span>
            </div>
            <div onClick={() => setCurrentPage("trilha")} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200" title="Trilha">
              <span>📚</span>
            </div>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-white">
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-lg">🐱</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Portflow</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#sobre" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Sobre</a>
            <a href="#recursos" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Recursos</a>
            <a href="#contato" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Contato</a>
            <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Entrar
            </a>
          </div>
        </div>
      </header>
      <section className="bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-500 px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">Portflow</h1>
                <div className="w-20 h-1 bg-white/60 rounded-full"></div>
              </div>
              <p className="text-xl md:text-2xl leading-relaxed opacity-95 font-light">
                Sua jornada para aprender português começa aqui.<br />
                <span className="font-medium">Português nunca foi tão fácil!</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/register" className="bg-white text-teal-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-lg">
                  Começar agora
                </a>
                <a href="/sala-de-aula" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-teal-600 transition-all duration-200">
                  Sala de aula
                </a>
              </div>
              <div className="flex items-center space-x-6 pt-6">
                <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-white rounded-full"></div><span className="text-white/80 text-sm">Mais de 10.000 alunos</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-white rounded-full"></div><span className="text-white/80 text-sm">Certificado reconhecido</span></div>
              </div>
            </div>
            <div className="flex justify-center relative">
              <div className="relative">
                <div className="w-56 h-56 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"><span className="text-9xl">🐱</span></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center shadow-xl border-3 border-white/30"><span className="text-5xl">🐱</span></div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="text-2xl">⭐</span></div>
                <div className="absolute top-1/2 -left-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="text-xl">📚</span></div>
                <div className="absolute bottom-1/4 -right-8 w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="text-2xl">🎯</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="recursos" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2"><div className="text-3xl font-bold text-teal-600">10.000+</div><div className="text-gray-600">Alunos ativos</div></div>
            <div className="space-y-2"><div className="text-3xl font-bold text-teal-600">500+</div><div className="text-gray-600">Lições disponíveis</div></div>
            <div className="space-y-2"><div className="text-3xl font-bold text-teal-600">95%</div><div className="text-gray-600">Taxa de aprovação</div></div>
            <div className="space-y-2"><div className="text-3xl font-bold text-teal-600">24/7</div><div className="text-gray-600">Suporte disponível</div></div>
          </div>
        </div>
      </section>
      <section id="sobre" className="bg-blue-50 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center md:order-1"><div className="w-32 h-32 bg-orange-200 rounded-full flex items-center justify-center"><span className="text-6xl">🐱</span></div></div>
            <div className="md:order-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Aprender português pode ser mais leve.</h2>
              <p className="text-gray-600 mb-4">Acreditamos que o ensino de português deve ser algo leve, divertido e que faça sentido para quem está aprendendo.</p>
              <p className="text-gray-600">Por isso, criamos uma plataforma gamificada, interativa e personalizada, que se adapta ao ritmo de cada pessoa e torna a jornada de aprendizado mais prazerosa e eficiente.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Aqui, cada avanço é uma conquista.</h2>
              <p className="text-gray-600 mb-4">No Portflow, cada lição completada é uma vitória que merece ser celebrada.</p>
              <p className="text-gray-600">Acreditamos que o aprendizado deve ser recompensador e motivador. Por isso, criamos um sistema de conquistas e recompensas que reconhece seu esforço e dedicação a cada passo da jornada.</p>
            </div>
            <div className="flex justify-center"><div className="flex gap-4"><div className="w-24 h-24 bg-orange-200 rounded-full flex items-center justify-center"><span className="text-4xl">🐱</span></div><div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center"><span className="text-4xl">🐱</span></div></div></div>
          </div>
        </div>
      </section>
      <section className="bg-blue-50 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center md:order-1"><div className="w-32 h-32 bg-orange-200 rounded-full flex items-center justify-center relative"><span className="text-6xl">🐱</span><div className="absolute -right-2 -bottom-2 w-8 h-8 bg-white rounded flex items-center justify-center"><span className="text-xs">📚</span></div></div></div>
            <div className="md:order-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Ensinamos o que funciona.</h2>
              <p className="text-gray-600 mb-4">No Portflow, ensinamos o que realmente funciona.</p>
              <p className="text-gray-600">Nossa metodologia é baseada em técnicas comprovadas de ensino de idiomas, combinadas com tecnologia de ponta para oferecer uma experiência de aprendizado única e eficaz.</p>
              <p className="text-gray-600 mt-4">Nossos métodos foram desenvolvidos por especialistas.</p>
            </div>
          </div>
        </div>
      </section>
      <footer id="contato" className="bg-gradient-to-r from-teal-400 to-teal-500 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-white mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4"><div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center mr-3"><span className="text-lg">🐱</span></div><h3 className="text-2xl font-bold">Portflow</h3></div>
              <p className="text-teal-100 mb-6 max-w-md">Transforme sua jornada de aprendizado de português com nossa plataforma gamificada e personalizada. Aprenda de forma divertida e eficaz!</p>
              <div className="flex space-x-4"><button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"><span className="text-lg">📘</span></button><button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"><span className="text-lg">📱</span></button><button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"><span className="text-lg">💬</span></button></div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Plataforma</h4>
              <ul className="space-y-2 text-teal-100"><li><a href="#" className="hover:text-white transition-colors">Lições</a></li><li><a href="#" className="hover:text-white transition-colors">Exercícios</a></li><li><a href="#" className="hover:text-white transition-colors">Progresso</a></li><li><a href="#" className="hover:text-white transition-colors">Certificados</a></li></ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Suporte</h4>
              <ul className="space-y-2 text-teal-100"><li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li><li><a href="#" className="hover:text-white transition-colors">Contato</a></li><li><a href="#" className="hover:text-white transition-colors">FAQ</a></li><li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li></ul>
            </div>
          </div>
          <div className="border-t border-teal-300/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center"><p className="text-teal-100 text-sm mb-4 md:mb-0">© 2024 Portflow. Todos os direitos reservados.</p><div className="flex space-x-6 text-sm text-teal-100"><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a><a href="#" className="hover:text-white transition-colors">Termos de Uso</a><a href="#" className="hover:text-white transition-colors">Cookies</a></div></div>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => {
    if (!dashboardData) {
      return <div className="min-h-screen flex items-center justify-center">Carregando Dashboard...</div>;
    }
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4 z-40">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center shadow-lg"><span className="text-lg">🐱</span></div>
          <div className="flex flex-col space-y-3">
           <div onClick={() => setCurrentPage("dashboard")} className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-teal-200 transition-colors"><span className="text-sm">🏠</span></div>
            <div onClick={() => setCurrentPage("trilha")} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" > <span className="text-sm">📚</span> </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"><span className="text-sm">🎯</span></div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"><span className="text-sm">📊</span></div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"><span className="text-sm">⚙️</span></div>
          </div>
        </div>
        <div className="ml-16">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3"><span className="text-xl font-bold text-gray-800">Portflow</span></div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">{dashboardData.userName}</span>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg"><span className="text-lg">🐱</span></div>
                <button onClick={handleLogout} className="bg-gray-200 p-2 rounded-lg hover:bg-red-100 text-sm">Sair</button>
              </div>
            </div>
          </header>
          <div className="p-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="flex items-center justify-between relative">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold">Olá, {dashboardData.userName}!</h1>
                  <p className="text-teal-100 text-lg">O que vamos fazer hoje?</p>
                   <div className="flex space-x-4">
                    <button onClick={() => setCurrentPage('trilha')} className="bg-white text-teal-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-lg">Continuar</button>
                    <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-teal-600 transition-all duration-200">Explorar</button>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"><span className="text-6xl">🐱</span></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="text-lg">⭐</span></div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Vamos continuar?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {dashboardData.progress?.grammarLesson?.hasStarted && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1"><h3 className="font-bold text-gray-800 mb-2">{dashboardData.progress.grammarLesson.title}</h3><p className="text-sm text-gray-600">Aprenda os fundamentos da gramática portuguesa</p></div>
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center ml-4"><span className="text-xl">✓</span></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4"><div className="bg-teal-500 h-2 rounded-full" style={{width: `${dashboardData.progress.grammarLesson.progressPercentage}%`}}></div></div>
                    <button onClick={() => setCurrentPage('trilha')} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-colors w-full">Continuar</button>
                  </div>
                )}
                {dashboardData.progress?.writingLesson?.hasStarted && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1"><h3 className="font-bold text-gray-800 mb-2">{dashboardData.progress.writingLesson.title}</h3><p className="text-sm text-gray-600">Desenvolva suas habilidades de escrita</p></div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-4"><span className="text-xl">📝</span></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${dashboardData.progress.writingLesson.progressPercentage}%`}}></div></div>
                    <button onClick={() => setCurrentPage('trilha')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors w-full">Continuar</button>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pratique e Melhore</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => setCurrentPage("simuladorRedacao")} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1"><h3 className="font-bold text-gray-800 mb-2">Simulador de Redação com IA</h3><p className="text-sm text-gray-600">Receba feedback instantâneo e melhore sua escrita para o ENEM.</p></div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center ml-4"><span className="text-xl">✍️</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Chatbot />
      </div>
    );
  }

  if (!userSessionChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span>Carregando PortFlow...</span></div>;
  }
  
  switch(currentPage) {
    case "dashboard":
      return renderDashboard();
    case "simuladorRedacao":
      return (
        <AppLayout>
          <button onClick={() => setCurrentPage("dashboard")} className="mb-4 text-teal-600 font-semibold hover:underline">← Voltar para o Dashboard</button>
          <SimuladorRedacao />
        </AppLayout>
      );
    case "trilha":
      return (
        <AppLayout>
          <div className="bg-teal-600 text-white p-6 rounded-2xl mb-8">
            <h1 className="text-3xl font-bold">Trilha ENEM</h1>
            <p>Vamos estudar com qualidade? O Portinho preparou a rota completa até o ENEM</p>
          </div>
          <ListaSecoes onSecaoClick={(order) => { setSecaoAtiva(order); setCurrentPage("detalheSecao"); }} refreshTrigger={refreshTrilha} />
        </AppLayout>
      );
    case "detalheSecao":
      if (secaoAtiva === null) {
        setCurrentPage("trilha");
        return null;
      }
      return (
        <AppLayout>
          <button onClick={() => setCurrentPage("trilha")} className="mb-4 text-teal-600 font-semibold hover:underline">&larr; Voltar para a Trilha ENEM</button>
          <DetalheSecao secaoOrder={secaoAtiva} onEtapaClick={(orderDaEtapaClicada) => { setEtapaAtiva(orderDaEtapaClicada); setCurrentPage("telaAula"); }} />
        </AppLayout>
      );
    case "telaAula":
      if (secaoAtiva === null || etapaAtiva === null) {
        setCurrentPage("trilha");
        return null;
      }
      return (
        <AppLayout>
          <TelaAula secaoOrder={secaoAtiva} etapaOrder={etapaAtiva} onVoltar={() => setCurrentPage("detalheSecao")} onEtapaConcluida={() => { setRefreshTrilha(prev => prev + 1); setCurrentPage("detalheSecao"); }} />
        </AppLayout>
      );
    default:
      return renderHomePage();
  }
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>}>
      <HomeContent />
    </Suspense>
  );
}