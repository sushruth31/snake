import { useEffect, useState } from "react"
import useInterval from "./useinterval"

const NUM_ROWS = 16
const NUM_COLS = 16

const Directions = {
  LEFT: "left",
  RIGHT: "right",
  DOWN: "down",
  UP: "up",
}

function App() {
  //after each render head becomes next and everything else shifts in current direction.
  let [direction, setDirection] = useState(Directions.RIGHT)
  let [snake, setSnake] = useState([
    [5, 12],
    [5, 13],
    [5, 14],
  ])

  function renderSnake(rowI, colI) {
    return snake
      .filter(([row]) => row === rowI)
      .find(([_, col]) => colI === col)
  }

  function moveRight() {
    let changeDirection,
      newSnake = []
    for (let i = 0; i < snake.length; i++) {
      let [r, c] = snake[i]
      if (c === NUM_COLS - 1) {
        changeDirection = Directions.DOWN
        newSnake.push([r + 1, c])
      } else {
        newSnake.push([r, c + 1])
      }
    }
    if (changeDirection) {
      setDirection(changeDirection)
    }
    setSnake(newSnake)
  }

  function moveLeft() {
    setSnake(p => p.map(([row, col]) => [row, col - 1]))
  }

  function moveDown() {
    let changeDirection,
      newSnake = []
    for (let i = 0; i < snake.length; i++) {
      let [r, c] = snake[i]
      if (c !== NUM_COLS - 1) {
        changeDirection = Directions.DOWN
        newSnake.push([r, c + 1])
      } else {
        newSnake.push([r + 1, c])
      }
    }
    if (changeDirection) {
      setDirection(changeDirection)
    }
    setSnake(newSnake)
  }

  function moveUp() {
    setSnake(p => p.map(([row, col]) => [row - 1, col]))
  }

  function growSnake() {
    setSnake(p => {
      let snakeCopy = [...p]
      let [firstRow, firstCol] = snakeCopy[0]
      let newEl =
        direction === Directions.DOWN || direction === Directions.UP
          ? [firstRow - 1, firstCol]
          : [firstRow, firstCol - 1]
      snakeCopy.unshift(newEl)
      return snakeCopy
    })
  }

  function moveSnake() {
    switch (direction) {
      case Directions.RIGHT:
        return moveRight()
      case Directions.DOWN:
        return moveDown()
    }
  }

  useInterval(moveSnake, 500, [snake, direction])

  return (
    <div className="p-3">
      <div className="w-full flex item-center justify-center mb-10">
        <div className="font-bold">Snake Game</div>
        <div>{direction}</div>
      </div>

      <div className="flex w-full items-center flex-col justify-center">
        {Array.from(Array(NUM_ROWS)).map((_, rowI) => (
          <div key={rowI} className="flex w-[80%] h-10 ">
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
  )
}

export default App
