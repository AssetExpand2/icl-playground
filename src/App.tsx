import { useEffect, useState, useCallback, useRef } from 'react'
import { useIcl } from './hooks/useIcl'
import { IclEditor } from './components/Editor'
import type { IclEditorHandle } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { OutputPanel } from './components/OutputPanel'
import { ExamplePicker } from './components/ExamplePicker'
import { StatusBar } from './components/StatusBar'
import { EXAMPLE_CONTRACTS } from './icl/types'
import type { PipelineAction } from './icl/types'
import './App.css'

// Read icl-runtime version at build time
const ICL_RUNTIME_VERSION = '0.1.2'

const DEFAULT_EXAMPLE = EXAMPLE_CONTRACTS[0]

function App() {
  const { wasmReady, loading, result, init, run } = useIcl()
  const [source, setSource] = useState('')
  const [loadedSource, setLoadedSource] = useState('')
  const [activeAction, setActiveAction] = useState<PipelineAction | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<IclEditorHandle>(null)

  const dirty = source !== loadedSource && source.trim() !== ''

  // Derive parse status from last result
  const parseStatus: 'idle' | 'valid' | 'error' = !result
    ? 'idle'
    : result.success
      ? 'valid'
      : 'error'

  const errorCount = result && !result.success ? 1 : 0

  // Initialize WASM + load default example
  useEffect(() => {
    init()
    fetch(`${import.meta.env.BASE_URL}examples/${DEFAULT_EXAMPLE.filename}`)
      .then((r) => r.text())
      .then((text) => {
        setSource(text)
        setLoadedSource(text)
      })
      .catch(() => setSource('// Failed to load example'))
  }, [init])

  // Handle toolbar actions
  const handleAction = useCallback(
    async (action: PipelineAction) => {
      setActiveAction(action)
      await run(action, source)
    },
    [run, source],
  )

  // Handle example selection
  const handleExampleSelect = useCallback((text: string) => {
    setSource(text)
    setLoadedSource(text)
  }, [])

  // Handle click-to-jump from error panel
  const handleGoToLine = useCallback((line: number, column?: number) => {
    editorRef.current?.goToLine(line, column)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">
            ICL Playground
          </h1>
          <ExamplePicker dirty={dirty} onSelect={handleExampleSelect} />
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${wasmReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-xs text-gray-500">
            {wasmReady ? 'WASM Ready' : 'Loading WASM...'}
          </span>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        wasmReady={wasmReady}
        loading={loading}
        activeAction={activeAction}
        onAction={handleAction}
      />

      {/* Main: Editor (left) + Output (right) */}
      <main className="flex-1 flex min-h-0">
        {/* Editor pane */}
        <div className="flex-1 min-w-0">
          <IclEditor
            ref={editorRef}
            value={source}
            onChange={setSource}
            onCursorPositionChange={setCursorPosition}
          />
        </div>

        {/* Output pane */}
        <div className="w-[400px] border-l border-gray-800 bg-gray-900">
          <OutputPanel result={result} onGoToLine={handleGoToLine} />
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        cursorPosition={cursorPosition}
        parseStatus={parseStatus}
        errorCount={errorCount}
        runtimeVersion={ICL_RUNTIME_VERSION}
        dirty={dirty}
      />
    </div>
  )
}

export default App
