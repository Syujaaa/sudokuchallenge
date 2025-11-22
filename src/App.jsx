import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sudoku from "./Sudoku";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import NotFound from "./NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/" element={<Sudoku />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

       
      </div>
    </BrowserRouter>
  );
}
