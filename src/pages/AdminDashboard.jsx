import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  Trophy,
  Trash2,
  Ban,
  CheckCircle,
  Edit2,
  Wifi,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import BASE_URL from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // users, sessions, or leaderboard
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUserSessions, setSelectedUserSessions] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [editingScore, setEditingScore] = useState(null);
  const [newScore, setNewScore] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const username = localStorage.getItem("admin_username");

    if (!token || !username) {
      navigate("/__admin__/login");
      return;
    }

    setAdminUsername(username);
    fetchUsers(token);
    fetchLeaderboard(token);
  }, [navigate]);

  const getToken = () => localStorage.getItem("admin_token");

  const fetchUsers = async (token) => {
    try {
      const res = await fetch(`${BASE_URL}/__admin__/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_username");
          navigate("/__admin__/login");
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load users", "error");
    }
  };

  const fetchLeaderboard = async (token) => {
    try {
      const res = await fetch(`${BASE_URL}/__admin__/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_username");
          navigate("/__admin__/login");
          return;
        }
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load leaderboard", "error");
    }
  };

  const fetchUserSessions = async (username, token) => {
    try {
      console.log(
        "Fetching sessions for:",
        username,
        "with token:",
        token ? "✓" : "✗"
      );

      const res = await fetch(
        `${BASE_URL}/__admin__/users/${username}/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await res.json();
      console.log("Sessions fetched:", data);
      setUserSessions(data);
      setSelectedUserSessions(username);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load sessions", "error");
    }
  };

  const handleBanUser = async (username) => {
    const { value: reason } = await Swal.fire({
      title: "Ban User",
      input: "textarea",
      inputLabel: "Ban reason",
      inputPlaceholder: "Enter reason for banning this user",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ban User",
    });

    if (reason !== undefined) {
      try {
        const res = await fetch(`${BASE_URL}/__admin__/users/${username}/ban`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ reason: reason || null }),
        });

        if (res.ok) {
          await Swal.fire(
            "Success",
            `User ${username} has been banned`,
            "success"
          );
          fetchUsers(getToken());
        } else {
          Swal.fire("Error", "Failed to ban user", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  const handleUnbanUser = async (username) => {
    const { isConfirmed } = await Swal.fire({
      title: "Unban User",
      text: `Are you sure you want to unban ${username}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, unban",
    });

    if (isConfirmed) {
      try {
        const res = await fetch(
          `${BASE_URL}/__admin__/users/${username}/unban`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (res.ok) {
          await Swal.fire(
            "Success",
            `User ${username} has been unbanned`,
            "success"
          );
          fetchUsers(getToken());
        } else {
          Swal.fire("Error", "Failed to unban user", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  const handleDeleteLeaderboardEntry = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Entry",
      text: "Are you sure you want to delete this leaderboard entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });

    if (isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/__admin__/leaderboard/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (res.ok) {
          await Swal.fire("Success", "Entry deleted", "success");
          fetchLeaderboard(getToken());
        } else {
          Swal.fire("Error", "Failed to delete entry", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  const handleUpdateScore = async (id) => {
    if (!newScore || isNaN(newScore) || newScore < 0) {
      Swal.fire("Error", "Please enter a valid score", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/__admin__/leaderboard/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ time_seconds: parseFloat(newScore) }),
      });

      if (res.ok) {
        await Swal.fire("Success", "Score updated", "success");
        setEditingScore(null);
        setNewScore("");
        fetchLeaderboard(getToken());
      } else {
        Swal.fire("Error", "Failed to update score", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Network error", "error");
    }
  };

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Logout",
    });

    if (isConfirmed) {
      try {
        const token = getToken();
        await fetch(`${BASE_URL}/__admin__/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
      }

      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
      navigate("/");
    }
  };

  const handleDeleteSession = async (username, token) => {
    const { isConfirmed } = await Swal.fire({
      title: "Logout Session",
      text: "Are you sure you want to logout this session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, logout",
    });

    if (isConfirmed) {
      try {
        const res = await fetch(
          `${BASE_URL}/__admin__/users/${username}/sessions/${token}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (res.ok) {
          await Swal.fire("Success", "Session terminated", "success");
          fetchUserSessions(username, getToken());
        } else {
          Swal.fire("Error", "Failed to terminate session", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  const handleLogoutAllSessions = async (username) => {
    const { isConfirmed } = await Swal.fire({
      title: "Logout All Sessions",
      text: `Are you sure you want to logout all sessions for ${username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, logout all",
    });

    if (isConfirmed) {
      try {
        const res = await fetch(
          `${BASE_URL}/__admin__/users/${username}/logout-all`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (res.ok) {
          await Swal.fire("Success", "All sessions terminated", "success");
          setSelectedUserSessions(null);
          setUserSessions([]);
          fetchUsers(getToken());
        } else {
          Swal.fire("Error", "Failed to logout user", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-sm">
              Logged in as:{" "}
              <span className="font-semibold">{adminUsername}</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
              activeTab === "users"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Users size={20} />
            Users Management
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Wifi size={20} />
            Sessions Management
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
              activeTab === "leaderboard"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Trophy size={20} />
            Leaderboard Management
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Users Management</h2>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th className="px-6 py-3 font-semibold">Username</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Sessions</th>
                      <th className="px-6 py-3 font-semibold">Ban Reason</th>
                      <th className="px-6 py-3 font-semibold">Created</th>
                      <th className="px-6 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-8 text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.username}
                          className="border-b border-gray-700 hover:bg-gray-750 transition"
                        >
                          <td className="px-6 py-4 font-medium">
                            {user.username}
                          </td>

                          <td className="px-6 py-4">
                            {user.banned ? (
                              <span className="flex items-center gap-1 text-red-400">
                                <Ban size={16} />
                                Banned
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle size={16} />
                                Active
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold">
                              {user.active_sessions}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                            {user.banned_reason || "-"}
                          </td>

                          <td className="px-6 py-4 text-gray-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => {
                                fetchUserSessions(user.username, getToken());
                                setActiveTab("sessions");
                              }}
                              className="text-blue-400 hover:text-blue-300 transition"
                              title="View sessions"
                            >
                              <Wifi size={20} />
                            </button>

                            {user.banned ? (
                              <button
                                onClick={() => handleUnbanUser(user.username)}
                                className="text-green-400 hover:text-green-300 transition"
                                title="Unban user"
                              >
                                <CheckCircle size={20} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user.username)}
                                className="text-red-400 hover:text-red-300 transition"
                                title="Ban user"
                              >
                                <Ban size={20} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              Total users: <span className="font-semibold">{users.length}</span>
            </p>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              User Sessions Management
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-700 px-6 py-3 font-semibold">
                  Users with Active Sessions
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {users.filter((u) => u.active_sessions > 0).length === 0 ? (
                    <p className="text-gray-400 text-sm p-4">
                      No active sessions
                    </p>
                  ) : (
                    users
                      .filter((u) => u.active_sessions > 0)
                      .map((user) => (
                        <button
                          key={user.username}
                          onClick={() =>
                            fetchUserSessions(user.username, getToken())
                          }
                          className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition ${
                            selectedUserSessions === user.username
                              ? "bg-blue-900 border-l-4 border-l-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-xs bg-blue-900 text-blue-100 px-2 py-1 rounded">
                              {user.active_sessions}
                            </span>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>

              {/* Sessions Details */}
              <div className="lg:col-span-2">
                {selectedUserSessions ? (
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-gray-700 px-6 py-3 flex justify-between items-center">
                      <span className="font-semibold">
                        Sessions for {selectedUserSessions}
                      </span>
                      <button
                        onClick={() =>
                          handleLogoutAllSessions(selectedUserSessions)
                        }
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition"
                      >
                        <X size={16} />
                        Logout All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      {userSessions.length === 0 ? (
                        <p className="text-gray-400 text-sm p-6">
                          No active sessions
                        </p>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-gray-700 border-b border-gray-600">
                              <th className="px-6 py-3 font-semibold">Token</th>
                              <th className="px-6 py-3 font-semibold">
                                Created
                              </th>
                              <th className="px-6 py-3 font-semibold">
                                Expires
                              </th>
                              <th className="px-6 py-3 font-semibold">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userSessions.map((session, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-700 hover:bg-gray-750 transition"
                              >
                                <td className="px-6 py-3 font-mono text-xs truncate max-w-xs">
                                  {session.token}
                                </td>
                                <td className="px-6 py-3 text-gray-400">
                                  {new Date(
                                    session.created_at
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-gray-400">
                                  {new Date(
                                    session.expires_at
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-3">
                                  <button
                                    onClick={() =>
                                      handleDeleteSession(
                                        selectedUserSessions,
                                        session.token
                                      )
                                    }
                                    className="text-red-400 hover:text-red-300 transition"
                                  >
                                    <X size={20} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                    Select a user to view their sessions
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Leaderboard Management</h2>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th className="px-6 py-3 font-semibold">Username</th>
                      <th className="px-6 py-3 font-semibold">Difficulty</th>
                      <th className="px-6 py-3 font-semibold">
                        Time (seconds)
                      </th>
                      <th className="px-6 py-3 font-semibold">Created</th>
                      <th className="px-6 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-400"
                        >
                          No leaderboard entries found
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-700 hover:bg-gray-750 transition"
                        >
                          <td className="px-6 py-4 font-medium">
                            {entry.username}
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {entry.difficulty}
                          </td>

                          <td className="px-6 py-4">
                            {editingScore === entry.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={newScore}
                                  onChange={(e) => setNewScore(e.target.value)}
                                  className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                                  placeholder="Score"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateScore(entry.id)}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingScore(null);
                                    setNewScore("");
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              entry.time_seconds.toFixed(2)
                            )}
                          </td>

                          <td className="px-6 py-4 text-gray-400">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4 flex gap-2">
                            {editingScore !== entry.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingScore(entry.id);
                                    setNewScore(entry.time_seconds.toString());
                                  }}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <Edit2 size={20} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteLeaderboardEntry(entry.id)
                                  }
                                  className="text-red-400 hover:text-red-300 transition"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              Total entries:{" "}
              <span className="font-semibold">{leaderboard.length}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
