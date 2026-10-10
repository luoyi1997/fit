import { SlidersHorizontal, X } from 'lucide-react'

function chipClass(active) {
  return `
    inline-flex items-center min-h-[36px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium
    border transition-colors duration-200
    ${active
      ? 'bg-brand-accent text-white border-brand-accent shadow-sm'
      : 'bg-brand-card text-brand-text-secondary border-brand-border hover:border-brand-accent/50 hover:text-brand-accent'}
  `
}

/**
 * 筛选 chips：按部位 / 标签筛选动作，选中态高亮，支持一键清除。
 */
export default function FilterChips({
  parts, tags, selectedParts, selectedTags,
  onTogglePart, onToggleTag, onClearFilters,
}) {
  const hasActive = selectedParts.length > 0 || selectedTags.length > 0
  if (parts.length === 0 && tags.length === 0) return null

  return (
    <div className="mb-5 sm:mb-6" aria-label="筛选条件">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal size={14} className="text-brand-text-secondary" />
        <span className="text-xs font-semibold text-brand-text-secondary">筛选</span>
      </div>

      {parts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {parts.map(part => {
            const active = selectedParts.includes(part)
            return (
              <button
                key={part}
                type="button"
                onClick={() => onTogglePart(part)}
                aria-pressed={active}
                className={chipClass(active)}
              >
                {part}
              </button>
            )
          })}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                className={chipClass(active)}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      {hasActive && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 inline-flex items-center gap-1 min-h-[36px] px-3 rounded-full text-xs font-medium text-brand-danger hover:bg-brand-danger-soft border border-brand-danger/30 transition-colors"
        >
          <X size={14} />
          清除筛选
        </button>
      )}
    </div>
  )
}
