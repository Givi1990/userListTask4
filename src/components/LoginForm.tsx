// src/components/LoginForm.tsx

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
            setError("Incorrect password.");
          } else if (error.message === "Ваш аккаунт заблокирован.") {
            setError("Ваш аккаунт заблокирован. Пожалуйста, свяжитесь с поддержкой.");
          } else {
            setError("Error logging in. Please try again.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      }
    },
  });

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center">Login Form</h2>
        <form onSubmit={formik.handleSubmit} className="d-flex flex-column">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">Login</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/registration")}>Registration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
