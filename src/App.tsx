import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignUp from "./components/SignUp";
import PrivatePage from "./components/PrivatePage";
import { AuthContextProvider } from "./components/AuthContext"; // Это должно быть AuthContextProvider
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="flex items-center justify-center bg-slate-500">
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/registration" element={<SignUp />} />
          <Route
            path="/privatePage"
            element={
              <ProtectedRoute>
                <PrivatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
