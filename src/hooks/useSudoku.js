
import sudoku from "sudoku";
import { useState, useEffect } from "react";


const LEVEL_MAP = {
  easy: 0.0,
  medium: 0.05,
  hard: 0.65,
  expert: 0.75,
};


const OPEN_COUNT = {
  easy: 40,
  medium: 29,
  hard: 15,
  expert: 10,
};

export function useSudoku(level = "easy") {
  const [puzzle, setPuzzle] = useState(Array(81).fill(null));
  const [solution, setSolution] = useState(Array(81).fill(null));
  const [initial, setInitial] = useState(Array(81).fill(false));

  useEffect(() => {
    generate(level);
  }, [level]);

  function generate(levelKey = "easy") {
    const raw = sudoku.makepuzzle();
    const solved = sudoku.solvepuzzle(raw);

    if (!raw || !solved) {
      console.error("❌ Sudoku gagal dibuat.");
      return;
    }

    const basePuzzle = raw.map((v) => (v === null ? null : v + 1));
    const baseSolution = solved.map((v) => (v === null ? null : v + 1));


    let finalPuzzle = [...basePuzzle];


    const density = LEVEL_MAP[levelKey] ?? LEVEL_MAP.easy;

    for (let i = 0; i < 81; i++) {
      if (finalPuzzle[i] !== null && Math.random() < density) {
        finalPuzzle[i] = null;
      }
    }


    const targetOpen = OPEN_COUNT[levelKey] ?? 20;


    let openCount = finalPuzzle.filter((v) => v !== null).length;


    while (openCount < targetOpen) {
      const idx = Math.floor(Math.random() * 81);
      if (finalPuzzle[idx] === null) {
        finalPuzzle[idx] = baseSolution[idx];
        openCount++;
      }
    }


    while (openCount > targetOpen) {
      const idx = Math.floor(Math.random() * 81);
     
      if (finalPuzzle[idx] !== null) {
        finalPuzzle[idx] = null;
        openCount--;
      }
    }

    setPuzzle(finalPuzzle);
    setSolution(baseSolution);
    setInitial(finalPuzzle.map((v) => v !== null));
  }

  return {
    puzzle,
    solution,
    initial,
    generate,
  };
}
