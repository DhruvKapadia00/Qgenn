'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './components/ThemeToggle';
import Logo from './components/Logo';

type QAPair = {
  question: string;
  answer: string;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const generateQuestions = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }
      
      setQaPairs(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black transition-colors duration-500">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          <Logo />
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 text-gradient text-center leading-normal py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Qgen
          </motion.h1>
          <motion.p
            className="text-lg text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Generate perfect interview questions for any role
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-1">
            <textarea
              className="w-full p-6 rounded-xl min-h-[200px] bg-transparent focus:outline-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl glass-card bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={generateQuestions}
            disabled={loading || !jobDescription.trim()}
            className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-300 ${
              loading || !jobDescription.trim() 
                ? 'opacity-50 cursor-not-allowed'
                : 'button-gradient hover:opacity-90 active:scale-[0.99]'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              <span className="text-white">Generate Questions</span>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {qaPairs.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 space-y-6"
            >
              {qaPairs.map((pair, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors flex justify-between items-center"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <span className="font-medium text-lg text-gray-900 dark:text-white pr-4 flex-1">
                      <span className="text-blue-400 mr-2">Q{index + 1}:</span>
                      {pair.question}
                    </span>
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-gray-500 dark:text-gray-400 flex-shrink-0"
                      animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </motion.svg>
                  </button>
                  
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-800/50">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="text-pink-400 font-medium">A{index + 1}:</span>{' '}
                            {pair.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <motion.button
                onClick={generateQuestions}
                className="w-full border border-gray-300 dark:border-gray-700 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-lg font-medium active:transform active:scale-[0.99] text-gray-900 dark:text-white mt-6"
                variants={item}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Regenerate Questions
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
