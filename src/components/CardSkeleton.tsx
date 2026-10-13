interface CardSkeletonProps {
  // how many placeholder cards
  count: number
  // "row": one scrolling row (carousels); "grid": wraps like the search results
  layout?: 'row' | 'grid'
}

// Grey placeholder cards shown while the catalog loads, with the shape of the real ones
function CardSkeleton({ count, layout = 'row' }: CardSkeletonProps) {
  const cards = Array.from({ length: count }, (_, index) => (
    <div key={index} className={layout === 'row' ? 'w-56 sm:w-60 md:w-64 shrink-0' : ''}>
      <div className="skeleton aspect-video w-full rounded-box" />
      <div className="skeleton h-4 w-3/4 mt-3" />
      <div className="skeleton h-3 w-1/3 mt-2" />
    </div>
  ));

  return (
    <div
      aria-label="Loading"
      role="status"
      className={layout === 'row'
        ? 'flex gap-4 overflow-hidden px-4'
        : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4'}
    >
      {cards}
    </div>
  );
}

export default CardSkeleton;
