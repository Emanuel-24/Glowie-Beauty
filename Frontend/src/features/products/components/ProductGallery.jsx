import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'

export default function ProductGallery({
  product,
  galleryImages = [],
  selectedImage = 0,
  onSelectImage,
}) {
  return (
    <div className="relative">
      <Card radius="3xl" className="overflow-hidden p-0 lg:sticky lg:top-28">
        <div className="relative">
          <img
            src={galleryImages[selectedImage] || product?.image}
            alt={product?.name}
            className="w-full aspect-square object-cover"
          />
          {product?.badge && (
            <Badge tone="pink" className="absolute top-4 left-4">
              {product.badge}
            </Badge>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 p-2 sm:p-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${product?.id}-thumb-${index}`}
                type="button"
                onClick={() => onSelectImage?.(index)}
                className={`overflow-hidden rounded-xl border transition-all ${
                  selectedImage === index ? 'border-glowe-pink-accent ring-2 ring-glowe-pink-soft' : 'border-white/80'
                }`}
                aria-label={`Ver imagen ${index + 1} de ${product?.name}`}
              >
                <img
                  src={image}
                  alt={`${product?.name} vista ${index + 1}`}
                  className="h-14 w-full object-cover sm:h-16"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
