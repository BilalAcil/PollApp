/** Char code of 'A', the base letter option indices count up from. */
const LETTER_A_CHAR_CODE = 65;

/** Converts a zero-based option index into its display letter (A, B, C, ...). */
export function optionLetter(index: number): string {
  return String.fromCharCode(LETTER_A_CHAR_CODE + index);
}
