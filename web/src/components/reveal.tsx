import { useEffect, useRef } from 'react'

type RevealProps = {
  children: React.ReactNode
  className?: string
}

export default function Reveal({
  children,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      element.classList.add('in', 'is-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('in', 'is-visible')
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 60px 0px',
      },
    )

    observer.observe(element)

    // Fallback timer to guarantee visibility even if off-screen or instant scroll
    const fallbackTimer = setTimeout(() => {
      if (element && !element.classList.contains('in')) {
        element.classList.add('in', 'is-visible')
      }
    }, 400)

    return () => {
      clearTimeout(fallbackTimer)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}