import React from "react";

export default function SudokuBoard({
  puzzle = Array(81).fill(null),
  initial = Array(81).fill(false),
  selectedIndex = null,
  onSelect = () => {},
  notes = {},
  checkConflict, // optional
  filledCells = new Set(), // optional
}) {
  function localCheckConflict(index, val) {
    if (val === null) return false;
    const row = Math.floor(index / 9);
    const col = index % 9;
    const subgrid = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    for (let j = 0; j < 81; j++) {
      if (j === index) continue;
      const other = puzzle[j];
      if (other === null) continue;
      if (other !== val) continue;

      const r2 = Math.floor(j / 9);
      const c2 = j % 9;
      const s2 = Math.floor(r2 / 3) * 3 + Math.floor(c2 / 3);

      if (r2 === row || c2 === col || s2 === subgrid) return true;
    }
    return false;
  }

  const selectedValue =
    selectedIndex !== null && puzzle[selectedIndex] !== undefined
      ? puzzle[selectedIndex]
      : null;

  return (
    <div className="flex justify-center w-full">
      <div
        className="grid grid-cols-9 border-3 sm:border-4 border-indigo-800 rounded-xl overflow-hidden shadow-2xl w-full sm:w-auto bg-white"
        style={{ maxWidth: "90vw" }}
      >
        {puzzle.map((val, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;

          const selectedRow =
            selectedIndex !== null ? Math.floor(selectedIndex / 9) : null;
          const selectedCol = selectedIndex !== null ? selectedIndex % 9 : null;

          const subgrid = Math.floor(row / 3) * 3 + Math.floor(col / 3);
          const selectedSubgrid =
            selectedIndex !== null
              ? Math.floor(selectedRow / 3) * 3 + Math.floor(selectedCol / 3)
              : null;

          const isSelected = i === selectedIndex;
          const sameRow = selectedIndex !== null && row === selectedRow;
          const sameCol = selectedIndex !== null && col === selectedCol;
          const sameSubgrid =
            selectedIndex !== null && subgrid === selectedSubgrid;

          const isSameNumber =
            selectedValue !== null &&
            val !== null &&
            val === selectedValue &&
            i !== selectedIndex;

          const isError =
            (typeof checkConflict === "function"
              ? checkConflict(i, val)
              : localCheckConflict(i, val)) || false;

          const isFilledDuringSurrender = filledCells.has(i);

          const thickTop =
            row % 3 === 0
              ? "border-t-3 sm:border-t-4 border-t-indigo-800"
              : "border-t border-t-indigo-400";
          const thickLeft =
            col % 3 === 0
              ? "border-l-3 sm:border-l-4 border-l-indigo-800"
              : "border-l border-l-indigo-400";
          const thickRight =
            col === 8
              ? "border-r-3 sm:border-r-4 border-r-indigo-800"
              : "border-r border-r-indigo-400";
          const thickBottom =
            row === 8
              ? "border-b-3 sm:border-b-4 border-b-indigo-800"
              : "border-b border-b-indigo-400";
          const bgClass = isError
            ? "!bg-red-400 text-white font-bold"
            : isFilledDuringSurrender
            ? "!bg-blue-500 text-white font-bold"
            : isSelected
            ? "!bg-blue-300"
            : isSameNumber
            ? "!bg-yellow-200 font-bold"
            : sameRow || sameCol || sameSubgrid
            ? "!bg-blue-100"
            : "";

          return (
            <div
              key={i}
              onClick={() => onSelect(i)}
              className={`
              w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center cursor-pointer select-none
              border-indigo-700/40 text-base sm:text-lg font-bold transition hover:bg-indigo-50
              ${thickTop} ${thickLeft} ${thickRight} ${thickBottom}
              ${
                initial[i]
                  ? "bg-indigo-100 font-black text-indigo-900"
                  : "bg-white"
              }
              ${bgClass}
            `}
            >
              {val === null && notes[i] && notes[i].length > 0 ? (
                <div
                  className="grid grid-cols-3 w-full h-full text-gray-600 p-1"
                  style={{
                    fontSize:
                      notes[i].length <= 3
                        ? "14px"
                        : notes[i].length <= 6
                        ? "11px"
                        : "9px",
                    lineHeight: "1",
                  }}
                >
                  {Array.from({ length: 9 }).map((_, n) => (
                    <div
                      key={n}
                      className="flex items-center justify-center font-semibold"
                    >
                      {notes[i].includes(n + 1) ? n + 1 : ""}
                    </div>
                  ))}
                </div>
              ) : (
                <span
                  className={`${initial[i] ? "text-black" : "text-gray-800"}`}
                >
                  {val === null ? "" : val}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
