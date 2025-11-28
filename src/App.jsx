import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sudoku from "./Sudoku";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import AdminLoginForm from "./pages/AdminLoginForm";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/__admin__/login" element={<AdminLoginForm />} />
            <Route path="/__admin__/dashboard" element={<AdminDashboard />} />
            <Route path="/" element={<Sudoku />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
