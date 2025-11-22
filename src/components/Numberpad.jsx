import { FaPencilAlt, FaTrash, FaUndo } from "react-icons/fa";

export default function NumberPad({
  counts,
  onPick,
  onClear,
  pencilMode,
  togglePencilMode,
  canDelete,
  handleUndo,
  history,
}) {
  return (
    <div className="mt-4 space-y-4 sm:space-y-5">
      <div className="flex justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <button
          onClick={togglePencilMode}
          title="Toggle Pencil Mode (P)"
          className={`
            px-4 sm:px-5 py-3 rounded-xl border-2 font-bold transition text-xl shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2
            ${
              pencilMode
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-600 shadow-lg"
                : "bg-white text-gray-700 hover:bg-yellow-50 border-gray-300 hover:border-yellow-300"
            }
          `}
        >
          <FaPencilAlt /> 
        </button>

        <button
          onClick={onClear}
          disabled={!canDelete}
          title="Delete Cell (Delete)"
          className={`px-4 sm:px-5 py-3 rounded-xl border-2 font-bold transition text-xl shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 ${
            canDelete
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-red-700 shadow-lg hover:shadow-xl"
              : "bg-red-200 text-red-400 border-red-300 cursor-not-allowed opacity-50"
          }`}
        >
          <FaTrash /> 
        </button>
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
          className={`px-4 sm:px-5 py-3 rounded-xl border-2 font-bold transition text-xl shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 ${
            history.length > 0
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 border-indigo-800 shadow-lg hover:shadow-xl"
              : "bg-indigo-200 text-indigo-400 border-indigo-300 cursor-not-allowed opacity-50"
          }`}
        >
          <FaUndo /> 
        </button>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onPick(n)}
              disabled={counts[n] === 0}
              className={`
                flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl 
                border-2 font-bold transition shadow-md hover:shadow-lg transform hover:scale-105 h-16 sm:h-20 w-16 sm:w-20
                ${
                  counts[n] === 0
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 border-indigo-300 hover:border-indigo-500"
                }
              `}
            >
              <span className="text-base sm:text-xl font-black">{n}</span>
              <span className="text-[6px] sm:text-[9px] text-gray-600 font-semibold">
                {counts[n]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
