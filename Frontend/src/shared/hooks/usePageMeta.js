import { useEffect } from 'react'

const SITE_NAME = 'GLOWE BEAUTY'
const DEFAULT_TITLE = 'GLOWE BEAUTY — Maquillaje & Cabello | Belleza que te hace brillar'
const DEFAULT_DESCRIPTION =
  'Tienda online de maquillaje y cuidado capilar en Colombia. Descubre combos, ofertas y productos para que tu belleza brille.'
const DEFAULT_IMAGE = '/Logo.png'

const upsertMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

const upsertCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export function usePageMeta({ title, description, image, noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    const fullDescription = description || DEFAULT_DESCRIPTION
    const absoluteImage = new URL(image || DEFAULT_IMAGE, window.location.origin).href
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`

    document.title = fullTitle
    upsertMeta('name', 'description', fullDescription)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', fullDescription)
    upsertMeta('property', 'og:image', absoluteImage)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', fullDescription)
    upsertMeta('name', 'twitter:image', absoluteImage)
    upsertCanonical(canonicalUrl)
  }, [title, description, image, noindex])
}

export default usePageMeta
