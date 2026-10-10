import { useMemo, useEffect } from 'react'
import { ChevronDown, Tag, Target, Dumbbell, Lightbulb, NotebookPen } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import HighlightText from './HighlightText'
import FilterChips from './FilterChips'

function ExerciseCard({ exercise, isExpanded, onToggle, index, searchQuery }) {
  const hasNotes = exercise.notes && exercise.notes.length > 0
  const detailId = `ex-detail-${exercise.__key}`
  const toggleId = `ex-toggle-${exercise.__key}`

  return (
    <div
      className="
        bg-brand-card rounded-2xl border border-brand-border shadow-sm
        hover:shadow-lg hover:shadow-brand-primary/10 hover:border-brand-primary/40
        transition-all duration-300 animate-fade-in-up overflow-hidden group
      "
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {/* 卡片头部 — 可折叠按钮（ARIA: aria-expanded / aria-controls） */}
      <button
        id={toggleId}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onKeyDown={(e) => {
          // Escape 关闭当前展开项
          if (e.key === 'Escape' && isExpanded) {
            e.preventDefault()
            onToggle()
            e.currentTarget.focus()
          }
        }}
        className="w-full text-left px-5 sm:px-6 lg:px-7 py-4 sm:py-5 lg:py-6 flex items-start justify-between gap-4 hover:bg-brand-primary-soft/60 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-brand-text group-hover:text-brand-primary transition-colors">
            <HighlightText text={exercise.name} query={searchQuery} />
          </h4>
          {exercise.alias && (
            <span className="inline-block text-xs lg:text-sm font-medium text-brand-accent bg-brand-accent-soft border border-brand-accent/20 px-2 py-0.5 rounded-full mt-1.5">
              <HighlightText text={exercise.alias} query={searchQuery} />
            </span>
          )}
          {exercise.tags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exercise.tags.split(/\s+/).filter(t => t).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] sm:text-xs font-medium bg-brand-accent-soft text-brand-accent px-2.5 py-1 rounded-full"
                >
                  <HighlightText text={tag} query={searchQuery} />
                </span>
              ))}
            </div>
          )}
          {exercise.params && (
            <p className="text-sm lg:text-base text-brand-text-secondary mt-2 flex items-center gap-1.5">
              <Dumbbell size={14} className="shrink-0 text-brand-primary" />
              <span><HighlightText text={exercise.params} query={searchQuery} /></span>
            </p>
          )}
        </div>
        <span className={`mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-accent' : 'text-brand-text-placeholder group-hover:text-brand-primary'}`}>
          <ChevronDown size={22} />
        </span>
      </button>

      {/* 展开详情 — grid-rows 平滑动画，ARIA region */}
      <div id={detailId} role="region" aria-labelledby={toggleId} className={`expand-grid ${isExpanded ? 'open' : ''}`}>
        <div className="expand-grid-inner">
          <div className="px-5 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-7 border-t border-brand-border pt-4 sm:pt-5 lg:pt-6">
            {/* 目标肌群 */}
            {exercise.target && (
              <div className="mb-4 lg:mb-5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary mb-1.5 lg:mb-2">
                  <Target size={14} />
                  <span>目标肌群</span>
                </div>
                <p className="text-sm lg:text-base text-brand-primary bg-brand-primary-soft rounded-xl px-4 py-2.5 border border-brand-primary/20">
                  <HighlightText text={exercise.target} query={searchQuery} />
                </p>
              </div>
            )}

            {/* 动作要领 */}
            {exercise.instructions.length > 0 && (
              <div className="mb-4 lg:mb-5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary mb-1.5 lg:mb-2">
                  <Dumbbell size={14} />
                  <span>动作要领</span>
                </div>
                <ul className="space-y-2 lg:space-y-2.5 ml-1">
                  {exercise.instructions.map((inst, i) => (
                    <li key={i} className="text-sm lg:text-base text-brand-text flex gap-2">
                      <span className="text-brand-primary mt-0.5 shrink-0 select-none">-</span>
                      <MarkdownRenderer content={inst} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 疑难点答疑 */}
            {exercise.tips.length > 0 && (
              <>
                <div className="border-t border-brand-border my-4 lg:my-5" />
                <div className="mb-4 lg:mb-5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-warning mb-1.5 lg:mb-2">
                    <Lightbulb size={14} />
                    <span>疑难点 / 知识补充</span>
                  </div>
                  <div className="bg-brand-warning-soft rounded-xl px-4 py-2.5 lg:py-3 space-y-1 border border-brand-warning/25">
                    {exercise.tips.map((tip, i) => (
                      <div key={i} className="text-sm lg:text-base text-brand-text-secondary leading-relaxed">
                        <MarkdownRenderer content={tip} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 原稿记录 */}
            {hasNotes && (
              <>
                <div className="border-t border-brand-border my-4 lg:my-5" />
                <div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-warning mb-2 lg:mb-3">
                    <NotebookPen size={14} />
                    <span>原稿记录</span>
                  </div>
                  <div className="bg-brand-warning-soft rounded-xl px-4 py-3 lg:py-3.5 space-y-2 border border-brand-warning/25">
                    {exercise.notes.map((note, i) => (
                      <div key={i} className="text-sm lg:text-base text-brand-text-secondary leading-relaxed">
                        <MarkdownRenderer content={note} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 原稿记录 — 卡片底部始终可见的预览 */}
      {hasNotes && !isExpanded && (
        <div className="border-t border-brand-border bg-brand-page px-5 sm:px-6 lg:px-7 py-3 lg:py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-brand-warning mb-1">
            <NotebookPen size={12} />
            <span>原稿记录</span>
          </div>
          <p className="text-xs sm:text-sm text-brand-text-placeholder leading-relaxed line-clamp-2">
            {exercise.notes[0].replace(/\n/g, ' ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default function EncyclopediaView({
  sections, searchQuery, selectedParts, selectedTags,
  expandedKeys, onToggleExpand, onTogglePart, onToggleTag,
  parts, tags, onClearFilters,
}) {
  // 注入稳定 key：section.category + 序号
  const indexed = useMemo(() => {
    return sections.map(section => ({
      ...section,
      exercises: section.exercises.map((ex, i) => ({ ...ex, __key: `${section.category}-${i}` })),
    }))
  }, [sections])

  // 搜索 + 部位 + 标签 三重过滤（AND）
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return indexed
      .map(section => ({
        ...section,
        exercises: section.exercises.filter(ex => {
          if (selectedParts.length > 0 && !selectedParts.includes(section.category)) return false
          if (selectedTags.length > 0) {
            const exTags = String(ex.tags || '').split(/\s+/).filter(Boolean)
            if (!selectedTags.some(t => exTags.includes(t))) return false
          }
          if (!q) return true
          return (
            ex.name.toLowerCase().includes(q) ||
            String(ex.tags || '').toLowerCase().includes(q) ||
            String(ex.target || '').toLowerCase().includes(q) ||
            (ex.alias && ex.alias.toLowerCase().includes(q)) ||
            ex.instructions.some(i => i.toLowerCase().includes(q)) ||
            ex.notes.some(n => n.toLowerCase().includes(q))
          )
        }),
      }))
      .filter(section => section.exercises.length > 0)
  }, [indexed, searchQuery, selectedParts, selectedTags])

  // 搜索时自动展开匹配的结果（仅补入未展开项，不覆盖用户手动折叠）
  useEffect(() => {
    if (!searchQuery.trim()) return
    const keys = filtered.flatMap(s => s.exercises.map(ex => ex.__key))
    setExpandedKeys(prev => {
      const missing = keys.filter(k => !prev.includes(k))
      if (missing.length === 0) return prev
      return [...prev, ...missing]
    })
  }, [searchQuery])

  // 无障碍键盘导航：方向键在条目间移动焦点
  const handleGridKeyDown = (e, section) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const keys = section.exercises.map(ex => ex.__key)
    const activeEl = document.activeElement
    const currentIdx = activeEl && activeEl.id ? keys.findIndex(k => activeEl.id === `ex-toggle-${k}`) : -1
    if (currentIdx === -1) return
    e.preventDefault()
    const next = e.key === 'ArrowDown'
      ? (currentIdx + 1) % keys.length
      : (currentIdx - 1 + keys.length) % keys.length
    const target = document.getElementById(`ex-toggle-${keys[next]}`)
    if (target) target.focus()
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-brand-text-placeholder">
        <Tag size={48} className="mx-auto mb-4 opacity-40 text-brand-primary/30" />
        <p className="text-lg font-medium text-brand-text-secondary">没有匹配的动作</p>
        <p className="text-sm mt-1">试试其他关键词或清除筛选</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <FilterChips
        parts={parts}
        tags={tags}
        selectedParts={selectedParts}
        selectedTags={selectedTags}
        onTogglePart={onTogglePart}
        onToggleTag={onToggleTag}
        onClearFilters={onClearFilters}
      />

      {filtered.map((section) => {
        return (
          <div key={section.category}>
            {/* 分类标题 — 主色装饰条 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-1 rounded-full brand-gradient-bg" />
                <span className="text-[11px] sm:text-xs lg:text-sm text-brand-text-secondary uppercase tracking-wider font-semibold">
                  {section.megaSection}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-brand-text">
                {section.category}
              </h3>
              <div className="mt-2.5 h-[2px] w-full bg-gradient-to-r from-brand-primary/40 via-brand-accent/30 to-transparent rounded-full" />
            </div>

            {/* 卡片网格 — 方向键导航 */}
            <div
              className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5"
              onKeyDown={(e) => handleGridKeyDown(e, section)}
            >
              {section.exercises.map((exercise, i) => {
                const expanded = expandedKeys.includes(exercise.__key)
                return (
                  <ExerciseCard
                    key={exercise.__key}
                    exercise={exercise}
                    isExpanded={expanded}
                    onToggle={() => onToggleExpand(exercise.__key)}
                    index={i}
                    searchQuery={searchQuery}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
