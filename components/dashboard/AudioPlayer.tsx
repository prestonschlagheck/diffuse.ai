'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  onError?: () => void
  initialDuration?: number // Duration in seconds from database
}

export default function AudioPlayer({ src, onError, initialDuration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Update duration if initialDuration prop changes
  useEffect(() => {
    if (initialDuration && initialDuration > 0) {
      setDuration(initialDuration)
    }
  }, [initialDuration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setIsLoading(false)
      if (audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
      // Try to get duration if not set yet
      if (duration === 0 && audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
      onError?.()
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      if (audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    const handleSeeked = () => {
      // After seeking, check if duration is now available
      if (duration === 0 && audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('seeked', handleSeeked)

    // Try to force duration calculation for webm
    const tryGetDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
        setIsLoading(false)
      }
    }
    
    // Check after a short delay
    const timer = setTimeout(tryGetDuration, 500)

    return () => {
      clearTimeout(timer)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('seeked', handleSeeked)
    }
  }, [onError, isDragging, duration])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => {
        console.error('Play error:', err)
      })
    }
    setIsPlaying(!isPlaying)
  }

  // Calculate time based on click/drag position
  const getTimeFromPosition = useCallback((clientX: number): number | null => {
    const progressBar = progressRef.current
    if (!progressBar) return null
    
    // Use initialDuration as fallback if duration isn't detected
    const effectiveDuration = duration > 0 ? duration : (initialDuration || 0)
    if (effectiveDuration <= 0) return null

    const rect = progressBar.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percentage = x / rect.width
    return percentage * effectiveDuration
  }, [duration, initialDuration])

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const time = getTimeFromPosition(e.clientX)
    if (time !== null) {
      setIsDragging(true)
      setCurrentTime(time)
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX)
      if (time !== null) {
        setCurrentTime(time)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX)
      if (time !== null) {
        seekTo(time)
      }
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, getTimeFromPosition, seekTo])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const time = getTimeFromPosition(touch.clientX)
    if (time !== null) {
      setIsDragging(true)
      setCurrentTime(time)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const time = getTimeFromPosition(touch.clientX)
    if (time !== null) {
      setCurrentTime(time)
    }
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      seekTo(currentTime)
      setIsDragging(false)
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time) || time < 0) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Use effective duration for display and progress
  const effectiveDuration = duration > 0 ? duration : (initialDuration || 0)
  const progressPercentage = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0

  if (hasError) {
    return (
      <div className="p-4 bg-white/5 rounded-glass text-center">
        <p className="text-body-sm text-red-400">Failed to load audio</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-glass p-4 border border-white/10">
      <audio ref={audioRef} src={src} preload="auto" />
      
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading && effectiveDuration === 0}
          className="w-8 h-8 flex items-center justify-center text-cosmic-orange hover:text-rich-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading && effectiveDuration === 0 ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar - larger hit area for easier interaction */}
        <div className="flex-1 min-w-0 py-2 -my-2">
          <div
            ref={progressRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`h-2 bg-white/10 rounded-full cursor-pointer group relative select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cosmic-orange to-rich-orange rounded-full pointer-events-none"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
            {/* Progress Knob */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cosmic-orange rounded-full shadow-lg pointer-events-none transition-transform ${
                isDragging ? 'scale-125' : 'scale-100 opacity-0 group-hover:opacity-100'
              }`}
              style={{ 
                left: `calc(${Math.min(100, progressPercentage)}% - 8px)`,
                opacity: isDragging ? 1 : undefined
              }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="flex-shrink-0 tabular-nums">
          <span className="text-caption text-secondary-white font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-caption text-medium-gray mx-1">/</span>
          <span className="text-caption text-medium-gray">
            {effectiveDuration > 0 ? formatTime(effectiveDuration) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  )
}
