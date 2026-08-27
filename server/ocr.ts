export function shouldUseOcr(text: string | null | undefined) {
  return !text || text.trim().length < 40;
}
