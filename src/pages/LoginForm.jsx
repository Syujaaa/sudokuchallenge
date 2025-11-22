import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import BASE_URL from "../api";
import Footer from "../components/Footer";

export default function LoginForm() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");

    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username cannot be empty";
    if (!password.trim()) newErrors.password = "Password cannot be empty";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // tampilkan loading Swal
    Swal.fire({
      title: "Processing...",
      html: "Please wait",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      // coba parse body (jika bukan JSON akan di-catch)
      const body = await res.json().catch(() => ({}));

      // tutup loading Swal segera setelah mendapatkan respon
      Swal.close();

      // jika status 200 / ok => sukses
      if (res.ok) {
        // server boleh mengembalikan token; simpan kalau ada
        if (body.token) {
          localStorage.setItem("sudoku_token", body.token);
        }

        await Swal.fire({
          icon: "success",
          title: "Login successful!",
          text: "Welcome back.",
          confirmButtonColor: "#2563eb",
        });

        navigate("/", { replace: true });
        return;
      }

      // bukan ok => tangani berdasarkan status
      if (res.status === 401) {
        setServerError(body.message || "Incorrect username or password");
      } else if (res.status === 403) {
        // banned atau forbidden
        const reason = body.reason ? `: ${body.reason}` : "";
        setServerError((body.message || "Access denied") + reason);
      } else if (res.status === 400) {
        setServerError(body.message || "Bad request");
      } else {
        setServerError(body.message || `Server error (${res.status})`);
      }
    } catch (err) {
      // pastikan loading Swal ditutup kalau fetch error
      Swal.close();
      console.error(err);
      setServerError("Network error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* CONTENT */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute -top-12 left-0 flex items-center gap-1 text-gray-700 hover:text-black transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <form
            onSubmit={handleLogin}
            className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded-2xl p-8 border border-gray-200"
          >
            <h2 className="text-3xl font-semibold text-center mb-6 tracking-tight">
              Login
            </h2>

            {serverError && (
              <p className="text-red-600 text-sm mb-4 text-center">
                {serverError}
              </p>
            )}

            {/* USERNAME */}
            <div className="mb-5">
              <label className="block font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`w-full px-3 py-2 border rounded-xl transition focus:outline-none focus:ring-2 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="mb-6">
              <label className="block font-medium mb-1">Password</label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2 border rounded-xl transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-black transition"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition"
            >
              Login
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
