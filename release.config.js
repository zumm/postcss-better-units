/** @type {import('semantic-release').Options} */
export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      { preset: 'conventionalcommits' },
    ],
    [
      '@semantic-release/release-notes-generator',
      { preset: 'conventionalcommits' },
    ],
    '@anolilab/semantic-release-pnpm',
    '@semantic-release/github',
  ],
}
