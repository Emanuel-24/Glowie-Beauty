import { useNavigate } from 'react-router-dom'
import { editorialCategories, quizOptions } from '@/features/products/fixtures/categories.fixture'

export default function EditorialMakeup() {
  const navigate = useNavigate()

  const handleClick = (cat) => {
    navigate(`/descubrir?maquillaje=${encodeURIComponent(cat.name)}`)
  }

  return (
    <section id="maquillaje" className="py-16 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
              Curaduría de Maquillaje
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-glowe-dark">
              Makeup de las mejores marcas para ti 💄
            </h2>
          </div>
          <p className="text-sm text-glowe-muted max-w-md">
            Seleccionamos y distribuimos las mejores marcas de cosméticos con tonos versátiles, texturas ligeras y acabados diseñados para acompañar tu estilo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {editorialCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleClick(cat)}
              className={`cursor-pointer group glass-card rounded-2xl p-4 text-center border-t-4 ${cat.border} flex flex-col items-center`}
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-xs text-glowe-dark">{cat.name}</h3>
              <span className="text-[10px] text-glowe-muted mt-1">{cat.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
