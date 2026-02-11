import { useEffect, useState, useCallback, useRef } from 'react'
import { useIcl } from './hooks/useIcl'
import { useThemeProvider, ThemeContext } from './hooks/useTheme'
import { useShareableUrl } from './hooks/useShareableUrl'
import { IclEditor } from './components/Editor'
import type { IclEditorHandle } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { OutputPanel } from './components/OutputPanel'
import { ExamplePicker } from './components/ExamplePicker'
import { StatusBar } from './components/StatusBar'
import { SplitPane } from './components/SplitPane'
import { EXAMPLE_CONTRACTS } from './icl/types'
import type { PipelineAction } from './icl/types'
import './App.css'

// Read icl-runtime version at build time
const ICL_RUNTIME_VERSION = '0.1.2'

const DEFAULT_EXAMPLE = EXAMPLE_CONTRACTS[0]

function App() {
  const { wasmReady, loading, result, init, run } = useIcl()
  const themeCtx = useThemeProvider()
  const [source, setSource] = useState('')
  const [loadedSource, setLoadedSource] = useState('')
  const [activeAction, setActiveAction] = useState<PipelineAction | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<IclEditorHandle>(null)
  const [copied, setCopied] = useState(false)

  const dirty = source !== loadedSource && source.trim() !== ''

  // Shareable URL support
  const { share } = useShareableUrl((urlSource) => {
    setSource(urlSource)
    setLoadedSource(urlSource)
  })

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

  const handleShare = useCallback(async () => {
    const ok = await share(source)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [share, source])

  return (
    <ThemeContext.Provider value={themeCtx}>
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
          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-medium
              bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-50
              transition-colors duration-150"
            title="Copy shareable link to clipboard"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
          {/* Theme toggle */}
          <button
            onClick={themeCtx.toggle}
            className="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            title={themeCtx.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {themeCtx.theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
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

      {/* Main: Editor (left) + Output (right) — draggable split */}
      <SplitPane
        left={
          <IclEditor
            ref={editorRef}
            value={source}
            onChange={setSource}
            onCursorPositionChange={setCursorPosition}
          />
        }
        right={
          <OutputPanel result={result} source={source} onGoToLine={handleGoToLine} />
        }
        defaultRightWidth={400}
        minRightWidth={200}
        maxRightWidth={800}
      />

      {/* Status Bar */}
      <StatusBar
        cursorPosition={cursorPosition}
        parseStatus={parseStatus}
        errorCount={errorCount}
        runtimeVersion={ICL_RUNTIME_VERSION}
        dirty={dirty}
      />
    </div>
    </ThemeContext.Provider>
  )
}

export default App
