import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {Repeat} from "typescript-tuple"
import clsx from 'clsx';

type SquareState = 'O' | 'X' | null

type SquareProps = {
  value: SquareState
  onClick: () => void
  isWinCell: boolean
}

type BoardState = Repeat<SquareState, 9>

type BoardProps = {
  squares:  BoardState
  onClick: (i: number) => void
  winLine: number[]
}

type Step = {
  squares: BoardState
  xIsNext: boolean
  col: number | null
  row: number | null
}

type GameState = {
  readonly history: Step[]
  readonly stepNumber: number
  isAsc: boolean

}

const Square = (props :SquareProps) => {
  return (
    <button className={clsx("square", props.isWinCell && "highlight")} onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
};

const Board = (props: BoardProps) => {
  const renderSquare = (i: number, isWinCell: boolean) => {
    return <Square key={i} value={props.squares[i]} onClick={() => props.onClick(i)} isWinCell={isWinCell}/>;
  };

  return (
    <div>
      {
        Array(3).fill(0).map((row, i) => {
          return (
            <div className="board-row" key={i}>
              {
                Array(3).fill(0).map((col,j) => {
                  return renderSquare(i*3 + j, props.winLine.indexOf((i * 3) + j) !== -1)
                })
              }
              </div>
          )
        })
      }
    </div>
  );
};

const Game = () => {
  const [state, setState] = useState<GameState>({
    history: [
      {
      squares: [null,null,null,null,null,null,null,null,null],
      xIsNext: true,
      row: null,
      col: null,
    }
  ],
    stepNumber: 0,
    isAsc: true
  })

  const current = state.history[state.stepNumber]
  const winInfo = calculateWinner(current.squares);

  // ゲームの状態
  let status: string;
  if(winInfo) {
    if (winInfo.isDraw) {
      status = "Draw"
    } else {
      status = "Winner" + winInfo.winner;
    }
    } else {
      status = "Next Player: " + (current.xIsNext ? "X" : "O");
    }

  // ユーザーが手を打った時の処理
  const handleClick = (i: number) => {
    if(winInfo) {
      return
    } else if (current.squares[i]) {
      return
    }
    
    const next: Step = (({ squares, xIsNext}) => {
      const nextSquares = squares.slice() as BoardState
      nextSquares[i] = xIsNext ? 'X' : 'O'
      return {
        squares: nextSquares,
        xIsNext: !xIsNext,
        col: (i % 3) + 1,
        row: Math.floor(i / 3) + 1,
      }
    })(current)

    setState(({history, stepNumber, isAsc}) => {
      const newHistory = history.slice(0, stepNumber + 1).concat(next)

      return {
        history: newHistory,
        stepNumber: newHistory.length - 1,
        isAsc: isAsc
      }
    })

  };

  // 履歴に飛ぶ
  const jumpTo = (step: number) => {
    setState(prev => ({
      ...prev,
      stepNumber: step
    }))
  };


  // 昇順⇄降順を切り替える
  const toggleAsc = () => {
    setState(prev => ({
      ...prev,
      isAsc: !prev.isAsc,
    }))
  }

  // 履歴に飛ぶためのボタンを描画する
  const moves = state.history.map((step, move) => {
    const desc = move ? "Go to move #" + move + " (" + step.col +", " + step.row + ")": "Go to game start";
    return (
      <li key={move}>
        <button className={clsx({bold: state.stepNumber === move})} onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={current.squares} onClick={(i) => handleClick(i)} winLine={winInfo ? winInfo.line : []}/>
      </div>
      <div className="game-info">
        <div>{status}</div>
        <div><button onClick={() => toggleAsc()}>ASC⇔DESC</button></div>
        <ol>{state.isAsc ? moves : moves.reverse()}</ol>
      </div>
    </div>
  );
};

function calculateWinner(squares: SquareState[]): {
  line: number[]
  winner: SquareState
  isDraw: boolean
} | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      console.log("勝ち！")
      return {
        line: [a, b, c],
        winner: squares[a],
        isDraw: false
      }
    } 
  }

  if(squares.filter((squareState) => squareState === null).length === 0) {
    console.log("引き分け！")
    return {
      line: [],
      winner: null,
      isDraw: true
    }
  }
  
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
