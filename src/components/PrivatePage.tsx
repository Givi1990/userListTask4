import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { UserAuth } from "./AuthContext";

interface User {
  id: string;
  email: string;
  name: string;
  lastLogin?: { seconds: number };
  registrationTime?: { seconds: number };
  status: string;
}

const PrivatePage: React.FC = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("email", "asc"),
        orderBy("status", "asc")
      );
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<User, "id">;
        return { id: doc.id, ...data };
      });
      setUsers(userList);
    };
    fetchData();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(
      e.target.checked ? new Set(users.map((user) => user.id)) : new Set()
    );
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBlock = async () => {
    const allIds = new Set(users.map((user) => user.id));

    // Если все пользователи отмечены
    if (selectedIds.size === users.length) {
      for (const id of allIds) {
        await updateDoc(doc(db, "users", id), { status: "blocked" });
        // Логика для логаута, если блокируется сам пользователь
        if (id === user?.uid) {
          await handleLogout();
        }
      }
      setUsers((prev) =>
        prev.map((user) => ({ ...user, status: "blocked" }))
      );
    } else {
      // Блокировать только выбранных пользователей
      for (const id of selectedIds) {
        await updateDoc(doc(db, "users", id), { status: "blocked" });
        // Логика для логаута, если блокируется сам пользователь
        if (id === user?.uid) {
          await handleLogout();
        }
      }
      setUsers((prev) =>
        prev.map((user) =>
          selectedIds.has(user.id) ? { ...user, status: "blocked" } : user
        )
      );
    }
  };

  const handleUnblock = async () => {
    for (const id of selectedIds) {
      await updateDoc(doc(db, "users", id), { status: "active" });
    }
    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.has(user.id) ? { ...user, status: "active" } : user
      )
    );
  };

  const handleDelete = async () => {
    for (const id of selectedIds) {
      await deleteDoc(doc(db, "users", id));
      // Логика для логаута, если удаляется сам пользователь
      if (id === user?.uid) {
        await handleLogout();
      }
    }
    setUsers((prev) => prev.filter((user) => !selectedIds.has(user.id)));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      alert("Вы вышли из системы");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-light">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-primary">
          Выйти
        </button>
      </header>

      <div className="bg-white p-4 rounded shadow-sm">
        <p className="h5">User Email: {user?.email}</p>
        <div className="mb-4">
          <button onClick={handleBlock} className="btn btn-danger me-2">
            Заблокировать
          </button>
          <button onClick={handleUnblock} className="btn btn-warning me-2">
            Разблокировать
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            Удалить
          </button>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th scope="col">Email</th>
              <th scope="col">Name</th>
              <th scope="col">Последний вход</th>
              <th scope="col">Время регистрации</th>
              <th scope="col">Статус</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => handleSelect(user.id)}
                  />
                </td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin.seconds * 1000).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  {user.registrationTime
                    ? new Date(
                        user.registrationTime.seconds * 1000
                      ).toLocaleString()
                    : "N/A"}
                </td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrivatePage;
