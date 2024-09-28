import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

const SignUp: React.FC = () => {
  const { createUser } = UserAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]); // Состояние для хранения списка пользователей

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

        // Сохранение информации о пользователе в Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: values.name,
          email: values.email,
          registrationTime: new Date(),
          status: "active",
          lastLogin: new Date(),
        });

        alert("Пользователь успешно зарегистрирован");
        navigate("/");
      } catch (error: any) {
        handleRegistrationError(error);
      }
    },
  });

  // Функция для обработки ошибок регистрации
  const handleRegistrationError = (error: any) => {
    if (error.code === "auth/email-already-in-use") {
      alert("Электронная почта уже используется. Пожалуйста, используйте другую почту.");
    } else {
      console.error("Ошибка регистрации пользователя", error);
      alert("Произошла ошибка во время регистрации. Пожалуйста, попробуйте еще раз.");
    }
  };

  // Получение списка пользователей из Firestore при загрузке компонента
  const fetchUsers = async () => {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h5 className="card-title text-center">Регистрация</h5>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Имя</label>
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
              <label htmlFor="email" className="form-label">Электронная почта</label>
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
              <label htmlFor="password" className="form-label">Пароль</label>
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
              <button type="submit" className="btn btn-primary">Создать аккаунт</button>
              <button type="button" className="btn btn-secondary" onClick={() => formik.resetForm()}>
                Сбросить
              </button>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default SignUp;
