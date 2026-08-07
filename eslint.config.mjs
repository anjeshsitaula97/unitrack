import { createRequire } from 'module';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const require = createRequire(import.meta.url);
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const nextTypescript = require('eslint-config-next/typescript');

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    plugins: { prettier: prettierPlugin, 'unused-imports': unusedImports },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: false,
          semi: true,
          tabWidth: 2,
          printWidth: 100,
          trailingComma: 'es5',
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: [
      'prisma/**/*.ts',
      'src/lib/seed-*.ts',
      'src/lib/seed-admin.ts',
      'src/lib/seed-data.ts',
      'src/lib/seed-featured.ts',
      'src/lib/check-counts.ts',
      'scripts/**/*.mjs',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/app/layout.tsx'],
    rules: {
      '@next/next/no-page-custom-font': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      'coverage/',
      'graphify-out/',
      '.backup_unused/',
      '.stitch/',
      'scratch/',
      'scanner-agent/',
      'scripts/',
      'data/',
      '*.config.mjs',
      '*.config.js',
      'next-env.d.ts',
      'prisma/dev.db',
    ],
  },
];
