module.exports = {
  root: true,
  extends: ['dherault-typescript'],
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
        ],
        pathGroupsExcludedImportTypes: [],
        pathGroups: [
          {
            pattern: '~types',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '~constants',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '~execution/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '~project/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '~helpers/**',
            group: 'internal',
            position: 'after',
          },
        ],
      },
    ],
  },
}
