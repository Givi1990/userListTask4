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
    <div className="bg-slate-400 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Registration</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            className="border p-2 w-full"
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            className="border p-2 w-full"
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            className="border p-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Create Account
          </button>
          <button type="button" onClick={() => formik.resetForm({})}>
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
