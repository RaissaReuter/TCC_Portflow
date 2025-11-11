"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import Avatar from '@/components/Avatar';

// --- INTERFACES ---
interface User { _id: string; name: string; email: string; role?: 'aluno' | 'professor'; }
interface Alternativa { letra: string; texto: string; }
interface Questao { _id: string; enunciado: string; alternativas: Alternativa[]; imagemUrl?: string; }
interface Resposta { questaoId: string; acertou: boolean; }
interface Participante { 
  alunoId: { _id: string; name: string; }; 
  pontuacao: number; 
  respostas: Resposta[];
  questaoAtual: number;
}
interface SessaoSala { _id: string; nome: string; codigo: string; status: 'AGUARDANDO' | 'EM_ANDAMENTO' | 'FINALIZADA'; participantes: Participante[]; configuracao: { duracaoMinutos: number; }; tempoInicio?: string; questoes: Questao[]; }
interface ApiErrorData { message: string; }
interface AxiosErrorWithData { response?: { data?: ApiErrorData; }; }

export default function SalaDeAulaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoSala | null>(null);
  const [nomeSessao, setNomeSessao] = useState('');
  const [topico, setTopico] = useState('Coerência');
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(5);
  const [duracaoMinutos, setDuracaoMinutos] = useState(1);
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [codigoSessao, setCodigoSessao] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [tempoRestante, setTempoRestante] = useState('');
  const [indiceQuestaoAtual, setIndiceQuestaoAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [feedbackOverlay, setFeedbackOverlay] = useState<'correta' | 'incorreta' | null>(null);

  // ... (toda a lógica permanece a mesma até a renderAlunoView)
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push(`/login?redirect=/sala-de-aula`);
        return;
      }
      try {
        const response = await api.get<{ user: User }>('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error("Sessão inválida:", error);
        localStorage.removeItem('authToken');
        router.push(`/login?redirect=/sala-de-aula`);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndFetchData();
  }, [router]);

  useEffect(() => {
    if (!sessaoAtiva?._id || sessaoAtiva.status === 'FINALIZADA') return;
    const fetchSessaoStatus = async () => {
      try {
        const response = await api.get<SessaoSala>(`/sessoes-sala/${sessaoAtiva._id}`);
        setSessaoAtiva(response.data);
      } catch (error) {
        console.error("Erro ao buscar status da sessão:", error);
      }
    };
    const intervalId = setInterval(fetchSessaoStatus, 5000);
    return () => clearInterval(intervalId);
  }, [sessaoAtiva?._id, sessaoAtiva?.status]);

  useEffect(() => {
    if (sessaoAtiva?.status !== 'EM_ANDAMENTO' || !sessaoAtiva.tempoInicio) {
      setTempoRestante('');
      return;
    }
    const timerId = setInterval(() => {
      const agora = new Date();
      const inicio = new Date(sessaoAtiva.tempoInicio!);
      const fim = new Date(inicio.getTime() + sessaoAtiva.configuracao.duracaoMinutos * 60000);
      const diff = fim.getTime() - agora.getTime();
      if (diff <= 0) {
        setTempoRestante("00:00");
        clearInterval(timerId);
        return;
      }
      const minutos = Math.floor(diff / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      setTempoRestante(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timerId);
  }, [sessaoAtiva]);

  const handleSetRole = async (role: 'aluno' | 'professor') => {
    try {
      const response = await api.post<User>('/users/set-role', { role });
      setUser(response.data);
      toast.success(`Perfil definido como ${role}!`);
    } catch {
      toast.error("Não foi possível definir seu perfil.");
    }
  };

  const handleCriarSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsCreating(true);
    try {
      const response = await api.post<SessaoSala>('/sessoes-sala', 
        { nome: nomeSessao, topico, quantidadeQuestoes, duracaoMinutos }
      );
      setSessaoAtiva(response.data);
      toast.success('Sessão criada com sucesso!');
    } catch (err: unknown) {
      let message = 'Não foi possível criar a sessão.';
      const axiosError = err as AxiosErrorWithData;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      setFormError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEntrarNaSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setIsJoining(true);
    try {
      const response = await api.post<{ message: string; sessao: SessaoSala }>(
        '/sessoes-sala/entrar',
        { codigo: codigoSessao }
      );
      setSessaoAtiva(response.data.sessao);
      toast.success(response.data.message);
    } catch (err: unknown) {
      let message = 'Não foi possível entrar na sessão.';
      const axiosError = err as AxiosErrorWithData;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      setJoinError(message);
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleIniciarSessao = async () => {
    if (!sessaoAtiva) return;
    toast.loading('Iniciando atividade...');
    try {
      const response = await api.post<{ sessao: SessaoSala }>(
        `/sessoes-sala/${sessaoAtiva._id}/iniciar`,
        {}
      );
      toast.dismiss();
      toast.success('Atividade iniciada!');
      setSessaoAtiva(response.data.sessao);
    } catch (err: unknown) {
      toast.dismiss();
      let message = 'Não foi possível iniciar a atividade.';
      const axiosError = err as AxiosErrorWithData;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      toast.error(message);
    }
  };

  const handleResponder = async (questaoId: string, resposta: string) => {
    if (feedbackOverlay) return; 
    setRespostaSelecionada(resposta);
    try {
      const res = await api.post<{ acertou: boolean }>(
        '/sessoes-sala/responder',
        { sessaoId: sessaoAtiva?._id, questaoId, resposta }
      );
      setFeedbackOverlay(res.data.acertou ? 'correta' : 'incorreta');
      setTimeout(() => {
        setFeedbackOverlay(null);
        setIndiceQuestaoAtual(prev => prev + 1);
        setRespostaSelecionada(null);
      }, 1200);
    } catch {
      toast.error("Erro ao enviar resposta.");
      setRespostaSelecionada(null);
    }
  };

  const handleFinalizarSessao = async () => {
    if (!sessaoAtiva) return;
    toast.loading('Finalizando atividade...');
    try {
      const response = await api.post<{ sessao: SessaoSala }>(
        `/sessoes-sala/${sessaoAtiva._id}/finalizar`,
        {}
      );
      toast.dismiss();
      toast.success('Atividade finalizada!');
      setSessaoAtiva(response.data.sessao);
    } catch {
      toast.dismiss();
      toast.error("Não foi possível finalizar a atividade.");
    }
  };

  const handleSairDaSessao = () => {
    setSessaoAtiva(null);
    setIndiceQuestaoAtual(0);
    setTempoRestante('');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Verificando permissões...</div>;
  }
  
  const renderRoleSelection = () => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo(a) à Sala de Aula!</h2>
      <p className="text-gray-600 mb-8">Para continuar, por favor, escolha seu perfil.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => handleSetRole('aluno')} className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition-transform hover:scale-105">
          Sou Aluno
        </button>
        <button onClick={() => handleSetRole('professor')} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-transform hover:scale-105">
          Sou Professor
        </button>
      </div>
    </div>
  );

  const renderProfessorView = () => {
    if (!sessaoAtiva) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Nova Sessão de Estudo</h2>
          <form onSubmit={handleCriarSessao} className="space-y-4">
            <div><label htmlFor="nomeSessao" className="block text-sm font-medium text-gray-700">Nome da Sessão</label><input type="text" id="nomeSessao" value={nomeSessao} onChange={(e) => setNomeSessao(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/></div>
            <div><label htmlFor="topico" className="block text-sm font-medium text-gray-700">Tópico</label><select id="topico" value={topico} onChange={(e) => setTopico(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"><option>Coerência</option><option>Crase</option><option>Figuras de Linguagem</option></select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label htmlFor="quantidadeQuestoes" className="block text-sm font-medium text-gray-700">Nº de Questões</label><input type="number" id="quantidadeQuestoes" value={quantidadeQuestoes} onChange={(e) => setQuantidadeQuestoes(Number(e.target.value))} min="1" max="50" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/></div>
              <div><label htmlFor="duracaoMinutos" className="block text-sm font-medium text-gray-700">Duração (minutos)</label><input type="number" id="duracaoMinutos" value={duracaoMinutos} onChange={(e) => setDuracaoMinutos(Number(e.target.value))} min="1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/></div>
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <button type="submit" disabled={isCreating} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400">{isCreating ? 'Gerando questões com IA...' : 'Criar Sessão e Gerar Código'}</button>
          </form>
        </div>
      );
    }
    if (sessaoAtiva.status === 'FINALIZADA' || (tempoRestante === '00:00' && sessaoAtiva.status === 'EM_ANDAMENTO')) {
      const ranking = [...sessaoAtiva.participantes].sort((a, b) => b.pontuacao - a.pontuacao);
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Atividade Finalizada!</h2>
          <h3 className="text-xl font-semibold mb-4 text-center">🏆 Ranking Final 🏆</h3>
          <ol className="space-y-3">
            {ranking
              .filter(p => p.alunoId && p.alunoId.name)
              .map((p, index) => (
                <li key={p.alunoId._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-500 w-8 text-center">{index + 1}º</span>
                  <Avatar name={p.alunoId.name} />
                  <span className="text-lg font-semibold grow">{p.alunoId.name}</span>
                  <span className="text-lg font-bold text-teal-600">{p.pontuacao} pts</span>
                </li>
              ))
            }
          </ol>
          <button 
            onClick={handleSairDaSessao} 
            className="mt-8 w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      );
    }
    if (sessaoAtiva.status === 'EM_ANDAMENTO') {
      const totalQuestoes = sessaoAtiva.questoes.length;
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{`Sessão "${sessaoAtiva.nome}"`}</h2>
            <div className="text-2xl font-bold text-red-500 bg-red-100 px-4 py-2 rounded-lg">{tempoRestante}</div>
          </div>
          <h3 className="text-lg font-semibold mb-4">Progresso dos Alunos:</h3>
          <div className="space-y-3">
            {sessaoAtiva.participantes.length > 0 ? (
              sessaoAtiva.participantes
                .filter(p => p.alunoId && p.alunoId._id)
                .map(p => {
                  const progressoQuestao = p.questaoAtual >= totalQuestoes 
                    ? "Finalizou!" 
                    : `Questão ${p.questaoAtual + 1}/${totalQuestoes}`;

                  return (
                    <div key={p.alunoId._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.alunoId.name} />
                        <span className="font-semibold">{p.alunoId.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-teal-600 block">{p.pontuacao} pts</span>
                        <span className="text-sm text-gray-500">{progressoQuestao}</span>
                      </div>
                    </div>
                  )
                })
            ) : (
              <p className="text-gray-500">Nenhum aluno na sala.</p>
            )}
          </div>
          <button onClick={handleFinalizarSessao} className="mt-8 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600">Encerrar Atividade para Todos</button>
        </div>
      );
    }
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{`Sessão "${sessaoAtiva.nome}" criada!`}</h2>
        <p className="text-gray-600 mb-6">Compartilhe o código abaixo com seus alunos:</p>
        <div className="bg-teal-50 p-4 rounded-lg inline-block mb-6 border-2 border-dashed border-teal-200"><p className="text-4xl font-bold text-teal-600 tracking-widest">{sessaoAtiva.codigo}</p></div>
        <div className="mt-4 text-left max-w-sm mx-auto">
          <h3 className="font-semibold mb-2 text-center">Alunos na sala ({sessaoAtiva.participantes.length}):</h3>
          {sessaoAtiva.participantes.length > 0 ? (
            <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md">
              {sessaoAtiva.participantes
                .filter(p => p.alunoId && p.alunoId._id)
                .map(p => <li key={p.alunoId._id}>{p.alunoId.name}</li>)
              }
            </ul>
          ) : <p className="text-gray-500 text-center">Aguardando alunos...</p>}
        </div>
        <button onClick={handleIniciarSessao} className="mt-8 bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 w-full">Iniciar Atividade</button>
      </div>
    );
  };

  const renderAlunoView = () => {
    if (!sessaoAtiva) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Entrar em uma Atividade</h2>
          <form onSubmit={handleEntrarNaSessao} className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Digite o código da atividade" value={codigoSessao} onChange={(e) => setCodigoSessao(e.target.value.toUpperCase())} required className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button type="submit" disabled={isJoining} className="w-full sm:w-auto bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400">{isJoining ? 'Entrando...' : 'Entrar'}</button>
          </form>
          {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
        </div>
      );
    }
    if (sessaoAtiva.status === 'FINALIZADA' || (tempoRestante === '00:00' && sessaoAtiva.status === 'EM_ANDAMENTO')) {
      const ranking = [...sessaoAtiva.participantes].sort((a, b) => b.pontuacao - a.pontuacao);
      const minhaPosicao = ranking.findIndex(p => p.alunoId._id === user?._id) + 1;
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Atividade Finalizada!</h2>
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600">Sua posição final:</p>
            <p className="text-4xl font-bold text-teal-600">{minhaPosicao > 0 ? `${minhaPosicao}º lugar` : 'N/A'}</p>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-center">🏆 Ranking Final 🏆</h3>
          <ol className="space-y-3">
            {ranking
              .filter(p => p.alunoId && p.alunoId.name)
              .map((p, index) => (
              <li key={p.alunoId._id} className={`flex items-center gap-4 p-4 rounded-lg ${p.alunoId._id === user?._id ? 'bg-teal-100 border-2 border-teal-500' : 'bg-gray-50'}`}>
                <span className="text-lg font-bold text-gray-500 w-8 text-center">{index + 1}º</span>
                <Avatar name={p.alunoId.name} />
                <span className="text-lg font-semibold grow">{p.alunoId.name}</span>
                <span className="font-bold">{p.pontuacao} pts</span>
              </li>
            ))}
          </ol>
          <button 
            onClick={handleSairDaSessao} 
            className="mt-8 w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Sair
          </button>
        </div>
      );
    }
    if (sessaoAtiva.status === 'EM_ANDAMENTO') {
      const questaoAtual = sessaoAtiva.questoes[indiceQuestaoAtual];
      if (!questaoAtual) {
        return <div className="bg-white p-8 rounded-2xl shadow-lg text-center">Aguardando o ranking final...</div>;
      }
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">{`Questão ${indiceQuestaoAtual + 1} de ${sessaoAtiva.questoes.length}`}</h2>
            <div className="text-2xl font-bold text-red-500 bg-red-100 px-4 py-2 rounded-lg">{tempoRestante}</div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-800 whitespace-pre-wrap">{questaoAtual.enunciado}</p>
            <div className="space-y-3 pt-4">
              {Array.isArray(questaoAtual.alternativas) && questaoAtual.alternativas.map(alt => (
                <button 
                  key={alt.letra} 
                  onClick={() => handleResponder(questaoAtual._id, alt.letra)} 
                  disabled={!!feedbackOverlay || !!respostaSelecionada}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                    ${respostaSelecionada === alt.letra ? 'bg-yellow-200 border-yellow-500' : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-300'}
                    disabled:opacity-70 disabled:cursor-not-allowed
                  `}
                >
                  <span className="font-bold mr-2">{alt.letra})</span>
                  {alt.texto}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    // --- CORREÇÃO NA TELA DE ESPERA DO ALUNO ---
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Você entrou na sessão!</h2>
        <p className="text-gray-600 mb-4">Nome da Atividade: <span className="font-bold">{sessaoAtiva.nome}</span></p>
        
        {/* CÓDIGO DA SALA ADICIONADO AQUI */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Código da Sala:</p>
          <p className="text-2xl font-bold text-teal-600 tracking-widest">{sessaoAtiva.codigo}</p>
        </div>

        <div className="animate-pulse text-teal-600"><p className="text-lg">Aguardando o professor iniciar a atividade...</p></div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {feedbackOverlay && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
            ${feedbackOverlay === 'correta' ? 'bg-green-500/30' : 'bg-red-500/30'}
          `}
        >
          <div className="transform transition-all duration-300 scale-125 animate-pulse">
            {feedbackOverlay === 'correta' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            )}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Sala de Aula</h1>
              <Link href="/" className="text-teal-600 font-semibold hover:underline">
                &larr; Voltar para o Dashboard
              </Link>
          </div>
          
          {user && !user.role && renderRoleSelection()}
          {user && user.role === 'professor' && renderProfessorView()}
          {user && user.role === 'aluno' && renderAlunoView()}
        </div>
      </div>
    </div>
  );
}