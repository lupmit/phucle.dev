import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript',
        'typescript',
        'html',
        'css',
        'json',
        'bash',
        'python',
        'go',
        'rust',
        'java',
        'sql',
        'yaml',
        'markdown',
        'jsx',
        'tsx',
        'shell',
        'diff',
        'dockerfile',
        'graphql',
        'xml',
        'c',
        'cpp',
      ],
    });
  }
  return highlighter;
}
