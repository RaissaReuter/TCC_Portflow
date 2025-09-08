// src/components/SimuladorRedacao.tsx
"use client"

import { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

// --- INTERFACES ---
interface PontoFeedback {
  competencia: string;
  descricao: string;
}

interface FeedbackIA {
  analiseGeral: string;
  pontosFortes: PontoFeedback[];
  pontosAMelhorar: PontoFeedback[];
  sugestaoFinal: string;
  errosSugeridos?: { palavra: string; sugestao: string }[];
}

interface AnaliseResponse {
  feedback: FeedbackIA;
}

const TEMAS_INICIAIS = [
  "O estigma associado às doenças mentais na sociedade brasileira",
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  "A importância do acesso à educação de qualidade para o futuro do país",
  "Impactos da tecnologia digital na vida contemporânea e nas relações sociais",
];

// --- COMPONENTE AUXILIAR ---
const TextoDestacado = ({ texto, erros }: { texto: string; erros: { palavra: string; sugestao: string }[] }) => {
  if (!erros || erros.length === 0) {
    return <p className="whitespace-pre-wrap">{texto}</p>;
  }
  
  // Escapa caracteres especiais para usar na Regex
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

// --- COMPONENTE PRINCIPAL ---
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
    if (texto.trim().length < 50) {
      setError('Sua redação precisa ter pelo menos 50 caracteres.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFeedback(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Você precisa estar logado para analisar sua redação.");
        setIsLoading(false);
        return;
      }
      
      const response = await axios.post<AnaliseResponse>(
        'http://localhost:3001/api/redacao/analisar', // Usando a rota correta
        { tema: temaAtual, texto: texto },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setFeedback(response.data.feedback);
      toast.success("Sua redação foi analisada!");

    } catch (error) {
      console.error("Erro ao analisar redação:", error);
      setError("Desculpe, não consegui analisar sua redação no momento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <textarea
        className="w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        placeholder="Comece a escrever sua redação aqui..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

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
        <div className="mt-6 space-y-6">
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