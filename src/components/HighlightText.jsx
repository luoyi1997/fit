import { Fragment } from 'react'

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 搜索词高亮（大小写不敏感）：命中片段包 <mark class="search-highlight">
 * 仅用于纯文本字段；Markdown 渲染内容不经过此组件，避免破坏标记语法。
 */
export default function HighlightText({ text, query }) {
  if (!query || !text) return <Fragment>{text}</Fragment>
  const q = String(query).trim()
  if (!q) return <Fragment>{text}</Fragment>

  const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, 'gi'))
  return (
    <Fragment>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </Fragment>
  )
}
