import React, { useState } from "react";
import { useFormik } from "formik";
import { UserAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = UserAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        await signIn(values.email, values.password);
        alert("Login Successful");
        navigate("/privatepage");
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("auth/user-not-found")) {
            setError("No user found with this email.");
          } else if (error.message.includes("auth/wrong-password")) {
            setError("Incorrect password");
          } else {
            setError("Error logging in. Please try again.");
          }
        } else {
          setError("An unexpected error occurred");
        }
      }
    },
  });

  return (
    <div className="min-h-screen gb-slate-400 flex items-center justify-center">
      <div className="bg-slate-400 flex flex-col items-center justify-center p-8 rounded-lg shadow-lg max-w-md w-full">
        <p>Login Form</p>
        <form onSubmit={formik.handleSubmit} className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <button type="submit" className="mr-8">
              Login
            </button>
            <button type="button" onClick={() => navigate("/registration")}>
              Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
