import { useState, useEffect } from 'react'

export default function TypingText({ text, speed = 40, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  
  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      return
    }
    
    // Split into words for a smoother "word-by-word" ChatGPT feel
    const words = text.split(' ')
    let index = 0
    setDisplayedText('')
    
    const interval = setInterval(() => {
      if (index < words.length) {
        const nextWord = words[index]
        if (nextWord !== undefined) {
          setDisplayedText((prev) => prev + (prev ? ' ' : '') + nextWord)
        }
        index++
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, speed)
    
    return () => clearInterval(interval)
  }, [text, speed, onComplete])
  
  return (
    <span>
      {displayedText}
      {displayedText.length < (text?.length || 0) && (
        <span className="inline-block w-2 h-5 ml-1 align-middle animate-pulse" style={{ backgroundColor: 'var(--accent, #1dbfb0)' }} />
      )}
    </span>
  )
}
