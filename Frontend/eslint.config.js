import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        alias: {
          map: [['@', path.resolve(__dirname, './src')]],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Usa @/ o ./ para imports relativos',
            },
          ],
        },
      ],
      'max-lines': [
        'warn',
        {
          max: 300,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
    },
  },
  {
    // Restricción de límites: la capa shared no puede importar de features ni de app
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Usa @/ o ./ para imports relativos',
            },
            {
              group: ['@/features/**', '@/features', '@/app/**', '@/app'],
              message: 'Violación de límites de arquitectura: la capa shared no puede depender de features ni de app.',
            },
          ],
        },
      ],
    },
  },
  {
    // Restricción de límites: la capa features no puede importar de app
    files: ['src/features/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Usa @/ o ./ para imports relativos',
            },
            {
              group: ['@/app/**', '@/app'],
              message: 'Violación de límites de arquitectura: la capa features no puede depender de app.',
            },
          ],
        },
      ],
    },
  },
]
