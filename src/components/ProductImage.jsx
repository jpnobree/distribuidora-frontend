import { useState } from 'react'
import { colorFromString, initials } from '../utils/format'

export default function ProductImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  if (showPlaceholder) {
    const bg = colorFromString(name)
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: `${bg}1a` }}
        aria-label={name}
      >
        <span
          className="font-display text-3xl font-semibold tracking-wide"
          style={{ color: bg }}
        >
          {initials(name)}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-bg ${className}`}>
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
