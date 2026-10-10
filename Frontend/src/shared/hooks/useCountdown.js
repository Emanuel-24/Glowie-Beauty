import { useEffect, useState } from 'react'

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

export default useCountdown
