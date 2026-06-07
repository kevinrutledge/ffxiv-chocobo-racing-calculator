import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

// Flat config: JS + TypeScript recommended rules, the always-braces rule (curly: all),
// and eslint-config-prettier last so formatting is left to Prettier.
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
  prettier,
)
