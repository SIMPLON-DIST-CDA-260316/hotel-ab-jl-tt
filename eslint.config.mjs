import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import boundaries from 'eslint-plugin-boundaries';

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // shadcn/ui generated components — not manually maintained
    'src/components/ui/**',
  ]),
  {
    rules: {
      indent: ['error', 2],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
    },
  },
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/(components|hooks|lib|types|stores|config)/*' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'app', pattern: 'app/*' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: ['shared', 'feature', 'app'], allow: ['shared'] },
          { from: ['app'], allow: ['feature'] },
          { from: ['feature'], disallow: ['feature'] },
        ],
      }],
    },
  },
]);

export default eslintConfig;