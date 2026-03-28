import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { markdown } from '@codemirror/lang-markdown';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { rust } from '@codemirror/legacy-modes/mode/rust';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { sql } from '@codemirror/legacy-modes/mode/sql';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import type { Extension } from '@codemirror/state';

export type LanguageExtension = Extension;

export const getLanguageFromFilename = (filename: string): LanguageExtension => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return javascript({ jsx: true, typescript: false });
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'py':
      return python();
    case 'html':
    case 'htm':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'xml':
    case 'svg':
      return xml();
    case 'md':
    case 'markdown':
      return markdown();
    case 'go':
      return StreamLanguage.define(go);
    case 'rs':
      return StreamLanguage.define(rust);
    case 'yaml':
    case 'yml':
      return StreamLanguage.define(yaml);
    case 'sql':
      return StreamLanguage.define(sql);
    case 'sh':
    case 'bash':
      return StreamLanguage.define(shell);
    case 'rb':
      return StreamLanguage.define(ruby);
    default:
      return javascript();
  }
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || 'js';
};

export const isHtmlFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ext === 'html' || ext === 'htm';
};

export const isJsFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx'].includes(ext);
};

export const isPythonFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ext === 'py';
};

export const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JavaScript (React)',
  ts: 'TypeScript',
  tsx: 'TypeScript (React)',
  py: 'Python',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  xml: 'XML',
  md: 'Markdown',
  go: 'Go',
  rs: 'Rust',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  sh: 'Shell',
  php: 'PHP',
  rb: 'Ruby',
};
