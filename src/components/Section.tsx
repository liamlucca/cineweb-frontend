import { useRef } from "react"
import { Link } from "react-router-dom"
import type { CatalogItem } from "../types/index.ts"
import ContentCard from "./ContentCard.tsx"

interface SectionProps {
  title: string
  // movies and series; each card is labeled and linked by its kind
  items: CatalogItem[]
  // optional "See all" link, e.g. to the search filtered by this category
  seeAllTo?: string
}

// A horizontal carousel of cards. Phones scroll it with the finger; larger screens also get arrows.
function Section({ title, items, seeAllTo }: SectionProps) {
  // the scrolling row, so the arrows can move it
  const rowRef = useRef<HTMLDivElement>(null)

  // scrollBy: a browser function that moves the scroll of an element (here, most of a screen)
  function scroll(direction: 1 | -1) {
    const row = rowRef.current
    row?.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" })
  }

  if (items.length === 0) return null

  return (
    <section className="my-8" aria-label={title}>
      <div className="flex items-baseline justify-between gap-4 px-4 mb-3">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {seeAllTo && <Link to={seeAllTo} className="link link-hover text-sm opacity-80 shrink-0">See all</Link>}
      </div>

      <div className="relative group">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${title} left`}
          className="hidden md:flex btn btn-circle btn-sm absolute left-1 top-[35%] z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          ❮
        </button>

        {/* snap-x: the row stops at the start of a card when the finger lets go; scroll-px keeps the side margin */}
        <div ref={rowRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scroll-px-4 px-4 pb-2 [scrollbar-width:none]">
          {items.map((item) => (
            // a movie and a series can share the same id, so the key needs the kind too
            <div key={`${item.kind}-${item.id}`} className="snap-start shrink-0 w-56 sm:w-60 md:w-64">
              <ContentCard item={item} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${title} right`}
          className="hidden md:flex btn btn-circle btn-sm absolute right-1 top-[35%] z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          ❯
        </button>
      </div>
    </section>
  )
}
export default Section
