
import { useState } from 'react'

export const Tailwind = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Hello, Tailwind!</h1>
          <p>This is a simple example of dark mode in Tailwind CSS.</p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  );
}
