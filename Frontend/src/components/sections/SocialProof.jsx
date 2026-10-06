import { socialPosts } from '../../data/products'
import NewsletterForm from '../ui/NewsletterForm'
import Card from '../ui/Card'

export default function SocialProof() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
            Comunidad Glowe
          </span>
          <h2 className="font-serif text-3xl font-bold text-glowe-dark">Tu Glowe también vive aquí 📸</h2>
          <p className="text-xs sm:text-sm text-glowe-muted mt-1">
            Etiquétanos en Instagram{' '}
            <span className="font-bold text-glowe-dark">@GloweBeautyCO</span> para aparecer en nuestro feed.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {socialPosts.map((post) => (
            <div key={post.user} className="aspect-square rounded-2xl overflow-hidden glass-panel relative group">
              <img
                src={post.image}
                alt={`Look ${post.user}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 bg-glowe-dark/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold`}
              >
                {post.user}
              </div>
            </div>
          ))}
        </div>

        <Card radius="3xl" className="p-8 sm:p-12 border-glowe-pink text-center max-w-3xl mx-auto bg-gradient-to-tr from-white/90 via-glowe-pink/30 to-white/90 shadow-xl hover:translate-y-0">
          <span className="text-3xl mb-2 inline-block">✨</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-glowe-dark">Únete al Glow</h3>
          <p className="text-xs sm:text-sm text-glowe-muted mt-2 max-w-md mx-auto">
            Recibe novedades, tutoriales de belleza y ofertas exclusivas directamente en tu correo.
          </p>
          <NewsletterForm stack className="mt-6 max-w-md mx-auto" />
        </Card>
      </div>
    </section>
  )
}
