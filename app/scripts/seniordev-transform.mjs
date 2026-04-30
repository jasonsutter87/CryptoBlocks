#!/usr/bin/env node
// Internal tool: convert CryptoBlocks-generated JS into idiomatic ("senior dev") JS
// for LLM training data. Not exposed to end users.
//
// Usage:
//   node scripts/seniordev-transform.mjs <input.js >output.js
//   node scripts/seniordev-transform.mjs path/to/file.js
//   echo "...code..." | node scripts/seniordev-transform.mjs

import { parse } from 'acorn'
import { readFileSync } from 'node:fs'

const PARSE_OPTS = {
  ecmaVersion: 'latest',
  sourceType: 'script',
  allowReturnOutsideFunction: true,
  allowAwaitOutsideFunction: true,
}

const META_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'raw'])

function walk(node, visitor, parent = null, key = null) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visitor, parent, key)
    return
  }
  if (typeof node.type !== 'string') return
  visitor(node, parent, key)
  for (const k of Object.keys(node)) {
    if (META_KEYS.has(k)) continue
    walk(node[k], visitor, node, k)
  }
}

// Identifiers that are *references* (skip property names, label names, etc.)
function collectIdentifierRefs(root) {
  const refs = []
  walk(root, (node, parent, key) => {
    if (node.type !== 'Identifier') return
    if (parent) {
      if (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) return
      if (parent.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand) return
      if (parent.type === 'MethodDefinition' && key === 'key' && !parent.computed) return
      if (parent.type === 'PropertyDefinition' && key === 'key' && !parent.computed) return
      if (parent.type === 'LabeledStatement' && key === 'label') return
      if (parent.type === 'BreakStatement' && key === 'label') return
      if (parent.type === 'ContinueStatement' && key === 'label') return
    }
    refs.push(node)
  })
  return refs
}

const SAFE_BODY_TYPES = new Set([
  'Identifier', 'Literal', 'CallExpression', 'MemberExpression',
  'ThisExpression', 'TemplateLiteral', 'ArrayExpression', 'ObjectExpression',
  'NewExpression', 'ChainExpression',
])

function bodyNeedsParens(bodyAst) {
  return !SAFE_BODY_TYPES.has(bodyAst.type)
}

function argNeedsParens(argNode) {
  return !SAFE_BODY_TYPES.has(argNode.type)
}

function findWrappers(ast, source) {
  const wrappers = new Map()
  for (const node of ast.body) {
    if (node.type !== 'FunctionDeclaration') continue
    if (!node.id || node.async || node.generator) continue
    const body = node.body
    if (!body || body.type !== 'BlockStatement' || body.body.length !== 1) continue

    const params = []
    let validParams = true
    for (const p of node.params) {
      if (p.type !== 'Identifier') { validParams = false; break }
      params.push(p.name)
    }
    if (!validParams) continue

    const stmt = body.body[0]
    if (stmt.type === 'ReturnStatement' && stmt.argument) {
      wrappers.set(node.id.name, {
        kind: 'expr',
        params,
        bodyAst: stmt.argument,
        bodyText: source.slice(stmt.argument.start, stmt.argument.end),
        node,
      })
    } else if (stmt.type === 'ExpressionStatement') {
      wrappers.set(node.id.name, {
        kind: 'stmt',
        params,
        bodyAst: stmt.expression,
        bodyText: source.slice(stmt.expression.start, stmt.expression.end),
        node,
      })
    }
  }
  return wrappers
}

function expandCall(wrapper, argTexts) {
  const refs = collectIdentifierRefs(wrapper.bodyAst)
  const base = wrapper.bodyAst.start
  const splices = []
  for (const ref of refs) {
    const idx = wrapper.params.indexOf(ref.name)
    if (idx === -1 || idx >= argTexts.length) continue
    splices.push({ start: ref.start - base, end: ref.end - base, text: argTexts[idx] })
  }
  splices.sort((a, b) => b.start - a.start)
  let out = wrapper.bodyText
  for (const s of splices) out = out.slice(0, s.start) + s.text + out.slice(s.end)
  return out
}

function applyReplacements(source, replacements) {
  if (replacements.length === 0) return source
  replacements.sort((a, b) => b.start - a.start)
  let out = source
  for (const r of replacements) out = out.slice(0, r.start) + r.text + out.slice(r.end)
  return out
}

// Drop any replacement whose range is contained inside another. Walker collects
// nested call sites in the same pass; applying both stomps on offsets. Keep the
// outermost per pass — inner ones get picked up on the next pass.
function dropNestedReplacements(reps) {
  reps.sort((a, b) => a.start - b.start || b.end - a.end)
  const out = []
  let lastEnd = -1
  for (const r of reps) {
    if (r.start < lastEnd) continue
    out.push(r)
    lastEnd = r.end
  }
  return out
}

