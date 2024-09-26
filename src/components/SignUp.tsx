import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const SignUp: React.FC = () => {
  const { createUser } = UserAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        const userCredential = await createUser(values.email, values.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: values.name,
          email: values.email,
          registrationTime: new Date(),
          status: "active",
          lastLogin: new Date(),
        });

        alert("User Registered successfully");
        navigate("/");
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          alert(
            "The email address is already in use. Please use a different email."
          );
        } else {
          console.error("Error registering user", error);
          alert("An error occurred during registration. Please try again.");
        }
      }
    },
  });

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h5 className="card-title text-center">Registration</h5>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">Create Account</button>
              <button type="button" className="btn btn-secondary" onClick={() => formik.resetForm()}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
