import React, { useState, useMemo, useCallback } from 'react';

// --- Static Quiz Data Bank ---
// In a real app, this might come from separate JSON files.
// For this single-file component, we'll define it here.
const QUIZ_BANK = {
  "Science": [
    { question: "What is the chemical symbol for water?", options: ["O2", "H2O", "CO2", "NaCl"], answer: "H2O" },
    { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars" },
    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], answer: "Mitochondrion" },
    { question: "What force keeps us on the ground?", options: ["Magnetism", "Gravity", "Friction", "Tension"], answer: "Gravity" },
    { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], answer: "300,000 km/s" }
  ],
  "History": [
    { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], answer: "George Washington" },
    { question: "In which year did World War II end?", options: ["1942", "1945", "1950", "1939"], answer: "1945" },
    { question: "The ancient Egyptians are famous for building what structures?", options: ["Ziggurats", "Pyramids", "Colosseums", "Temples"], answer: "Pyramids" },
    { question: "Who discovered America in 1492?", options: ["Ferdinand Magellan", "Vasco da Gama", "Marco Polo", "Christopher Columbus"], answer: "Christopher Columbus" },
    { question: "The Renaissance was a rebirth of art and learning that started in which country?", options: ["France", "Spain", "Italy", "Greece"], answer: "Italy" }
  ],
  "Geography": [
    { question: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: "Tokyo" },
    { question: "Which is the longest river in the world?", options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"], answer: "Nile River" },
    { question: "What is the largest desert in the world?", options: ["Sahara Desert", "Arabian Desert", "Gobi Desert", "Antarctic Polar Desert"], answer: "Antarctic Polar Desert" },
    { question: "Mount Everest is located in which mountain range?", options: ["The Andes", "The Rockies", "The Alps", "The Himalayas"], answer: "The Himalayas" },
    { question: "Which country is known as the Land of the Rising Sun?", options: ["China", "South Korea", "Japan", "Thailand"], answer: "Japan" }
  ],
  "Movies": [
    { question: "Who directed the movie 'Jurassic Park'?", options: ["James Cameron", "George Lucas", "Steven Spielberg", "Christopher Nolan"], answer: "Steven Spielberg" },
    { question: "Which movie features the character 'Darth Vader'?", options: ["Star Trek", "The Lord of the Rings", "Harry Potter", "Star Wars"], answer: "Star Wars" },
    { question: "In 'The Matrix', what color pill does Neo take?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Red" },
    { question: "What is the highest-grossing film of all time (unadjusted for inflation)?", options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars: The Force Awakens"], answer: "Avatar" },
    { question: "Which animated film features a character named Simba?", options: ["Aladdin", "The Lion King", "Toy Story", "Shrek"], answer: "The Lion King" }
  ],
  "Music": [
    { question: "Who is known as the 'King of Pop'?", options: ["Elvis Presley", "Michael Jackson", "Freddie Mercury", "David Bowie"], answer: "Michael Jackson" },
    { question: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], answer: "6" },
    { question: "Which band released the album 'Abbey Road'?", options: ["The Rolling Stones", "The Beatles", "Led Zeppelin", "Queen"], answer: "The Beatles" },
    { question: "What genre of music originated in New Orleans?", options: ["Blues", "Country", "Rock and Roll", "Jazz"], answer: "Jazz" },
    { question: "Who wrote the classical masterpiece 'The Four Seasons'?", options: ["Bach", "Mozart", "Beethoven", "Vivaldi"], answer: "Vivaldi" }
  ],
  "Technology": [
    { question: "What does 'CPU' stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Power Unit", "Core Processing Unit"], answer: "Central Processing Unit" },
    { question: "Who is the co-founder of Microsoft?", options: ["Steve Jobs", "Bill Gates", "Larry Page", "Mark Zuckerberg"], answer: "Bill Gates" },
    { question: "What does 'HTTP' stand for?", options: ["HyperText Transfer Protocol", "HyperText Transmission Protocol", "Hyperlink Transfer Protocol", "Hyperlink Transmission Protocol"], answer: "HyperText Transfer Protocol" },
    { question: "In what year was the first iPhone released?", options: ["2005", "2007", "2009", "2010"], answer: "2007" },
    { question: "What is the primary function of RAM in a computer?", options: ["Long-term storage", "Temporary data storage", "Processing calculations", "Powering the monitor"], answer: "Temporary data storage" }
  ],
  "Sports": [
    { question: "How many players are on a standard soccer team on the field?", options: ["9", "10", "11", "12"], answer: "11" },
    { question: "Which country won the first ever FIFA World Cup in 1930?", options: ["Brazil", "Argentina", "Italy", "Uruguay"], answer: "Uruguay" },
    { question: "In basketball, how many points is a free throw worth?", options: ["1", "2", "3", "4"], answer: "1" },
    { question: "What is the national sport of Japan?", options: ["Judo", "Karate", "Sumo Wrestling", "Baseball"], answer: "Sumo Wrestling" },
    { question: "Which athlete has the most Olympic medals?", options: ["Usain Bolt", "Michael Phelps", "Larisa Latynina", "Paavo Nurmi"], answer: "Michael Phelps" }
  ]
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


