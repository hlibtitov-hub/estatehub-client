'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const MIN_PRICE = 0
const MAX_PRICE = 10000

export default function PriceRangeSlider({ minVal, maxVal, onChange }) {
  const rangeRef = useRef(null)

  // Percent helpers for fill track
  const minPercent = Math.round(((minVal - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100)
  const maxPercent = Math.round(((maxVal - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100)

  const formatPrice = (v) =>
    v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">Price range</span>
        <span className="text-xs font-semibold text-gray-800">
          {formatPrice(minVal)} — {maxVal >= MAX_PRICE ? `$${MAX_PRICE.toLocaleString()}+` : formatPrice(maxVal)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-5 flex items-center" ref={rangeRef}>
        {/* Background track */}
        <div className="absolute w-full h-1.5 rounded-full bg-gray-200" />

        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full bg-blue-500"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Min input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={100}
          value={minVal}
          aria-label="Minimum price"
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - 100)
            onChange(val, maxVal)
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: minVal > MAX_PRICE - 100 ? 5 : 3 }}
        />

        {/* Max input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={100}
          value={maxVal}
          aria-label="Maximum price"
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + 100)
            onChange(minVal, val)
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-300">{formatPrice(MIN_PRICE)}</span>
        <span className="text-xs text-gray-300">{formatPrice(MAX_PRICE)}+</span>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          transition: box-shadow 0.15s, transform 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover,
        input[type='range']::-webkit-slider-thumb:active {
          box-shadow: 0 0 0 6px rgba(59,130,246,0.15);
          transform: scale(1.1);
        }
        input[type='range']::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  )
}
