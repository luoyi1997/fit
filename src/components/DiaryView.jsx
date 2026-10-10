import { useMemo } from 'react'
import { CalendarDays, Clock, BookOpen } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import HighlightText from './HighlightText'

function DiaryEntry({ entry, searchQuery }) {
  const sections = useMemo(() => {
    const lines = entry.raw.split('\n').slice(1)
    const result = []
    let currentSection = { header: '训练内容', items: [] }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('类型：')) {
        result.push({ header: '类型', items: [trimmed.replace('类型：', '').trim()] })
        continue
      }

      if (trimmed.match(/^(热身|正式组|有氧|拉伸|注意事项|反馈|要点)[：:]/)) {
        result.push(currentSection)
        currentSection = { header: trimmed.replace(/[：:].*/, ''), items: [] }
        const rest = trimmed.replace(/^[^：:]+[：:]\s*/, '')
        if (rest) currentSection.items.push(rest)
        continue
      }

      if (trimmed.match(/^[→-]/)) {
        currentSection.items.push(trimmed.replace(/^[→-]\s*/, ''))
      } else {
        currentSection.items.push(trimmed)
      }
    }
    result.push(currentSection)
    return result.filter(s => s.items.length > 0)
  }, [entry.raw])

  const typeTags = entry.type ? entry.type.split(/\s+/) : []

  return (
    <div className="relative pl-8 sm:pl-10 lg:pl-12 pb-8 sm:pb-10 lg:pb-12">
      {/* 时间线节点 — 主色圆点 */}
      <div className="absolute left-[-6px] top-2 w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full brand-gradient-bg ring-4 ring-brand-page shadow-md shadow-brand-primary/25 z-10" />

      {/* 内容卡片 */}
      <div className="bg-brand-card rounded-2xl border border-brand-border shadow-sm hover:shadow-lg hover:shadow-brand-primary/10 hover:border-brand-primary/40 transition-all duration-300 px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3 lg:mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CalendarDays size={15} className="text-brand-primary shrink-0" />
              <span className="font-extrabold text-brand-text text-sm sm:text-base lg:text-lg">
                <HighlightText text={entry.date} query={searchQuery} />
              </span>
              <span className="text-brand-border">|</span>
              <span className="text-brand-primary text-sm sm:text-base lg:text-lg font-semibold">
                <HighlightText text={entry.title} query={searchQuery} />
              </span>
            </div>
            {typeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                {typeTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-brand-accent-soft text-brand-accent px-2.5 py-1 rounded-full border border-brand-accent/20"
                  >
                    <HighlightText text={tag} query={searchQuery} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 内容渲染 */}
        {sections.length > 0 && (
          <div className="space-y-3 lg:space-y-4">
            {sections
              .filter(s => s.header !== '类型')
              .map((section, si) => (
                <div key={si}>
                  <div className="flex items-center gap-1.5 mb-1.5 lg:mb-2">
                    <Clock size={12} className="text-brand-text-placeholder shrink-0" />
                    <span className="text-[11px] lg:text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">
                      {section.header}
                    </span>
                  </div>
                  <ul className="space-y-1.5 lg:space-y-2 ml-5">
                    {section.items.map((item, ii) => (
                      <li key={ii} className="text-sm lg:text-base text-brand-text leading-relaxed">
                        <MarkdownRenderer content={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DiaryView({ entries, searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.raw.toLowerCase().includes(q) ||
      e.date.includes(q)
    )
  }, [entries, searchQuery])

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-brand-text-placeholder">
        <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-brand-primary/30" />
        <p className="text-lg font-medium text-brand-text-secondary">没有匹配的训练日记</p>
        <p className="text-sm mt-1">试试其他关键词</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 左侧时间轴线 — 主色→紫克制渐变 */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-brand-primary/40 via-brand-primary/25 to-brand-accent/40 opacity-60 rounded-full" />

      <div>
        {filtered.map((entry, i) => (
          <div
            key={entry.date + entry.title + i}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
          >
            <DiaryEntry entry={entry} searchQuery={searchQuery} />
          </div>
        ))}
      </div>
    </div>
  )
}
