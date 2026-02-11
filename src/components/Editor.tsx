import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react';
import type * as MonacoEditor from 'monaco-editor';
import { useTheme } from '../hooks/useTheme';

// --- ICL Language Definition ---

const ICL_LANGUAGE_ID = 'icl';

const ICL_KEYWORDS = [
  'Contract',
  'Identity',
  'PurposeStatement',
  'DataSemantics',
  'BehavioralSemantics',
  'ExecutionConstraints',
  'HumanMachineContract',
  'Extensions',
];

const ICL_TYPES = [
  'Integer',
  'Float',
  'String',
  'Boolean',
  'ISO8601',
  'UUID',
  'Array',
  'Map',
  'Enum',
  'Object',
];

const ICL_FIELDS = [
  'stable_id',
  'version',
  'created_timestamp',
  'owner',
  'semantic_hash',
  'narrative',
  'intent_source',
  'confidence_level',
  'state',
  'invariants',
  'operations',
  'name',
  'precondition',
  'parameters',
  'postcondition',
  'side_effects',
  'idempotence',
  'trigger_types',
  'resource_limits',
  'max_memory_bytes',
  'computation_timeout_ms',
  'max_state_size_bytes',
  'external_permissions',
  'sandbox_mode',
  'system_commitments',
  'system_refusals',
  'user_obligations',
];

function registerIclLanguage(monaco: Monaco) {
  // Register language if not already registered
  if (monaco.languages.getLanguages().some((l: { id: string }) => l.id === ICL_LANGUAGE_ID)) {
    return;
  }

  monaco.languages.register({ id: ICL_LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(ICL_LANGUAGE_ID, {
    keywords: ICL_KEYWORDS,
    typeKeywords: ICL_TYPES,
    fields: ICL_FIELDS,

    tokenizer: {
      root: [
        // Comments
        [/\/\/.*$/, 'comment'],

        // Strings
        [/"[^"]*"/, 'string'],

        // ISO8601 timestamps (before numbers to avoid partial match)
        [/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/, 'number.iso8601'],

        // UUIDs
        [/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/, 'number.uuid'],

        // Numbers (float and integer)
        [/\d+\.\d+/, 'number.float'],
        [/\d+/, 'number'],

        // Boolean
        [/\b(true|false)\b/, 'keyword.boolean'],

        // Identifiers — check against keyword lists
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword.section',
              '@typeKeywords': 'type',
              '@fields': 'variable.field',
              '@default': 'identifier',
            },
          },
        ],

        // Brackets and delimiters
        [/[{}[\]()]/, '@brackets'],
        [/[,:]/, 'delimiter'],

        // Whitespace
        [/\s+/, 'white'],
      ],
    },
  });

  // Define theme colors for ICL tokens
  monaco.editor.defineTheme('icl-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.section', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'variable.field', foreground: '9CDCFE' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },
      { token: 'number.iso8601', foreground: 'DCDCAA' },
      { token: 'number.uuid', foreground: 'DCDCAA' },
      { token: 'keyword.boolean', foreground: '569CD6' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#0a0a0f',
      'editor.foreground': '#D4D4D4',
    },
  });

  // Light theme for ICL syntax
  monaco.editor.defineTheme('icl-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.section', foreground: '8B008B', fontStyle: 'bold' },
      { token: 'type', foreground: '008080' },
      { token: 'variable.field', foreground: '0451A5' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'number.float', foreground: '098658' },
      { token: 'number.iso8601', foreground: '795E26' },
      { token: 'number.uuid', foreground: '795E26' },
      { token: 'keyword.boolean', foreground: '0000FF' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'delimiter', foreground: '333333' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#333333',
    },
  });
}

// --- Component ---

interface IclEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorPositionChange?: (position: { line: number; column: number }) => void;
}

export interface IclEditorHandle {
  goToLine: (line: number, column?: number) => void;
}

export const IclEditor = forwardRef<IclEditorHandle, IclEditorProps>(
  function IclEditor({ value, onChange, onCursorPositionChange }, ref) {
    const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const { theme } = useTheme();

    useImperativeHandle(ref, () => ({
      goToLine(line: number, column = 1) {
        const editor = editorRef.current;
        if (!editor) return;
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column });
        editor.focus();
      },
    }));

    const handleMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      registerIclLanguage(monaco);
      monaco.editor.setTheme(theme === 'dark' ? 'icl-dark' : 'icl-light');

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        onCursorPositionChange?.({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });

      editor.focus();
    };

    // Switch Monaco theme when app theme changes
    useEffect(() => {
      if (monacoRef.current) {
        monacoRef.current.editor.setTheme(theme === 'dark' ? 'icl-dark' : 'icl-light');
      }
    }, [theme]);

    // Keep editor sized properly when container resizes
    useEffect(() => {
      const observer = new ResizeObserver(() => {
        editorRef.current?.layout();
      });
      const container = editorRef.current?.getContainerDomNode();
      if (container) {
        observer.observe(container.parentElement!);
      }
      return () => observer.disconnect();
    }, []);

    return (
      <div className="relative h-full">
        {/* Placeholder overlay when editor is empty */}
        {!value?.trim() && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-start px-16 pt-14">
            <pre className="text-sm text-gray-600/60 font-mono leading-relaxed whitespace-pre select-none">
{`Contract "my_contract" {
  Identity {
    stable_id: "..."
    version: "1.0.0"
  }
  BehavioralSemantics {
    operations: [
      { name: "echo"
        parameters: { message: String }
      }
    ]
  }
}`}
            </pre>
          </div>
        )}
        <Editor
          language={ICL_LANGUAGE_ID}
          value={value}
          onChange={(v) => onChange(v ?? '')}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12 },
          }}
        />
      </div>
    );
  },
);
