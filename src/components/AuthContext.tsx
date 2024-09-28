// src/components/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "../firebase"; // Путь к вашему firebase.js
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";

// Объявляем интерфейс контекста аутентификации
interface AuthContextProps {
  user: FirebaseUser | null;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

// Создаем контекст
const UserContext = createContext<AuthContextProps | undefined>(undefined);

// Провайдер контекста
export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Функция регистрации пользователя
  const createUser = async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    await setDoc(doc(db, "User_Data", user.uid), {
      registrationTime: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "active", // Установите статус по умолчанию
    });
    return userCredential;
  };

  // Функция входа пользователя
  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Получение документа пользователя из коллекции 'users'
    const userDoc = await getDoc(doc(db, "users", user.uid)); // Измените на вашу коллекцию
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("Статус пользователя:", userData?.status); // Логируем статус пользователя

      // Проверка статуса пользователя
      if (userData?.status === "blocked") {
        throw new Error("Ваш аккаунт заблокирован."); // Бросаем ошибку, если статус "blocked"
      }

      // Обновление времени последнего входа
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: serverTimestamp(),
      });
    } else {
      throw new Error("Пользователь не найден в коллекции users.");
    }

    return userCredential;
  };

  // Функция выхода пользователя
  const logout = () => signOut(auth);

  // Отслеживание состояния пользователя
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ createUser, user, logout, signIn }}>
      {children}
    </UserContext.Provider>
  );
};

// Хук для использования контекста
export const UserAuth = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within an AuthContextProvider");
  }
  return context;
};
