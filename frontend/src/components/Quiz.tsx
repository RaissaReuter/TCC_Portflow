// src/components/Quiz.tsx
"use client"

import { useState } from 'react';

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string; // Novo campo para explicação
}

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: () => void;
}

export default function Quiz({ questions, onQuizComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsCorrect(selectedAnswer === currentQuestion.correctAnswerIndex);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      onQuizComplete();
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Rápido</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-semibold mb-4">{`Pergunta ${currentQuestionIndex + 1}: ${currentQuestion.questionText}`}</p>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all
                ${selectedAnswer === index ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'}
                ${showResult && index === currentQuestion.correctAnswerIndex ? 'bg-green-200 !border-green-500' : ''}
                ${showResult && selectedAnswer === index && !isCorrect ? 'bg-red-200 !border-red-500' : ''}
                disabled:cursor-not-allowed
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div> {/* <<-- ESTA DIV ESTAVA FALTANDO O FECHAMENTO */}

      {showResult ? (
         <div className="mt-4 text-center p-4 rounded-lg" style={{ backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2' }}>
            <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta!'}
            </p>
    
    {/* EXIBINDO A EXPLICAÇÃO */}
    {!isCorrect && (
      <p className="text-sm text-gray-700 mt-2">{currentQuestion.explanation}</p>
    )}
          <button onClick={handleNext} className="mt-2 bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar e Continuar'}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button onClick={handleCheckAnswer} disabled={selectedAnswer === null} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold disabled:bg-gray-400">
            Verificar Resposta
          </button>
        </div>
      )}
    </div>
  );
}