// One pass: inline every call site of every known wrapper, OR drop wrappers
// whose names are no longer referenced.
function inlinePass(source) {
  let ast
  try { ast = parse(source, PARSE_OPTS) }
  catch { return { source, changed: false } }

  const wrappers = findWrappers(ast, source)
  if (wrappers.size === 0) return { source, changed: false }

  const callReplacements = []
  const referencedNames = new Set()

  walk(ast, (node, parent, key) => {
    if (node.type === 'Identifier' && wrappers.has(node.name)) {
      // Only count *uses*, not the FunctionDeclaration's own id node.
      if (!(parent && parent.type === 'FunctionDeclaration' && key === 'id')) {
        referencedNames.add(node.name)
      }
    }
    if (node.type !== 'CallExpression') return
    if (!node.callee || node.callee.type !== 'Identifier') return
    const wrapper = wrappers.get(node.callee.name)
    if (!wrapper) return
    if (node.arguments.length !== wrapper.params.length) return
    if (wrapper.kind === 'stmt' && (!parent || parent.type !== 'ExpressionStatement')) return

    const argTexts = node.arguments.map(arg => {
      const text = source.slice(arg.start, arg.end)
      return argNeedsParens(arg) ? `(${text})` : text
    })
    let replacement = expandCall(wrapper, argTexts)
    if (wrapper.kind === 'expr' && bodyNeedsParens(wrapper.bodyAst)) {
      replacement = `(${replacement})`
    }
    callReplacements.push({ start: node.start, end: node.end, text: replacement })
  })

  if (callReplacements.length > 0) {
    const safe = dropNestedReplacements(callReplacements)
    return { source: applyReplacements(source, safe), changed: true }
  }

  // No call sites left for any wrapper — drop ones with no remaining references.
  const drops = []
  for (const [name, w] of wrappers) {
    if (!referencedNames.has(name)) {
      // Include trailing newline so we don't leave blank lines behind.
      let end = w.node.end
      while (end < source.length && (source[end] === '\n' || source[end] === ' ')) end++
      drops.push({ start: w.node.start, end, text: '' })
    }
  }
  if (drops.length === 0) return { source, changed: false }
  return { source: applyReplacements(source, drops), changed: true }
}

function stripBoilerplate(source) {
  return source
    .replace(/^\/\/ Generated by CryptoBlocks\r?\n?/gm, '')
    .replace(/^\/\/ --- Block Definitions ---\r?\n?/gm, '')
    .replace(/^\/\/ --- Program ---\r?\n?/gm, '')
    .replace(/^\/\/ --- HTML Setup ---\r?\n?/gm, '')
    .replace(/^\/\/ --- Slow-Mo Trace ---\r?\n?/gm, '')
    .replace(/\/\*__cb:[^*]*\*\/[ \t]*\r?\n?/g, '')
}

function tidyBlankLines(source) {
  return source.replace(/\n{3,}/g, '\n\n').replace(/^\s*\n+/, '').replace(/\s+$/, '\n')
}

function isNumericLiteral(node) {
  return node && node.type === 'Literal' && typeof node.value === 'number'
}

// Scan forward from openPos (which must point at '(') until the matching ')',
// using paren depth. Crudely skips string/template contents. Returns -1 if no match.
function findMatchingClose(source, openPos) {
  if (source[openPos] !== '(') return -1
  let depth = 0
  for (let i = openPos; i < source.length; i++) {
    const c = source[i]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++
        i++
      }
      continue
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (c === '/' && source[i + 1] === '*') {
      i += 2
      while (i < source.length - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++
      i++
      continue
    }
    if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return i }
  }
  return -1
}

// Returns true if the `(` at openPos is the structural opening paren of the
// parent's syntax (call/new arg list, if/while/for test). We must NOT absorb
// those when stripping wrappers around a folded literal.
function isStructuralParen(parent, key, openPos, source) {
  if (!parent) return false
  const scanForFirstOpenAt = (from, until) => {
    for (let i = from; i < until; i++) {
      const c = source[i]
      if (c === '(') return i
      if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') return -1
    }
    return -1
  }
  if ((parent.type === 'CallExpression' || parent.type === 'NewExpression') && key === 'arguments') {
    if (!parent.callee) return false
    return scanForFirstOpenAt(parent.callee.end, parent.end) === openPos
  }
  if (parent.type === 'IfStatement' && key === 'test') {
    return scanForFirstOpenAt(parent.start + 2, parent.end) === openPos
  }
  if ((parent.type === 'WhileStatement' || parent.type === 'DoWhileStatement') && key === 'test') {
    return scanForFirstOpenAt(parent.start, parent.end) !== -1 // conservative: don't strip
  }
  if (parent.type === 'ForStatement' || parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') {
    return scanForFirstOpenAt(parent.start + 3, parent.end) === openPos
  }
  if (parent.type === 'SwitchStatement' && key === 'discriminant') {
    return scanForFirstOpenAt(parent.start + 6, parent.end) === openPos
  }
  return false
}

