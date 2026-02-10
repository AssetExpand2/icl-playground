import { useEffect } from 'react'
import { useIcl } from './hooks/useIcl'
import './App.css'

function App() {
  const { wasmReady, init } = useIcl()

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          ICL Playground
        </h1>
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${wasmReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-xs text-gray-500">
            {wasmReady ? 'WASM Ready' : 'Loading WASM...'}
          </span>
        </div>
      </header>

      {/* Main content area — placeholder for editor + output */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold text-gray-300">
            ICL Playground
          </p>
          <p className="text-gray-500">
            Write, parse, and test ICL contracts in the browser.
          </p>
          <p className="text-sm text-gray-600">
            {wasmReady
              ? 'icl-runtime loaded — Editor coming in Phase 1.'
              : 'Initializing icl-runtime WASM module...'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-2 text-xs text-gray-600 flex justify-between">
        <span>v0.1.0</span>
        <a
          href="https://github.com/ICL-System/ICL-Spec"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          ICL Specification
        </a>
      </footer>
    </div>
  )
}

export default App
