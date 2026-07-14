/** Strip light Markdown / URLs so TTS reads naturally. Safe for client or server. */
export function toSpeechText(raw: string): string {
  return raw
    .replace(/\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/https?:\/\/[^\s<>()]+/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
