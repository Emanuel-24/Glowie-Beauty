import { useEffect, useState } from 'react'

export function useScrollY(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

export function useCountdown(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  return { hours, minutes, seconds, secondsLeft, isExpired: secondsLeft <= 0 }
}

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
