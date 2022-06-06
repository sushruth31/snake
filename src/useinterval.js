import { useEffect, useRef } from "react"

export default function useInterval(f, delay, deps = []) {
  let fnRef = useRef(f)
  let id = useRef(null)
  useEffect(() => {
    fnRef.current = f
  }, [f])

  useEffect(() => {
    if (delay == null) {
      return
    }
    id.current = setInterval(fnRef.current, delay)
    return () => clearInterval(id.current)
  }, [delay, ...deps])
}
