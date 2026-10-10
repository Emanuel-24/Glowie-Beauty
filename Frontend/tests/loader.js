import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const rootDir = path.resolve(import.meta.dirname, '..')

function resolveWithExtensions(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath
  }
  for (const ext of ['.js', '.jsx', '.json']) {
    if (fs.existsSync(`${basePath}${ext}`)) {
      return `${basePath}${ext}`
    }
  }
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of ['.js', '.jsx']) {
      const idx = path.join(basePath, `index${ext}`)
      if (fs.existsSync(idx)) {
        return idx
      }
    }
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const relativePath = specifier.slice(2)
    const target = path.resolve(rootDir, 'src', relativePath)
    const resolved = resolveWithExtensions(target)
    if (resolved) {
      return {
        format: 'module',
        shortCircuit: true,
        url: pathToFileURL(resolved).href,
      }
    }
  }

  if (specifier.startsWith('.') && context.parentURL) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL))
    const target = path.resolve(parentDir, specifier)
    const resolved = resolveWithExtensions(target)
    if (resolved) {
      return {
        format: 'module',
        shortCircuit: true,
        url: pathToFileURL(resolved).href,
      }
    }
  }

  return nextResolve(specifier, context)
}
