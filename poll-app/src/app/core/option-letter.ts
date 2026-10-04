/** Converts a zero-based option index into its display letter (A, B, C, ...). */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
