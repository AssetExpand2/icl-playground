import { useEffect, useState } from 'react'
import { useIcl } from './hooks/useIcl'
import { IclEditor } from './components/Editor'
import { EXAMPLE_CONTRACTS } from './icl/types'
import './App.css'

const DEFAULT_EXAMPLE = EXAMPLE_CONTRACTS[0]

function App() {
  const { wasmReady, init } = useIcl()
  const [source, setSource] = useState('')

  // Initialize WASM + load default example
  useEffect(() => {
    init()
    fetch(`${import.meta.env.BASE_URL}examples/${DEFAULT_EXAMPLE.filename}`)
      .then((r) => r.text())
      .then(setSource)
      .catch(() => setSource('// Failed to load example'))
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

      {/* Main: Editor (left) + Output placeholder (right) */}
      <main className="flex-1 flex min-h-0">
        {/* Editor pane */}
        <div className="flex-1 min-w-0">
          <IclEditor value={source} onChange={setSource} />
        </div>

        {/* Output pane — placeholder for Phase 1.3 */}
        <div className="w-[400px] border-l border-gray-800 bg-gray-900 p-4 overflow-auto">
          <p className="text-sm text-gray-500">Output panel coming in Phase 1.3</p>
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
