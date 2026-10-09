import { Link } from "react-router-dom"
import type { CatalogItem } from "../types/index.ts"

interface SectionProps {
  title: string
  // movies and series; each card is labeled and linked by its kind
  items: CatalogItem[]
}

// where "See more" goes for each kind of item
function linkTo(item: CatalogItem): string {
  return item.kind === 'series' ? `/series/${item.id}/seasons` : `/watch/${item.id}`
}

function Section({ title, items }: SectionProps) {

  function scrollLeft(e: React.MouseEvent<HTMLButtonElement>) {
    const carousel = e.currentTarget.parentElement?.querySelector('.carousel')
    carousel?.scrollBy({ left: -300, behavior: 'smooth' })
  }

  function scrollRight(e: React.MouseEvent<HTMLButtonElement>) {
    const carousel = e.currentTarget.parentElement?.querySelector('.carousel')
    carousel?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  /*
  -------------------------------------
  Explanation of scroll right/left:
  1.
   <div className="relative group">      parentElement (this is where we do the querySelector)
    ├── right button                     currentTarget (the clicked button)
    ├── carousel
    └── left button
  </div>

  2.
  querySelector('.carousel')
  A function that looks inside the element for a child that has that class (in this case carousel1)

  3.
  scrollBy
  A browser function that moves the scroll of an element
 -------------------------------------
  */

  return (
    <div className="my-6">
      <h2 className="color-primary text-xl font-bold mb-3 px-4">{title}</h2>

      <div className="flex group">

        {/* Left arrow */}
        <button
          onClick={scrollLeft}
          className="self-center left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ❮
        </button>

        {/* each movie or series */}
        <div className="carousel carousel-center gap-4 px-4 w-full justify-items-start">  {/*THIS IS WHERE THE JUSTIFY/CENTERING HAPPENS*/}
          {items.map((item) => (
              // a movie and a series can share the same id, so the key needs the kind too
              <div key={`${item.kind}-${item.id}`} className="carousel-item">
              <div className="card bg-base-200 w-60 sm:w-44 md:w-48">  {/*THIS IS THE CARD SIZE FOR EACH BREAKPOINT*/}
                <figure className="bg-base-300 h-24 sm:h-28">
                </figure>
                <div className="card-body p-3">
                  <span className={`badge badge-sm ${item.kind === 'series' ? 'badge-secondary' : 'badge-primary'}`}>
                    {item.kind === 'series' ? 'Series' : 'Movie'}
                  </span>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.category}</p>
                  <Link to={linkTo(item)} className="btn btn-primary btn-sm mt-1">See more</Link>
                  </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={scrollRight}
          className="self-center right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ❯
        </button>

      </div>
    </div>
  )
}
export default Section

/*
[NOTE]: Hide the left arrow when at the start of the page. Hide the right arrow when at the end of the page.
*/
