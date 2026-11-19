import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Vite + React + Tailwind CSS
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            RFID Asset Management is ready for development.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Count is {count}
          </button>
          <span className="text-xs text-slate-500">
            Click to test interactive state
          </span>
        </div>

        <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400">
          Edit <code className="text-indigo-300 bg-slate-900/60 px-1.5 py-0.5 rounded">src/App.tsx</code> to start building your application.
        </div>
      </div>
    </div>
  )
}
