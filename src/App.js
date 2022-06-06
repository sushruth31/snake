import { useEffect, useState } from "react"
import useInterval from "./useinterval"

const GRID_SIZE = 16

function App() {
  //after each render head becomes next and everything else shifts in current direction.
  let moveRight = (r, c) => [r, c + 1]
  let moveLeft = (r, c) => [r, c - 1]
  let moveDown = (r, c) => [r + 1, c]
  let moveUp = (r, c) => [r - 1, c]

  let [dirQueue, setDirQueue] = useState(() => [moveRight])
  let [snake, setSnake] = useState([
    [4, 4],
    [5, 4],
    [5, 5],
  ])

  function renderSnake(rowI, colI) {
    return snake
      .filter(([row]) => row === rowI)
      .find(([_, col]) => colI === col)
  }

  console.log(dirQueue)

  function stepSnake() {
    let direction
    if (!dirQueue.length) {
      direction = moveRight
    } else {
      direction = dirQueue[0]
    }

    let snakeCopy = [...snake]
    snakeCopy.shift()
    //create new head
    let prevHead = snake[snake.length - 1]
    //change direction if snake head is on borders
    if (prevHead[1] === GRID_SIZE - 1) {
      return setDirQueue([moveDown])
    }
    let newHead = direction(...prevHead)
    snakeCopy.push(newHead)
    setSnake(snakeCopy)
  }

  //useInterval(stepSnake, 200, [snake, dirQueue])

  return (
    <div className="p-3">
      <div className="w-full flex item-center justify-center mb-10">
        <div className="font-bold">Snake Game</div>
      </div>

      <div className="flex w-full items-center flex-col justify-center">
        {Array.from(Array(GRID_SIZE)).map((_, rowI) => (
          <div key={rowI} className="flex w-[80%] h-10 ">
            {Array.from(Array(GRID_SIZE)).map((_, colI) => (
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
  )
}

export default App
