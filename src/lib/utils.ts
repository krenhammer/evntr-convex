import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

export interface SelectionPosition {
  startRow: number; // 1-based line number
  startChar: number; // 0-based character position in the line
  endRow: number; // 1-based line number
  endChar: number; // 0-based character position in the line
}

export function getSelectionPosition(fullText: string, selectedText: string): SelectionPosition | null {
  // Find the first occurrence of selectedText in fullText
  const startIndex = fullText.indexOf(selectedText);
  if (startIndex === -1) {
    return null; // Selected text not found in full text
  }
  const endIndex = startIndex + selectedText.length;

  // Use a regex to split on any line ending (\r\n, \n, or \r)
  const lineEndingRegex = /\r\n|\n|\r/;
  const lines = fullText.split(lineEndingRegex);
  // Keep track of line endings for accurate character counting
  const lineEndings = fullText.match(lineEndingRegex) || [];

  let currentCharIndex = 0;
  let startRow = 1;
  let startChar = 0;
  let endRow = 1;
  let endChar = 0;

  // Find start position
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineEndingLength = i < lineEndings.length ? lineEndings[i].length : 0;
    const lineLength = line.length + lineEndingLength;

    if (currentCharIndex + lineLength > startIndex) {
      startRow = i + 1; // 1-based line number
      startChar = startIndex - currentCharIndex; // 0-based character position
      break;
    }
    currentCharIndex += lineLength;
  }

  // Find end position
  currentCharIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineEndingLength = i < lineEndings.length ? lineEndings[i].length : 0;
    const lineLength = line.length + lineEndingLength;

    if (currentCharIndex + lineLength > endIndex) {
      endRow = i + 1; // 1-based line number
      endChar = endIndex - currentCharIndex; // 0-based character position
      break;
    }
    currentCharIndex += lineLength;
  }

  return { startRow, startChar, endRow, endChar };
}

