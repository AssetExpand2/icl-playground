import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          ICL Playground
        </h1>
        <span className="text-xs text-gray-500">
          Powered by icl-runtime (WASM)
        </span>
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
            Editor and output panels coming in Phase 1.
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
