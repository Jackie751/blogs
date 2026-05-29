// 简单 Markdown 解析器，支持常用语法
export function parseMarkdown(md) {
  if (!md) return ''
  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 引用块（多行）
    .replace(/(^> .+\n?)+/gm, (block) => {
      const inner = block.replace(/^> /gm, '').trim()
      return `<blockquote>${inner}</blockquote>`
    })
    // 换行变段落
    .split(/\n\n+/)
    .map(para => {
      para = para.trim()
      if (!para) return ''
      if (/^<(h[1-3]|blockquote|hr)/.test(para)) return para
      return `<p>${para.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return html
}
