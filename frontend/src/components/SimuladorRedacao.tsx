"use client"

import { useState } from "react";
import toast from 'react-hot-toast';
import { api } from "@/services/api";

// --- INTERFACES ---
interface PontoFeedback {
  competencia: string;
  descricao: string;
}
interface NotasIA {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  notaFinal: number;
}
interface FeedbackIA {
  notas: NotasIA;
  analiseGeral: string;
  pontosFortes: PontoFeedback[];
  pontosAMelhorar: PontoFeedback[];
  sugestaoFinal: string;
  errosSugeridos?: { palavra: string; sugestao: string }[];
}
interface AnaliseResponse {
  feedback: FeedbackIA;
}
interface ApiErrorResponse {
  message: string;
}

// --- TYPE GUARD ---
function isApiError(error: unknown): error is { response: { data: ApiErrorResponse } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null &&
    'data' in (error as { response: { data?: unknown } }).response &&
    typeof (error as { response: { data?: unknown } }).response.data === 'object' &&
    (error as { response: { data?: unknown } }).response.data !== null &&
    'message' in (error as { response: { data: { message?: unknown } } }).response.data
  );
}

const TEMAS_INICIAIS = [
  "O estigma associado às doenças mentais na sociedade brasileira",
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  "A importância do acesso à educação de qualidade para o futuro do país",
  "Impactos da tecnologia digital na vida contemporânea e nas relações sociais",
];

const TextoDestacado = ({ texto, erros }: { texto: string; erros: { palavra: string; sugestao: string }[] }) => {
  if (!erros || erros.length === 0) {
    return <p className="whitespace-pre-wrap">{texto}</p>;
  }
  const escapedWords = erros.map(e => e.palavra.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = texto.split(regex);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        const erro = erros.find(e => e.palavra.toLowerCase() === part.toLowerCase());
        return erro ? (
          <span key={i} className="relative group cursor-pointer">
            <span className="underline decoration-red-500 decoration-wavy">{part}</span>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Sugestão: {erro.sugestao}
            </span>
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
};

export default function SimuladorRedacao() {
  const [temaAtual, setTemaAtual] = useState(TEMAS_INICIAIS[0]);
  const [texto, setTexto] = useState('');
  const [feedback, setFeedback] = useState<FeedbackIA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const gerarNovoTema = () => {
    const indiceAtual = TEMAS_INICIAIS.indexOf(temaAtual);
    const proximoIndice = (indiceAtual + 1) % TEMAS_INICIAIS.length;
    setTemaAtual(TEMAS_INICIAIS[proximoIndice]);
    setTexto('');
    setFeedback(null);
    setError('');
  };

  const analisarRedacao = async () => {
    if (texto.trim().length < 150) {
      setError('Sua redação precisa ter pelo menos 150 caracteres para uma análise completa.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFeedback(null);
    try {
      const response = await api.post<AnaliseResponse>(
        '/redacao/analisar',
        { tema: temaAtual, texto: texto }
      );
      console.log("Resposta recebida do backend:", response.data);
      setFeedback(response.data.feedback);
      toast.success("Sua redação foi analisada!");
    } catch (err: unknown) {
      console.error("Erro ao analisar redação:", err);
      let errorMessage = "Desculpe, não consegui analisar sua redação no momento. Tente novamente.";
      
      if (isApiError(err)) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = texto.length;
  const maxLength = 7000;

  const getNotaColor = (nota: number) => {
    if (nota >= 900) return 'text-blue-600';
    if (nota >= 700) return 'text-green-600';
    if (nota >= 500) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Simulador de Redação</h2>
      
      <div className="bg-gray-100 p-4 rounded-xl mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-teal-700">TEMA ATUAL</p>
          <p className="text-gray-800 font-medium">{temaAtual}</p>
        </div>
        <button 
          onClick={gerarNovoTema}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
        >
          Gerar Novo Tema
        </button>
      </div>

      <div className="relative">
        <textarea
          className="w-full min-h-[400px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-y"
          placeholder="Comece a escrever sua redação aqui..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={maxLength}
        />
        <div className={`absolute bottom-3 right-3 text-sm font-medium px-2 py-1 rounded
          ${characterCount > maxLength * 0.9 ? 'text-red-600' : 'text-gray-500'}
        `}>
          {characterCount} / {maxLength}
        </div>
      </div>

      <button
        onClick={analisarRedacao}
        disabled={isLoading}
        className="w-full mt-4 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analisando...
          </>
        ) : (
          'Analisar com IA'
        )}
      </button>

      {error && <div className="mt-4 text-red-500 text-center">{error}</div>}

      {feedback && (
        <div className="mt-8 space-y-8">
          
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-2xl text-center border-2 border-teal-200">
            <p className="text-lg font-semibold text-teal-800">Sua nota estimada é</p>
            <p className={`text-7xl font-bold my-2 ${getNotaColor(feedback.notas.notaFinal)}`}>
              {feedback.notas.notaFinal}
            </p>
            <div className="grid grid-cols-5 gap-2 text-sm mt-4 text-gray-600">
              <div>C1: <span className="font-bold">{feedback.notas.c1}</span></div>
              <div>C2: <span className="font-bold">{feedback.notas.c2}</span></div>
              <div>C3: <span className="font-bold">{feedback.notas.c3}</span></div>
              <div>C4: <span className="font-bold">{feedback.notas.c4}</span></div>
              <div>C5: <span className="font-bold">{feedback.notas.c5}</span></div>
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-2">Sua Redação Analisada:</h3>
            <TextoDestacado texto={texto} erros={feedback.errosSugeridos || []} />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-2">Análise Geral</h3>
            <p className="text-gray-700">{feedback.analiseGeral}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-700 border-b pb-2 mb-2">Pontos Fortes</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {feedback.pontosFortes.map((ponto, index) => (
                <li key={`forte-${index}`}><strong>{ponto.competencia}:</strong> {ponto.descricao}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-700 border-b pb-2 mb-2">Pontos a Melhorar</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {feedback.pontosAMelhorar.map((ponto, index) => (
                <li key={`melhorar-${index}`}><strong>{ponto.competencia}:</strong> {ponto.descricao}</li>
              ))}
            </ul>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-bold text-teal-800">Sugestão do Portinho:</h3>
            <p className="text-teal-700 italic">{feedback.sugestaoFinal}</p>
          </div>
        </div>
      )}
    </div>
  );
}