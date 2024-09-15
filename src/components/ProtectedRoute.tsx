import { Navigate } from "react-router";
import { UserAuth } from "./AuthContext";

interface ProtectedRouteProp {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProp> = ({ children }) => {
  const { user } = UserAuth();

  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
