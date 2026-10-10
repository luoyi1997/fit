import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

/**
 * 将 ==text== 转换为 <mark>text</mark>
 */
function preprocessHighlight(md) {
  if (!md) return ''
  return md.replace(/==(.+?)==/g, '<mark>$1</mark>')
}

const components = {
  // ==高亮== — 荧光绿渐变
  mark: ({ children, ...props }) => (
    <mark
      className="inline bg-gradient-to-r from-lime-200 to-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-semibold"
      {...props}
    >
      {children}
    </mark>
  ),
  // > 引用块 — 青柠左边框 + 暖色渐变底
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-[3px] border-lime-400 bg-gradient-to-r from-emerald-50/80 to-orange-50/40 py-3 px-4 my-3 rounded-r-xl text-slate-600 text-[0.95em]"
      {...props}
    >
      {children}
    </blockquote>
  ),
  // 段落
  p: ({ children, ...props }) => (
    <p className="my-1.5 leading-relaxed text-slate-700" {...props}>{children}</p>
  ),
  // 列表项
  li: ({ children, ...props }) => (
    <li className="my-0.5 leading-relaxed text-slate-700 [&::marker]:text-lime-500" {...props}>{children}</li>
  ),
  // 无序列表
  ul: ({ children, ...props }) => (
    <ul className="pl-5 my-2 list-disc space-y-0.5" {...props}>{children}</ul>
  ),
  // 有序列表
  ol: ({ children, ...props }) => (
    <ol className="pl-5 my-2 list-decimal space-y-0.5 [&::marker]:text-emerald-600" {...props}>{children}</ol>
  ),
  // 加粗
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-slate-900" {...props}>{children}</strong>
  ),
  // 链接
  a: ({ children, ...props }) => (
    <a
      className="text-emerald-600 underline decoration-lime-300 underline-offset-2 hover:text-orange-500 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),
  // 标题
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 text-slate-900" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold mt-5 mb-2 text-emerald-800" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold mt-4 mb-1.5 text-slate-700" {...props}>{children}</h3>
  ),
  // 行内代码
  code: ({ children, className, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-emerald-100" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>{children}</code>
    )
  },
  // 分割线
  hr: (props) => <hr className="my-6 border-slate-100" {...props} />,
}

/**
 * Markdown 渲染组件
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const processed = useMemo(() => preprocessHighlight(content), [content])

  return (
    <div className={`max-w-none text-sm sm:text-[15px] leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
