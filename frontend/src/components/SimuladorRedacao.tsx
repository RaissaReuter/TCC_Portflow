// src/components/SimuladorRedacao.tsx
"use client"

import { useState } from "react";
import axios from "axios";

// No futuro, podemos buscar os temas do backend
const TEMAS_INICIAIS = [
  "O estigma associado às doenças mentais na sociedade brasileira",
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  "A importância do acesso à educação de qualidade para o futuro do país",
  "Impactos da tecnologia digital na vida contemporânea e nas relações sociais",
];

// Interface para a resposta da nossa API de IA
interface AnaliseIA {
  reply: string; // A IA nos dará um feedback em texto
  // Poderíamos adicionar uma nota aqui no futuro, ex: score: number;
}

export default function SimuladorRedacao() {
  const [temaAtual, setTemaAtual] = useState(TEMAS_INICIAIS[0]);
  const [texto, setTexto] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const gerarNovoTema = () => {
    const indiceAtual = TEMAS_INICIAIS.indexOf(temaAtual);
    const proximoIndice = (indiceAtual + 1) % TEMAS_INICIAIS.length;
    setTemaAtual(TEMAS_INICIAIS[proximoIndice]);
    setTexto('');
    setFeedback('');
  };

  const analisarRedacao = async () => {
    if (texto.trim().length < 50) {
      setFeedback('Sua redação precisa ter pelo menos 50 caracteres para uma análise significativa.');
      return;
    }
    setIsLoading(true);
    setFeedback('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setFeedback("Você precisa estar logado para analisar sua redação.");
        setIsLoading(false);
        return;
      }
      
      // O prompt que enviaremos para a IA, incluindo o tema e o texto
      const promptParaIA = `Por favor, atue como um corretor do ENEM. Analise a seguinte redação com base no tema "${temaAtual}". Forneça um feedback construtivo em 2 ou 3 parágrafos curtos, apontando pontos fortes e áreas para melhoria, focando em coesão, coerência, argumentação e respeito à norma culta. A redação é: "${texto}"`;

      const response = await axios.post<AnaliseIA>(
        'http://localhost:3001/api/chatbot', // Usaremos a mesma API do chatbot por enquanto
        { message: promptParaIA },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setFeedback(response.data.reply);

    } catch (error) {
      console.error("Erro ao analisar redação:", error);
      setFeedback("Desculpe, não consegui analisar sua redação no momento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Simulador de Redação</h2>
      
      {/* Caixa do Tema */}
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

      {/* Área de Texto */}
      <textarea
        className="w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        placeholder="Comece a escrever sua redação aqui..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      {/* Botão de Análise */}
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

      {/* Área de Feedback */}
      {feedback && (
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h3 className="font-bold text-blue-800 mb-2">Feedback do Portinho:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
        </div>
      )}
    </div>
  );
}