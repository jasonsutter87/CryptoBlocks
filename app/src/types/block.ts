export interface BlockInput {
  name: string
  type: 'string' | 'number' | 'boolean' | 'any'
  description: string
  default?: string | number | boolean
}

export interface BlockOutput {
  name: string
  type: 'string' | 'number' | 'boolean' | 'any'
}

export interface BlockTest {
  input: Record<string, unknown>
  expected: Record<string, unknown>
}

export interface BlockDefinition {
  name: string
  author: string
  version: string
  description: string
  category: BlockCategory
  inputs: BlockInput[]
  outputs: BlockOutput[]
  implementations: {
    javascript: string
    python: string
  }
  tests: BlockTest[]
  color: string
  icon?: string
}

export type BlockCategory =
  | 'Basics'
  | 'Math'
  | 'Text'
  | 'Lists'
  | 'Logic'
  | 'Web'
  | 'Games'
  | 'Sound'
  | 'Art'
  | 'Data'
  | 'Crypto'
  | 'AI'
  | 'Hardware'

export type Language = 'javascript' | 'python'

export const CATEGORY_COLORS: Record<BlockCategory, string> = {
  Basics: '#4C97AF',
  Math: '#5B80A5',
  Text: '#8B5CF6',
  Lists: '#D97706',
  Logic: '#059669',
  Web: '#DC2626',
  Games: '#EA580C',
  Sound: '#DB2777',
  Art: '#9333EA',
  Data: '#0891B2',
  Crypto: '#4F46E5',
  AI: '#7C3AED',
  Hardware: '#65A30D',
}
