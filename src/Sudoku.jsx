import React, { useState, useEffect, useRef, useCallback } from "react";
import SudokuBoard from "./components/SudokuBoard";
import NumberPad from "./components/Numberpad";
import { useSudoku } from "./hooks/useSudoku";
import Swal from "sweetalert2";
import "./index.css";
import BASE_URL from "./api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Footer from "./components/Footer";

export default function Sudoku() {
  const [level, setLevel] = useState("easy");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [pencilMode, setPencilMode] = useState(false);
  const [notes, setNotes] = useState({});

  const { puzzle, solution, initial, generate } = useSudoku(level);
  const [board, setBoard] = useState(Array(81).fill(null));

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [isFirstStart, setIsFirstStart] = useState(true);
  const [history, setHistory] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [surrendered, setSurrendered] = useState(false);
  const [filledCells, setFilledCells] = useState(new Set());

  const motivationalMessages = [
    "You've got this! Try again!",
    "Don't give up! You're almost there!",
    "Keep pushing, you can do better!",
    "Every attempt makes you stronger!",
    "Try once more, believe in yourself!",
    "You're closer than you think!",
    "Learn from this and come back!",
  ];

  const getRandomMotivation = () => {
    return motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];
  };

  const [currentMotivation, setCurrentMotivation] = useState("");

  const boardRef = useRef(board);
  const notesRef = useRef(notes);
  const historyRef = useRef(history);
  const boardContainerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkLogin();
  }, []);

  async function logout() {
    const token = localStorage.getItem("sudoku_token");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      if (token) {
        await fetch(`${BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("sudoku_token");
    setLoggedIn(false);
    setUsername("");

    Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have been logged out successfully.",
      confirmButtonColor: "#4F46E5",
    });
  }

  async function checkLogin() {
    const token = localStorage.getItem("sudoku_token");

    if (!token) {
      setLoggedIn(false);
      setUsername("");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const data = await res.json();
        setUsername(data.username);
        setLoggedIn(true);
      } else {
        localStorage.removeItem("sudoku_token");
        setLoggedIn(false);
        setUsername("");
      }
    } catch (err) {
      console.error(err);
      setLoggedIn(false);
    }
  }

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const canDelete =
    selectedIndex !== null &&
    !initial[selectedIndex] &&
    (board[selectedIndex] !== null ||
      (notes && notes[selectedIndex] && notes[selectedIndex].length > 0));

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function resetGame() {
    if (!started) return;

    setBoard(puzzle.map((v) => (v ? Number(v) : null)));
    setNotes({});
    setSelectedIndex(null);
    setRunning(true);
  }

  function handleBackFromSurrender() {
    setSurrendered(false);
    setStarted(false);
    setBoard(Array(81).fill(null));
    setFilledCells(new Set());
    setSeconds(0);
    setCurrentMotivation("");
  }

  async function surrender() {
    const result = await Swal.fire({
      title: "Surrender?",
      text: "Are you sure you want to give up? Your progress will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Surrender",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    // Get random motivational message
    setCurrentMotivation(getRandomMotivation());

    // Start surrender animation
    setSurrendered(true);
    setRunning(false);
    setHistory([]);
    setSelectedIndex(null);
    setFilledCells(new Set());

    // Animate filling the board with solution
    let newBoard = [...board];
    let newNotes = { ...notes };
    const cellsToFill = [];

    for (let i = 0; i < 81; i++) {
      const userValue = Number(newBoard[i]);
      const correctValue = Number(solution[i]);

      // Only fill if:
      // 1. Cell is empty (null)
      // 2. Cell has wrong value
      // 3. Cell has pencil notes (should be replaced with correct number)
      const hasNotes = newNotes[i] && newNotes[i].length > 0;
      const isWrong = userValue !== null && userValue !== correctValue;
      const isEmpty = userValue === null;

      if (isEmpty || isWrong || hasNotes) {
        cellsToFill.push(i);
      }
    }

    // Shuffle cells for random filling
    for (let i = cellsToFill.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsToFill[i], cellsToFill[j]] = [cellsToFill[j], cellsToFill[i]];
    }

    // Fill each cell with delay for animation effect
    for (let idx of cellsToFill) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      newBoard[idx] = Number(solution[idx]);
      // Clear notes for this cell
      delete newNotes[idx];
      setBoard([...newBoard]);
      setNotes({ ...newNotes });
      setFilledCells((prev) => new Set([...prev, idx]));
    }
  }

  useEffect(() => {
    if (!started) return;

    setBoard(puzzle.map((v) => (v ? Number(v) : null)));
    setNotes({});
    setSeconds(0);
    setRunning(true);

    fetchLeaderboard();
  }, [puzzle]);

  useEffect(() => {
    fetchLeaderboard();
  }, [level, started]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/leaderboard/${level}`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function checkComplete() {
    if (!solution) return false;

    for (let i = 0; i < 81; i++) {
      const a = Number(board[i]);
      const b = Number(solution[i]);
      if (a !== b) return false;
    }
    return true;
  }

  function handleSelect(i) {
    setSelectedIndex(i);
  }

  function checkConflict(index, val) {
    if (val === null) return false;

    const row = Math.floor(index / 9);
    const col = index % 9;
    const subgrid = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    for (let j = 0; j < 81; j++) {
      if (j === index) continue;
      if (board[j] !== val) continue;

      const r2 = Math.floor(j / 9);
      const c2 = j % 9;
      const s2 = Math.floor(r2 / 3) * 3 + Math.floor(c2 / 3);

      if (r2 === row || c2 === col || s2 === subgrid) return true;
    }

    return false;
  }

  const pushHistory = useCallback((entry) => {
    setHistory((h) => [...h, entry]);
  }, []);

  const handlePick = useCallback(
    (num) => {
      if (selectedIndex === null) return;
      const currentVal = boardRef.current[selectedIndex];
      const isCurrentError = checkConflict(selectedIndex, currentVal);

      if (
        selectedIndex === null ||
        initial[selectedIndex] ||
        (boardRef.current[selectedIndex] !== null && !isCurrentError)
      ) {
        const foundIndex = boardRef.current.findIndex((v) => v === num);
        if (foundIndex !== -1) {
          setSelectedIndex(foundIndex);
          return;
        }

        const emptyIndex = boardRef.current.findIndex((v) => v === null);
        if (emptyIndex !== -1) {
          setSelectedIndex(emptyIndex);
        }
        return;
      }

      if (currentVal !== null) {
        if (!isCurrentError) {
          console.warn(
            "Kotak ini sudah benar. Hapus dulu jika ingin mengubah."
          );
          return;
        }
      }

      if (pencilMode) {
        const arr = new Set(notesRef.current[selectedIndex] || []);
        const exists = arr.has(num);

        const newNotes = JSON.parse(JSON.stringify(notesRef.current));
        const updatedArr = new Set(newNotes[selectedIndex] || []);
        exists ? updatedArr.delete(num) : updatedArr.add(num);
        newNotes[selectedIndex] = Array.from(updatedArr);

        pushHistory({
          board: [...boardRef.current],
          notes: JSON.parse(JSON.stringify(notesRef.current)),
          index: selectedIndex,
        });

        setNotes(newNotes);
        return;
      }

      const newCounts = {};
      for (let n = 1; n <= 9; n++) newCounts[n] = 9;
      boardRef.current.forEach((v) => {
        if (v >= 1 && v <= 9) {
          newCounts[v] = Math.max(0, newCounts[v] - 1);
        }
      });

      if (newCounts[num] === 0) {
        console.warn(`Angka ${num} sudah dipakai 9 kali.`);
        return;
      }

      const newBoard = [...boardRef.current];
      newBoard[selectedIndex] = num;

      const newNotes = JSON.parse(JSON.stringify(notesRef.current));
      delete newNotes[selectedIndex];

      pushHistory({
        board: [...boardRef.current],
        notes: JSON.parse(JSON.stringify(notesRef.current)),
        index: selectedIndex,
      });

      setBoard(newBoard);
      setNotes(newNotes);
    },
    [selectedIndex, pencilMode, initial, pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const last = historyRef.current[historyRef.current.length - 1];

    setBoard(last.board);
    setNotes(last.notes);

    if (last.index !== undefined && last.index !== null) {
      setSelectedIndex(last.index);
    }

    setHistory((h) => h.slice(0, h.length - 1));
  }, []);

  const handleClear = useCallback(() => {
    if (selectedIndex === null) return;
    if (initial[selectedIndex]) return;

    const newBoard = [...boardRef.current];
    newBoard[selectedIndex] = null;

    const newNotes = JSON.parse(JSON.stringify(notesRef.current));
    delete newNotes[selectedIndex];

    pushHistory({
      board: [...boardRef.current],
      notes: JSON.parse(JSON.stringify(notesRef.current)),
      index: selectedIndex,
    });

    setBoard(newBoard);
    setNotes(newNotes);
  }, [selectedIndex, initial, pushHistory]);

  function togglePencilMode() {
    setPencilMode((p) => !p);
  }

  function startGame() {
    setStarted(true);
    setIsFirstStart(true);
    generate(level);
    setSelectedIndex(null);
    setSeconds(0);
    setRunning(true);

    setTimeout(() => {
      if (boardContainerRef.current) {
        boardContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }

  useEffect(() => {
    if (!started || !running) return;
    if (!solution) return;

    const correct = checkComplete();
    if (!correct) return;

    setRunning(false);

    async function autoSubmit() {
      let finalUsername = username;

      if (!loggedIn) {
        Swal.fire({
          icon: "success",
          title: "🎉 Sudoku Completed!",
          html: `
        <p>You finished the puzzle!</p>
        <p class="text-sm text-gray-600 mt-1">
          Difficulty: <b>${level}</b><br/>
          Time: <b>${seconds} seconds</b>
        </p>
        <p class="text-red-500 text-sm mt-2">
          (Score not saved because you are not logged in)
        </p>
      `,
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
        });

        setStarted(false);
        return;
      }
      Swal.fire({
        title: "Amazing...!",
        html: "Please wait a moment",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const res = await fetch(`${BASE_URL}/leaderboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: finalUsername,
            difficulty: level,
            time_seconds: seconds,
          }),
        });

        const data = await res.json();

        Swal.close();

        Swal.fire({
          icon: "success",
          title: "🎉 Sudoku Completed!",
          html: `
        <p>${data.message}</p>
        <p class="text-sm text-gray-600 mt-1">
          Difficulty: <b>${level}</b><br/>
          Time: <b>${seconds} seconds</b>
        </p>
      `,
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
        });
      } catch (err) {
        Swal.close();

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: "There was a problem saving your score.",
        });
      }

      setStarted(false);
      fetchLeaderboard();
    }

    autoSubmit();
  }, [board]);

  const counts = {};
  for (let n = 1; n <= 9; n++) counts[n] = 9;
  board.forEach((v) => {
    if (v >= 1 && v <= 9) {
      counts[v] = Math.max(0, counts[v] - 1);
    }
  });

  useEffect(() => {
    function handleKey(e) {
      if (!started || !running) return;
      if (selectedIndex === null) return;

      const key = e.key;

      if (initial[selectedIndex]) return;

      if (/^[1-9]$/.test(key)) {
        const num = Number(key);

        if (counts[num] === 0) {
          console.warn(`Angka ${num} sudah penuh (9 kotak).`);
          return;
        }

        handlePick(num);
        return;
      }

      if (key === "Backspace" || key === "Delete") {
        handleClear();
        return;
      }

      if (key === "p" || key === "P") {
        togglePencilMode();
        return;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    selectedIndex,
    started,
    running,
    initial,
    counts,
    handlePick,
    handleClear,
    togglePencilMode,
  ]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
    flex flex-col justify-between"
    >
      <div className="flex-grow flex flex-col items-center justify-start p-3 sm:p-6">
        <header className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🏆 Sudoku Challenge
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Race against time and climb the leaderboard
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          <section
            className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-indigo-100"
            ref={boardContainerRef}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-4">
              {surrendered ? (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center cursor-default">
                    You Surrendered!
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-center text-indigo-700 bg-indigo-100 px-4 py-2 rounded-lg shadow-md cursor-default">
                    💪 {currentMotivation}
                  </div>
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center cursor-default">
                  ⏱️
                  <span className="font-mono">
                    {Math.floor(seconds / 60)}:
                    {String(seconds % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              {running && !surrendered && (
                <button
                  onClick={surrender}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer active:scale-95"
                >
                  🚩 Surrender
                </button>
              )}
              {surrendered && (
                <button
                  onClick={handleBackFromSurrender}
                  className="w-full sm:w-auto bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer active:scale-95"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="flex justify-center mb-3 sm:mb-4 bg-gradient-to-b from-indigo-50 to-transparent p-2 sm:p-3 rounded-xl">
              {!started ? (
                <div className="text-center w-full">
                  <p className="text-gray-600 text-sm sm:text-lg font-semibold mb-4">
                    Select a difficulty level and click{" "}
                    <strong>Start Game</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
                    <select
                      value={level}
                      onChange={(e) => {
                        setLevel(e.target.value);
                        if (started) generate(e.target.value);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-white border-2 border-indigo-200 rounded-lg font-semibold text-gray-700 hover:border-indigo-400 transition focus:outline-none focus:border-indigo-600"
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                      <option value="expert">⚫ Expert</option>
                    </select>
                    <button
                      onClick={() => {
                        if (loggedIn) {
                          startGame();
                          return;
                        }

                        Swal.fire({
                          title: "Continue Without Login?",
                          text: "Your best time will NOT be saved to the leaderboard if you continue without logging in. Do you want to proceed?",
                          icon: "warning",

                          showCancelButton: true,
                          showDenyButton: true,
                          confirmButtonText: "Login",
                          denyButtonText: "Continue",
                          cancelButtonText: "Cancel",

                          confirmButtonColor: "#2563eb",
                          denyButtonColor: "#6b7280",
                          cancelButtonColor: "#dc2626",
                        }).then((res) => {
                          if (res.isConfirmed) {
                            navigate("/login");
                          } else if (res.isDenied) {
                            startGame();
                          }
                        });
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105"
                    >
                      ▶️ Start Game
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-md mx-auto">
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "📘 Application Overview",
                          html: `
          <p style="text-align:left">
          Sudoku Challenge is a number-based logic puzzle designed to improve focus, accuracy, 
          and critical thinking. This platform is optimized to be lightweight, fast, 
          and easy to use on any device.
          </p>
        `,
                          icon: "info",
                          confirmButtonText: "Close",
                        });
                      }}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-4 py-1.5 rounded-md font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 text-sm flex items-center justify-center gap-2"
                    >
                      📘 <span>Application Overview</span>
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "🎮 How to Play",
                          html: `
         <ul style="text-align:left; line-height:1.6">
  <li>• Choose your preferred difficulty level and click the <b>Start Game</b> button.</li>
  <li>• Select any cell on the board, then press a number button below to fill the chosen cell.</li>
  <li>• If you're unsure about a number, enable <b>Pencil Mode</b> to place temporary notes.</li>
  <li>• Once all cells are correctly filled with no red-highlighted mistakes, the puzzle will automatically be marked as completed.</li>
  <li>• If you finish the puzzle quickly, your completion time will appear on the leaderboard.</li>
  <li>• Enjoy the challenge and have fun!</li>
</ul>

        `,
                          icon: "info",
                          confirmButtonText: "Got it",
                        });
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-1.5 rounded-md font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 text-sm flex items-center justify-center gap-2"
                    >
                      🎮 <span>How to Play</span>
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "👨‍💻 About the Developer",
                          html: `
         <p style="text-align:left">
  This application was developed by Farras Syuja, a full-stack developer who created this Sudoku game 
  with a strong focus on speed, user experience, and a clean, minimalistic interface.
  <br><br>
  For more information about the developer and other projects, feel free to visit:
  <br>
  <a href="https://farrassyuja.my.id/" target="_blank" style="color:#2563eb; font-weight:bold;">
    farrassyuja.my.id
  </a>
</p>


        `,
                          icon: "info",
                          confirmButtonText: "Close",
                        });
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-4 py-1.5 rounded-md font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 text-sm flex items-center justify-center gap-2"
                    >
                      👨‍💻 <span>About the Developer</span>
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "🔒 Privacy Policy",
                          html: `
         <p style="text-align:left">
  This application does not collect or store any personal user data beyond the information required for account creation. 
  All user passwords are securely hashed using bcrypt, ensuring that they cannot be viewed by the public or even by the developer.
  No cookies, tracking systems, or sensitive data storage mechanisms are used by this application itself. 
  However, third-party services such as Google AdSense may use cookies to display personalized advertisements.
</p>

        `,
                          icon: "info",
                          confirmButtonText: "Close",
                        });
                      }}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-md font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 text-sm flex items-center justify-center gap-2"
                    >
                      🔒 <span>Privacy Policy</span>
                    </button>
                  </div>

                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto opacity-20">
                    📋
                  </div>
                </div>
              ) : running || surrendered ? (
                <SudokuBoard
                  puzzle={board}
                  initial={initial}
                  onSelect={handleSelect}
                  selectedIndex={selectedIndex}
                  notes={notes}
                  checkConflict={checkConflict}
                  filledCells={filledCells}
                />
              ) : null}
            </div>

            {started && running && (
              <NumberPad
                counts={counts}
                onPick={handlePick}
                onClear={handleClear}
                pencilMode={pencilMode}
                togglePencilMode={togglePencilMode}
                canDelete={canDelete}
                handleUndo={handleUndo}
                history={history}
                disabled={surrendered}
              />
            )}
          </section>

          <aside className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-indigo-100 h-fit">
            <div className="mb-4">
              {loggedIn ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                      👤 Username
                    </label>

                    <input
                      value={username}
                      disabled
                      className="w-full border-2 border-indigo-200 px-3 py-2 rounded-lg font-semibold 
                   text-gray-500 bg-gray-100 cursor-not-allowed"
                    />

                    <p className="text-green-600 text-xs sm:text-sm mt-1 font-semibold">
                      You are logged in as{" "}
                      <span className="font-bold">{username}</span>.
                    </p>
                  </div>
                  {!running && (
                    <button
                      onClick={logout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg 
                 font-bold shadow-md hover:shadow-lg transition"
                    >
                      Logout
                    </button>
                  )}
                </div>
              ) : (
                !loading && (
                  <div className="flex gap-3 mt-2">
                    <Link
                      to="/login"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 
               hover:from-blue-700 hover:to-blue-800 text-white 
               py-2 rounded-lg font-bold shadow-lg 
               transition transform hover:scale-[1.03] text-center"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700
               hover:from-green-700 hover:to-green-800 text-white 
               py-2 rounded-lg font-bold shadow-lg
               transition transform hover:scale-[1.03] text-center"
                    >
                      Register
                    </Link>
                  </div>
                )
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                🏆 Leaderboard ({level})
              </h3>
            </div>

            {loading ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-gray-100"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-4 w-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No players yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard.map((r, i) => {
                  const isMe = r.username === username;

                  return (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition
        ${
          isMe
            ? "bg-indigo-50 border-l-4 border-indigo-500 shadow-sm"
            : i < 3
            ? "bg-gradient-to-r " +
              (i === 0
                ? "from-yellow-50 to-yellow-100 border-l-4 border-yellow-400"
                : i === 1
                ? "from-gray-50 to-gray-100 border-l-4 border-gray-400"
                : "from-orange-50 to-orange-100 border-l-4 border-orange-400")
            : "bg-gray-50 hover:bg-gray-100"
        }
      `}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg font-bold text-gray-600 w-6 text-center">
                          {i === 0
                            ? "🥇"
                            : i === 1
                            ? "🥈"
                            : i === 2
                            ? "🥉"
                            : `${i + 1}.`}
                        </span>

                        <span
                          className={`font-semibold truncate ${
                            isMe ? "text-indigo-700" : "text-gray-800"
                          }`}
                        >
                          {r.username}
                          {isMe && " (You)"}
                        </span>
                      </div>

                      <span
                        className={`font-mono font-bold text-sm ${
                          isMe ? "text-indigo-700" : "text-indigo-600"
                        }`}
                      >
                        {Math.floor(r.time_seconds / 60)}:
                        {String(r.time_seconds % 60).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </main>
      </div>
      <Footer />
    </div>
  );
}
