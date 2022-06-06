import { useEffect, useRef } from "react"

export default function useInterval(f, delay, deps = []) {
  let fnRef = useRef(f)
  useEffect(() => {
    fnRef.current = f
  }, [f])

  useEffect(() => {
    if (delay == null) {
      return
    }
    let id = setInterval(fnRef.current, delay)
    return () => clearInterval(id)
  }, [delay, ...deps])
}
