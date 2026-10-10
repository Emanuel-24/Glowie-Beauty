export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null

  const selectedPages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  const pages = [...selectedPages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .reduce((items, page, index, source) => {
      if (index > 0 && page - source[index - 1] > 1) items.push(`ellipsis-${source[index - 1]}`)
      items.push(page)
      return items
    }, [])

  return (
    <div className="hide-scrollbar mt-4 flex max-w-full justify-center overflow-x-auto sm:justify-end">
      <div className="inline-flex min-w-max items-center gap-1 rounded-full border border-white/80 bg-white/75 px-2 py-1.5 shadow-sm sm:gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-glowe-muted transition hover:bg-pink-50 hover:text-glowe-dark disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Ir a la página anterior"
        >
          ←
        </button>
        {pages.map((pageNumber) =>
          typeof pageNumber === 'string' ? (
            <span key={pageNumber} className="flex h-10 w-6 items-center justify-center text-xs font-bold text-glowe-muted" aria-hidden="true">…</span>
          ) : (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange?.(pageNumber)}
            className={[
              'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition',
              pageNumber === currentPage ? 'bg-glowe-dark text-white' : 'text-glowe-muted hover:bg-pink-50 hover:text-glowe-dark',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`Ir a la página ${pageNumber}`}
          >
            {String(pageNumber).padStart(2, '0')}
          </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-glowe-muted transition hover:bg-pink-50 hover:text-glowe-dark disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Ir a la página siguiente"
        >
          →
        </button>
      </div>
    </div>
  )
}
