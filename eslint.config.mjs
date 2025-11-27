import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const rules = {
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-unused-vars': [
        'warn',
        {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        },
    ],
}

const eslintConfig = [
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
        ],
    },
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        rules: {
            ...rules,
            '@next/next/no-img-element': 'off',
        },
    },
]

export default eslintConfig
