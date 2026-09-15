import { useState } from 'react'
import { colorFromString, initials } from '../utils/format'

export default function ProductImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  if (showPlaceholder) {
    const bg = colorFromString(name) // "R G B" - ver comentário em utils/format.js
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: `rgb(${bg} / 0.1)` }}
        aria-hidden="true"
      >
        <span
          className="font-display text-3xl font-semibold tracking-wide"
          style={{ color: `rgb(${bg})` }}
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
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
