import { useCallback, useEffect, useRef, useState } from "react"
import useEventListener from "./useEventListener"
import useInterval from "./useinterval"
import useAudio from "./useaudio"
import { isValidDateValue } from "@testing-library/user-event/dist/utils"

const NUM_ROWS = 16
const NUM_COLS = 16

const Outcomes = {
  win: "win",
  lose: "lose",
}

let capFirstCase = str => str[0].toUpperCase() + str.slice(1).toLowerCase()

export default function App() {
  //after each render head becomes next and everything else shifts in current direction.
  //memoize these to use the fn reference
  let moveRight = useCallback((r, c) => [r, c + 1], [])
  let moveLeft = useCallback((r, c) => [r, c - 1], [])
  let moveDown = useCallback((r, c) => [r + 1, c], [])
  let moveUp = useCallback((r, c) => [r - 1, c], [])
  let [delay, setDelay] = useState(200)
  let [playing, toggle] = useAudio(
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    1000
  )
  let [gameOver, setGameOver] = useState(false)
  let [dirQueue, setDirQueue] = useState([])
  let prevDir = useRef(dirQueue[0])
  let [snake, setSnake] = useState([
    [5, 3],
    [5, 4],
    [5, 5],
  ])

  let gameStarted = !!(prevDir.current || dirQueue.length)

  let keyMap = {
    arrowdown: moveDown,
    arrowright: moveRight,
    arrowleft: moveLeft,
    arrowup: moveUp,
  }

  useInterval(stepSnake, delay, [snake, dirQueue])

  function stopGame(outcome) {
    setDelay(null)
    setGameOver({ outcome })
    toggle()
  }

  function isInSnake(r, c) {
    //filter out current head
    let snakeMap = new Map(snake.slice(0, snake.length - 1))
    return snakeMap.get(r) === c
  }

  useEffect(() => {
    //snake should not touch edges or itself
    let [r, c] = snake[snake.length - 1]
    if (
      c === NUM_COLS - 1 ||
      r === 0 ||
      r === NUM_ROWS - 1 ||
      c === 0 ||
      isInSnake(r, c)
    ) {
      stopGame(Outcomes.lose)
    }
  }, [snake])

  useEventListener(
    "keydown",
    gameOver?.outcome
      ? () => {}
      : e => {
          e.preventDefault()
          let key = e.key.toLowerCase()
          let dir = keyMap[key]
          if (
            key !== "arrowdown" &&
            key !== "arrowright" &&
            key !== "arrowleft" &&
            key !== "arrowup"
          ) {
            return
          }
          if (prevDir.current === dir || !isValidDirection(dir)) return
          setDirQueue(p => [dir, ...p])
        }
  )

  function isValidDirection(attempt) {
    let curDir = prevDir.current

    if (attempt === moveLeft && curDir === moveRight) {
      return false
    }
    if (attempt === moveRight && curDir === moveLeft) {
      return false
    }
    if (attempt === moveUp && curDir === moveDown) {
      return false
    }
    if (attempt === moveDown && curDir === moveUp) {
      return false
    }
    return true
  }

  useEffect(() => {
    if (dirQueue.length) {
      prevDir.current = dirQueue[0]
    }
  })

  function renderSnake(rowI, colI) {
    return snake
      .filter(([row]) => row === rowI)
      .find(([_, col]) => colI === col)
  }

  function getNewDirection() {
    let direction
    if (!dirQueue.length) {
      direction = prevDir.current
    } else {
      //remove first dir from queue. check if its a valid direction if not try again
      let attempt = dirQueue[0]
      direction = attempt
      setDirQueue(p => p.slice(1))
    }
    return direction
  }

  function stepSnake() {
    if (!gameStarted) return
    let snakeCopy = [...snake]
    let direction = getNewDirection()

    snakeCopy.shift()
    //create new head
    let prevHead = snake[snake.length - 1]
    let newHead = direction(...prevHead)
    snakeCopy.push(newHead)
    setSnake(snakeCopy)
  }

  let gridClassName =
    gameOver?.outcome === "win"
      ? "flex items-center flex-col justify-center border-2 border-green-500"
      : gameOver?.outcome
      ? "flex items-center flex-col justify-center border-2 border-red-500"
      : "flex items-center flex-col justify-center p-4 "

  return (
    <>
      {!gameStarted && (
        <div className="fixed w-screen h-screen flex items-center justify-center bg-[#000000c4]">
          <div className="text-white font-bold text-xl">
            Press any arrow key to start
          </div>
        </div>
      )}
      <div className="py-5 px-32">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="font-bold">Snake Game</div>
          <div>Score: {snake.length}</div>
          {gameOver?.outcome && (
            <>
              <div>Game over! You {capFirstCase(gameOver.outcome)} </div>
              <button>Play again</button>
            </>
          )}
        </div>

        <div className={gridClassName}>
          {Array.from(Array(NUM_ROWS)).map((_, rowI) => (
            <div key={rowI} className="flex h-10 w-full">
              {Array.from(Array(NUM_COLS)).map((_, colI) => (
                <div
                  key={colI}
                  className={
                    renderSnake(rowI, colI)
                      ? "h-full border bg-black border-zinc-400 w-20"
                      : "h-full border border-zinc-400 w-20 "
                  }
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
