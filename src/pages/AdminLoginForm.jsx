import { useState, useRef } from "react";
import { Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import BASE_URL from "../api";
import Footer from "../components/Footer";

export default function AdminLoginForm() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const [hcaptchaError, setHcaptchaError] = useState("");
  const hcaptchaRef = useRef(null);

  const onHcaptchaVerify = (token) => {
    setCaptchaToken(token);
    setHcaptchaError("");
  };

  const onHcaptchaExpire = () => {
    setCaptchaToken("");
    setHcaptchaError("Captcha expired. Please verify again.");
  };

  const onHcaptchaError = () => {
    setCaptchaToken("");
    setHcaptchaError("Captcha failed. Please try again.");
  };

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");

    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username cannot be empty";
    if (!password.trim()) newErrors.password = "Password cannot be empty";
    if (!captchaToken) newErrors.hcaptcha = "Please complete the captcha";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    Swal.fire({
      title: "Processing...",
      html: "Please wait",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(`${BASE_URL}/__admin__/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          "h-captcha-response": captchaToken,
        }),
      });

      const body = await res.json().catch(() => ({}));

      Swal.close();
      setLoading(false);

      if (res.ok) {
        if (body.token) {
          localStorage.setItem("admin_token", body.token);
          localStorage.setItem("admin_username", body.username);
        }

        await Swal.fire({
          icon: "success",
          title: "Admin Login successful!",
          text: "Welcome to admin panel.",
          confirmButtonColor: "#2563eb",
        });

        navigate("/__admin__/dashboard", { replace: true });
        return;
      }

      if (res.status === 401) {
        setServerError(body.message || "Invalid credentials");
      } else if (res.status === 403) {
        setServerError(body.message || "Access denied");
      } else if (res.status === 400) {
        setServerError(body.message || "Bad request");
        if (hcaptchaRef.current) {
          hcaptchaRef.current.resetCaptcha();
        }
        setCaptchaToken("");
      } else {
        setServerError(body.message || `Server error (${res.status})`);
      }
    } catch (err) {
      Swal.close();
      setLoading(false);
      console.error(err);
      setServerError("Network error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
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
            <h2 className="text-3xl font-semibold text-center mb-2 tracking-tight">
              Admin Login
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Administrators only
            </p>

            {serverError && (
              <p className="text-red-600 text-sm mb-4 text-center">
                {serverError}
              </p>
            )}

            <div className="mb-5">
              <label className="block font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                className={`w-full px-3 py-2 border rounded-xl transition focus:outline-none focus:ring-2 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">Password</label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter admin password"
                  className={`w-full px-3 py-2 border rounded-xl transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-black transition disabled:opacity-50"
                  onClick={() => setShowPass(!showPass)}
                  disabled={loading}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="mb-6 flex flex-col items-center">
             

              <HCaptcha
                sitekey="805e24ac-e564-49b4-8826-cefa686cd5ea"
                onVerify={onHcaptchaVerify}
                onExpire={onHcaptchaExpire}
                onError={onHcaptchaError}
                ref={hcaptchaRef}
              />

              {(errors.hcaptcha || hcaptchaError) && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hcaptcha || hcaptchaError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-red-600 text-white rounded-xl text-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? "Logging in..." : "Login as Admin"}
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Need help?{" "}
              <Link
                to="/"
                className="text-gray-600 font-semibold hover:underline"
              >
                Go to Home
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
