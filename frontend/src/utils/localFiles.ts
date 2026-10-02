import { Board, Page } from '../types/board';

/**
 * Downloads the current board and all its lessons as a standalone .myboard file.
 */
export function saveBoardToLocalDisk(board: Board) {
  const data = JSON.stringify(board, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const sanitizedName = (board.name || 'MyBoard').replace(/[^a-zA-Z0-9_-]/g, '_');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizedName}.myboard`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current lesson page notes into clean Markdown (.md)
 * formatted for YouTube video descriptions or GitHub repositories.
 */
export function saveNotesAsMarkdown(boardName: string, page: Page) {
  let md = `# ${page.name}\n\n`;
  md += `> Course: **${boardName}**  \n`;
  md += `> Generated with **MyBoard** digital whiteboard  \n\n`;
  md += `---\n\n`;

  const elements = page.canvasState?.elements || [];

  // 1. Extract titles and text notes
  const textElements = elements.filter((el) => el.type === 'text') as any[];
  const codeElements = elements.filter((el) => el.type === 'code') as any[];

  if (textElements.length > 0) {
    md += `## Lesson Notes\n\n`;
    for (const textEl of textElements) {
      if (textEl.fontSize >= 30) {
        md += `### ${textEl.text}\n\n`;
      } else {
        md += `${textEl.text}\n\n`;
      }
    }
  }

  // 2. Extract code blocks
  if (codeElements.length > 0) {
    md += `## Code Snippets\n\n`;
    for (const codeEl of codeElements) {
      if (codeEl.title) {
        md += `#### ${codeEl.title}\n\n`;
      }
      md += `\`\`\`${codeEl.language || 'javascript'}\n${codeEl.code}\n\`\`\`\n\n`;
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const sanitizedPage = (page.name || 'Lesson').replace(/[^a-zA-Z0-9_-]/g, '_');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizedPage}_notes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a .myboard or .json file from user's local disk.
 */
export function readBoardFromLocalDisk(file: File): Promise<Board> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.name || !Array.isArray(parsed.pages)) {
          throw new Error('Invalid .myboard file structure. Missing name or pages.');
        }

        resolve(parsed as Board);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