function foldConstants(source) {
  for (let pass = 0; pass < 12; pass++) {
    let ast
    try { ast = parse(source, PARSE_OPTS) }
    catch { return source }
    const reps = []
    walk(ast, (node, parent, key) => {
      if (node.type !== 'BinaryExpression') return
      if (!isNumericLiteral(node.left) || !isNumericLiteral(node.right)) return
      const a = node.left.value, b = node.right.value
      let v
      switch (node.operator) {
        case '+': v = a + b; break
        case '-': v = a - b; break
        case '*': v = a * b; break
        case '/': if (b === 0) return; v = a / b; break
        case '%': if (b === 0) return; v = a % b; break
        case '**': v = a ** b; break
        default: return
      }
      if (!Number.isFinite(v)) return
      // If the BinaryExpression is immediately wrapped in matching parens
      // that aren't structural (call args, if/while test, etc.), absorb them
      // so we don't leave `(2)` artifacts in folded output.
      let start = node.start, end = node.end
      while (start > 0 && source[start - 1] === '(' && source[end] === ')') {
        const close = findMatchingClose(source, start - 1)
        if (close !== end) break
        if (isStructuralParen(parent, key, start - 1, source)) break
        start -= 1
        end += 1
      }
      reps.push({ start, end, text: String(v) })
    })
    if (reps.length === 0) return source
    source = applyReplacements(source, reps)
  }
  return source
}

function pickSingleStmt(node) {
  if (!node) return null
  if (node.type === 'BlockStatement') return node.body.length === 1 ? node.body[0] : null
  return node
}

function sameText(a, b, source) {
  return source.slice(a.start, a.end) === source.slice(b.start, b.end)
}

// Collapse `if (c) { f(a); } else { f(b); }` → `f(c ? a : b);`
// when both branches are single ExpressionStatements with identical-text callees,
// equal arity, and exactly one differing argument position.
function collapseTernary(source) {
  let ast
  try { ast = parse(source, PARSE_OPTS) }
  catch { return source }

  const reps = []
  walk(ast, node => {
    if (node.type !== 'IfStatement' || !node.alternate) return
    const t = pickSingleStmt(node.consequent)
    const e = pickSingleStmt(node.alternate)
    if (!t || !e) return
    if (t.type !== 'ExpressionStatement' || e.type !== 'ExpressionStatement') return
    const a = t.expression, b = e.expression
    if (a.type !== 'CallExpression' || b.type !== 'CallExpression') return
    if (!sameText(a.callee, b.callee, source)) return
    if (a.arguments.length !== b.arguments.length) return

    let diffIdx = -1, diffCount = 0
    for (let i = 0; i < a.arguments.length; i++) {
      if (!sameText(a.arguments[i], b.arguments[i], source)) { diffCount++; diffIdx = i }
    }
    if (diffCount !== 1) return

    const calleeText = source.slice(a.callee.start, a.callee.end)
    const condText = source.slice(node.test.start, node.test.end)
    const argTexts = a.arguments.map((arg, i) => {
      if (i !== diffIdx) return source.slice(arg.start, arg.end)
      const aArg = source.slice(a.arguments[i].start, a.arguments[i].end)
      const bArg = source.slice(b.arguments[i].start, b.arguments[i].end)
      return `${condText} ? ${aArg} : ${bArg}`
    })
    reps.push({ start: node.start, end: node.end, text: `${calleeText}(${argTexts.join(', ')});` })
  })
  return applyReplacements(source, reps)
}

export function toSeniorDev(source, opts = {}) {
  const maxPasses = opts.maxPasses ?? 16
  let cur = stripBoilerplate(source)
  for (let i = 0; i < maxPasses; i++) {
    const { source: next, changed } = inlinePass(cur)
    cur = next
    if (!changed) break
  }
  cur = foldConstants(cur)
  cur = collapseTernary(cur)
  cur = tidyBlankLines(cur)
  return cur
}

// CLI
const isDirectRun = import.meta.url === `file://${process.argv[1]}`
if (isDirectRun) {
  const arg = process.argv[2]
  let input
  if (arg) {
    input = readFileSync(arg, 'utf8')
  } else {
    input = readFileSync(0, 'utf8')
  }
  process.stdout.write(toSeniorDev(input))
}
