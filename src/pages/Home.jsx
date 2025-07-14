import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLink } from 'react-icons/fi';
import UrlInputForm from '../components/UrlInputForm';
import ShortenedUrlDisplay from '../components/ShortenedUrlDisplay';
import UrlHistory from '../components/UrlHistory';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <FiLink className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-3">
            Shorten Your Links
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create short, memorable links and track their performance with our powerful URL shortener.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-12"
          >
            <UrlInputForm onSubmittingChange={setIsSubmitting} />
            <div className="mt-6">
              <ShortenedUrlDisplay />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <UrlHistory />
          </motion.div>
        </div>
      </div>

      <footer className="mt-24 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} URL Shortener. All rights reserved.</p>
      </footer>
    </div>
  );
}
