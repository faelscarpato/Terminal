import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { get, set } from 'idb-keyval';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getWebContainer } from './webcontainer';

const DB_KEY = 'webcontainer-fs-state';

export async function saveFileSystemState() {
  const wc = await getWebContainer();
  const state = await extractFS(wc, '/');
  await set(DB_KEY, state);
}

export async function loadFileSystemState(): Promise<FileSystemTree | null> {
  return await get(DB_KEY) || null;
}

export const defaultFiles: FileSystemTree = {
  'index.js': {
    file: {
      contents: `import express from 'express';\nconst app = express();\nconst port = 3111;\n\napp.get('/', (req, res) => {\n  res.send('Hello from Node.js in the browser!');\n});\n\napp.listen(port, () => {\n  console.log(\`Ready! Server listening at http://localhost:\${port}\`);\n});`,
    },
  },
  'package.json': {
    file: {
      contents: `{\n  "name": "example-app",\n  "type": "module",\n  "dependencies": {\n    "express": "latest",\n    "nodemon": "latest"\n  },\n  "scripts": {\n    "start": "nodemon index.js"\n  }\n}`,
    },
  },
};

async function extractFS(wc: WebContainer, dir: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const entries = await wc.fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    const fullPath = dir === '/' ? `/${entry.name}` : `${dir}/${entry.name}`;
    
    if (entry.isDirectory()) {
      tree[entry.name] = {
        directory: await extractFS(wc, fullPath),
      };
    } else if (entry.isFile()) {
      const contents = await wc.fs.readFile(fullPath, 'utf-8');
      tree[entry.name] = {
        file: {
          contents,
        },
      };
    }
  }
  return tree;
}

export async function exportToZip() {
  const wc = await getWebContainer();
  const zip = new JSZip();
  await addDirToZip(wc, '/', zip);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'project-export.zip');
}

async function addDirToZip(wc: WebContainer, dir: string, zip: JSZip) {
  const entries = await wc.fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const fullPath = dir === '/' ? `/${entry.name}` : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      const subFolder = zip.folder(entry.name);
      if (subFolder) await addDirToZip(wc, fullPath, subFolder);
    } else {
      const contents = await wc.fs.readFile(fullPath);
      zip.file(entry.name, contents);
    }
  }
}
