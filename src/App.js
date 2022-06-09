import { useCallback, useEffect, useRef, useState } from "react"
import useEventListener from "./useEventListener"
import useInterval from "./useinterval"
import useAudio from "./useaudio"

const NUM_ROWS = 15
const NUM_COLS = 15

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
  let [__, toggle] = useAudio(
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    1000
  )
  let [_, keyboardSoundToggle] = useAudio(
    "https://assets.mixkit.co/sfx/download/mixkit-little-cute-kiss-2192.wav"
  )
  let [gameOver, setGameOver] = useState(false)
  let [dirQueue, setDirQueue] = useState([])
  let prevDir = useRef(dirQueue[0])
  let [snake, setSnake] = useState(() => createSnake(0))

  let isFood = (r, c) => food[0] === r && food[1] === c

  function createSnake(n) {
    let a = []
    let point = randomPoint()
    a.push(point)
    for (let i = 0; i < n; ++i) {
      let [r, c] = point
      point = [r, c + 1]
      if (!pointIsValid(...point, () => false)) {
        console.log(point, "point is invalid")
        return a
      }
      a.push(point)
    }
    return a
  }

  function randomPoint() {
    let r = Math.floor(Math.random() * NUM_ROWS)
    let c = Math.floor(Math.random() * NUM_COLS)
    return [r, c]
  }

  function createFood() {
    let [r, c] = randomPoint()
    if (isInSnake(r, c)) {
      return createFood()
    }
    return [r, c]
  }

  let [food, setFood] = useState(createFood)

  function pointIsValid(r, c, checkSnake = isInSnake) {
    return (
      r >= 0 && r <= NUM_ROWS && c >= 0 && c <= NUM_COLS && !checkSnake(r, c)
    )
  }

  function growSnake() {
    let newTail,
      snakeCopy = [...snake],
      [r, c] = snakeCopy[0]

    if (snakeCopy.length < 2) {
      switch (prevDir.current) {
        case moveRight:
          newTail = [r, c - 1]
        case moveLeft:
          newTail = [r, c + 1]
        case moveDown:
          newTail = [r - 1, c]
        case moveUp:
          newTail = [r + 1, c]
      }
    } else {
      let [[r1, c1], [r2, c2]] = snakeCopy.slice(0, 2)
      if (r1 === r2) {
        //same row
        if (c1 < c2) {
          //add to left
          newTail = [r, c - 1]
        } else {
          newTail = [r, c + 1]
        }
      } else if (c1 === c2) {
        //same col
        if (r1 < r2) {
          //add top
          newTail = [r + 1, c]
        } else {
          newTail = [r - 1, c]
        }
      }
    }
    setFood(createFood())
    if (pointIsValid(...newTail)) {
      //point is valid so update the snake
      snakeCopy.unshift(newTail)
      setSnake(snakeCopy)
      setDelay(p => p - 25)
    }
  }

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
    if (!pointIsValid(r, c) || isInSnake(r, c)) {
      stopGame(Outcomes.lose)
    }

    if (isFood(r, c)) {
      growSnake()
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

  useEffect(() => {
    keyboardSoundToggle()
  }, [dirQueue])

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
                      : isFood(rowI, colI)
                      ? "h-full border bg-purple-600 border-zinc-400 w-20"
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
