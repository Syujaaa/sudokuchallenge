// useSudoku.js
import sudoku from "sudoku";
import { useState, useEffect } from "react";

// Density menentukan *chance dihapus*, tetap dipakai
const LEVEL_MAP = {
  easy: 0.0,
  medium: 0.15,
  hard: 0.65,
  expert: 0.75,
};

// Jumlah angka terbuka (clues) PASTI
const OPEN_COUNT = {
  easy: 40,
  medium: 20,
  hard: 6,
  expert: 3,
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

    // Copy awal puzzle
    let finalPuzzle = [...basePuzzle];

    // Hapus angka menggunakan density
    const density = LEVEL_MAP[levelKey] ?? LEVEL_MAP.easy;

    for (let i = 0; i < 81; i++) {
      if (finalPuzzle[i] !== null && Math.random() < density) {
        finalPuzzle[i] = null;
      }
    }

    // Pastikan angka terbuka tepat sesuai level
    const targetOpen = OPEN_COUNT[levelKey] ?? 20;

    // Hitung angka yang terbuka sekarang
    let openCount = finalPuzzle.filter((v) => v !== null).length;

    // Jika terlalu sedikit → tambahkan angka
    while (openCount < targetOpen) {
      const idx = Math.floor(Math.random() * 81);
      if (finalPuzzle[idx] === null) {
        finalPuzzle[idx] = baseSolution[idx];
        openCount++;
      }
    }

    // Jika terlalu banyak → hapus angka random
    while (openCount > targetOpen) {
      const idx = Math.floor(Math.random() * 81);
      // Jangan hapus kalau itu membuat cell override ke null yang bukan baseSolution
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
