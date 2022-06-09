import { memo, useEffect, useRef, useState } from "react"

export default function useAudio(url, timeout) {
  let [audio] = useState(new Audio(url))
  let [playing, setPlaying] = useState(false)
  let id = useRef(null)

  let toggle = val => setPlaying(p => (typeof val === "boolean" ? val : !p))
  let play = () => {
    audio.currentTime = 0
    audio.play()
    if (timeout) {
      id = setTimeout(() => playing && audio.pause(), timeout)
    }
  }

  useEffect(() => {
    playing ? play() : audio.pause()
    return () => clearTimeout(id)
  }, [playing])

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false))
    return () => audio.removeEventListener("ended", () => setPlaying(false))
  }, [])

  return [playing, toggle]
}
