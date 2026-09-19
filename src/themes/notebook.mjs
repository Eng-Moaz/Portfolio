// A restrained, high-contrast syntax palette for paper and charcoal inserts.
const theme = (name, type, palette) => ({
  name, type,
  colors: { 'editor.background': palette.background, 'editor.foreground': palette.ink },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.comment, fontStyle: 'italic' } },
    { scope: ['string', 'constant.other.symbol'], settings: { foreground: palette.string } },
    { scope: ['keyword', 'storage', 'storage.type'], settings: { foreground: palette.keyword } },
    { scope: ['entity.name.function', 'support.function', 'entity.name.tag'], settings: { foreground: palette.function } },
    { scope: ['constant.numeric', 'constant.language', 'variable.other.constant', 'entity.name.type', 'support.type'], settings: { foreground: palette.constant } },
    { scope: ['punctuation', 'variable', 'meta'], settings: { foreground: palette.ink } },
  ],
});
export const notebookLight = theme('notebook-light', 'light', {
  background: '#efebe1', ink: '#34342e', comment: '#62685d', string: '#4e6a45',
  keyword: '#9a4d3d', function: '#4d6285', constant: '#805e27',
});
export const notebookDark = theme('notebook-dark', 'dark', {
  background: '#242522', ink: '#e4e2d9', comment: '#a4a79b', string: '#b5c59a',
  keyword: '#dfa88f', function: '#aac0d5', constant: '#d6bf8f',
});
