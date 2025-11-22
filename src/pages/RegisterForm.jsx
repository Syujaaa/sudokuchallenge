import { useState, useRef } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../api";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPass, setVerifyPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showVerifyPass, setShowVerifyPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // hCaptcha states
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const [hcaptchaError, setHcaptchaError] = useState("");
  const hcaptchaRef = useRef(null);

  async function handleRegister(e) {
    e.preventDefault();
    setServerError("");
    setHcaptchaError("");
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username cannot be empty";
    else if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!password.trim()) newErrors.password = "Password cannot be empty";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!verifyPass.trim())
      newErrors.verifyPass = "Please confirm your password";
    if (password && verifyPass && password !== verifyPass)
      newErrors.verifyPass = "Passwords do not match";

    // cek hCaptcha
    if (!hcaptchaToken) {
      newErrors.hcaptcha = "Please complete the captcha";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    Swal.fire({
      title: "Creating account...",
      html: "Please wait",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          hcaptchaToken: hcaptchaToken, // kirim token ke server untuk verifikasi
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 201) {
        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Account created successfully!",
          text: "Please log in.",
          confirmButtonColor: "#16a34a",
        });

        navigate("/login", { replace: true });
        return;
      }

      // Jika status bukan 201 → tutup loading
      Swal.close();

      if (res.status === 409) {
        setErrors((s) => ({
          ...s,
          username: body.message || "Username already taken",
        }));
      } else if (res.status === 400) {
        setServerError(body.message || "Invalid input");
      } else {
        setServerError(body.message || "Server error");
      }
    } catch (err) {
      Swal.close();

      console.error(err);
      setServerError("Network error");
    } finally {
      setLoading(false);
      // reset captcha agar user bisa coba lagi (opsional)
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
        setHcaptchaToken("");
      }
    }
  }

  // Callback saat hCaptcha sukses
  function onHcaptchaVerify(token) {
    setHcaptchaToken(token);
    setHcaptchaError("");
    setErrors((s) => {
      const copy = { ...s };
      delete copy.hcaptcha;
      return copy;
    });
  }

  function onHcaptchaExpire() {
    setHcaptchaToken("");
    setHcaptchaError("Captcha expired, please complete it again");
  }

  function onHcaptchaError(err) {
    console.error("hCaptcha error:", err);
    setHcaptchaError("Captcha error, try again");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 px-4">
      {/* AREA FORM TENGAH */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-700 hover:text-black transition"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>

          <form
            onSubmit={handleRegister}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md"
          >
            <h2 className="text-3xl font-semibold text-center mb-6">
              Register
            </h2>

            {serverError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {serverError}
              </div>
            )}

            {/* USERNAME */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="e.g. syuja123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl transition border focus:outline-none focus:ring-2 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
              />
              {errors.username && (
                <p className="text-red-600 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl transition border focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* VERIFY PASSWORD */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Confirm password</label>
              <div className="relative">
                <input
                  type={showVerifyPass ? "text" : "password"}
                  placeholder="Re-type your password"
                  value={verifyPass}
                  onChange={(e) => setVerifyPass(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl transition border focus:outline-none focus:ring-2 ${
                    errors.verifyPass
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
                  onClick={() => setShowVerifyPass((s) => !s)}
                >
                  {showVerifyPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.verifyPass && (
                <p className="text-red-600 text-sm mt-1">{errors.verifyPass}</p>
              )}
            </div>

            {/* HCAPTCHA WIDGET */}
            <div className="mb-4 flex flex-col items-center justify-center">
              <label className="block font-medium mb-2">Captcha</label>

              <div className="flex justify-center">
                <HCaptcha
                  sitekey="805e24ac-e564-49b4-8826-cefa686cd5ea"
                  onVerify={onHcaptchaVerify}
                  onExpire={onHcaptchaExpire}
                  onError={onHcaptchaError}
                  ref={hcaptchaRef}
                />
              </div>

              {(errors.hcaptcha || hcaptchaError) && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hcaptcha || hcaptchaError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-xl text-lg font-medium transition ${
                loading
                  ? "bg-gray-400 text-white"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
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
