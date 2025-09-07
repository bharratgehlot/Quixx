import React, { useState, useMemo, useCallback } from 'react';
// Replace the QUIZ_BANK object with imports
import quiz1 from './data/quiz_1.json';
import quiz2 from './data/quiz_2.json';
import quiz3 from './data/quiz_3.json';
import quiz4 from './data/quiz_4.json';
import quiz5 from './data/quiz_5.json';
import quiz6 from './data/quiz_6.json';
import quiz7 from './data/quiz_7.json';

const QUIZ_BANK = {
  "General": quiz1,
  "History": quiz2,
  "Geography": quiz3,
  "Movies": quiz4,
  "Music": quiz5,
  "Technology": quiz6,
  "Sports": quiz7
};


const GlobalStyles = () => (
  <style>{`
    body {
      font-family: Arial, sans-serif;
    }
    button, input {
      border-radius: 0 !important;
    }
  `}</style>
);

export default function App() {
  // --- State Hooks ---
  const [quizState, setQuizState] = useState('start'); // 'start' | 'inProgress' | 'finished'
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // --- Memoized Derived State ---
  const currentQuestion = useMemo(() => quizData[currentQuestionIndex], [quizData, currentQuestionIndex]);
  const progressPercentage = useMemo(() => {
    if (quizData.length === 0) return 0;
    return ((currentQuestionIndex + 1) / quizData.length) * 100;
  }, [currentQuestionIndex, quizData.length]);
  
  // --- Quiz Logic Methods ---
  const startQuiz = useCallback((topic) => {
    setQuizData(QUIZ_BANK[topic]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedbackMessage('');
    setQuizState('inProgress');
  }, []);

  const handleAnswer = useCallback((option) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option);
    const correctAnswer = currentQuestion?.answer;

    if (option === correctAnswer) {
      setScore(s => s + 1);
      setFeedbackMessage('Correct! 🎉');
    } else {
      setFeedbackMessage(`Wrong! The correct answer was ${correctAnswer}.`);
    }
  }, [selectedAnswer, currentQuestion]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizData.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setFeedbackMessage('');
    } else {
      setQuizState('finished');
    }
  }, [currentQuestionIndex, quizData.length]);

  const restartQuiz = useCallback(() => {
    setQuizState('start');
    setQuizData([]);
  }, []);

  const getOptionClass = useCallback((option) => {
    if (selectedAnswer === null) return '';

    const isCorrect = option === currentQuestion?.answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return 'bg-green-200 border-green-500 text-green-800 disabled:opacity-100';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-200 border-red-500 text-red-800 disabled:opacity-100';
    }
    
    return 'disabled:opacity-60';
  }, [selectedAnswer, currentQuestion]);

  const renderContent = () => {
    switch (quizState) {
      case 'start':
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome to Quixx!</h2>
            <p className="text-gray-600 mb-6">Select a category to start your quiz.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(QUIZ_BANK).map(topic => (
                <button 
                  key={topic}
                  onClick={() => startQuiz(topic)}
                  className="bg-purple-600 text-white font-bold py-3 px-6 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300">
                  {topic}
                </button>
              ))}
            </div>
          </div>
        );
      case 'finished':
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 text-lg mb-6">
              You scored <span className="font-bold text-purple-700">{score}</span> out of <span className="font-bold text-gray-800">{quizData.length}</span>.
            </p>
            <button onClick={restartQuiz} className="w-full md:w-auto bg-purple-600 text-white font-bold py-3 px-8 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300">
              Choose Another Quiz
            </button>
          </div>
        );
      case 'inProgress':
        return (
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-500 text-right">
                Question <span className="font-bold">{currentQuestionIndex + 1}</span> / {quizData.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{currentQuestion?.question}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion?.options.map((option) => (
                <button 
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 border border-gray-300 text-left font-semibold text-gray-700 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed transition-all duration-200 ${getOptionClass(option)}`}>
                  {option}
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <div className="mt-6 text-center">
                <p className={`font-bold mb-4 ${feedbackMessage.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedbackMessage}
                </p>
                <button onClick={nextQuestion} className="w-full md:w-auto bg-purple-600 text-white font-bold py-3 px-8 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300">
                  {currentQuestionIndex === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="bg-gradient-to-br from-purple-600 to-blue-500 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500">
        <nav className="absolute top-0 left-0 right-0 bg-purple-800 bg-opacity-50 shadow-md p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">Quixx</h1>
            <div className="text-white text-sm">Welcome, User!</div>
          </div>
        </nav>

        <main className="w-full max-w-2xl mt-16">
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 transition-all duration-500 ease-in-out transform">
            {renderContent()}
          </div>
          <p className="text-center text-white text-opacity-70 mt-6 text-sm">
            Powered by React and Tailwind CSS.
          </p>
        </main>
      </div>
    </>
  );
}


