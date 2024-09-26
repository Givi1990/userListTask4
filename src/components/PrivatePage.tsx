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
    await Promise.all(
      Array.from(selectedIds).map((id) => updateDoc(doc(db, "users", id), { status: "blocked" }))
    );
    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.has(user.id) ? { ...user, status: "blocked" } : user
      )
    );
  };

  const handleUnblock = async () => {
    await Promise.all(
      Array.from(selectedIds).map((id) => updateDoc(doc(db, "users", id), { status: "active" }))
    );
    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.has(user.id) ? { ...user, status: "active" } : user
      )
    );
  };

  const handleDelete = async () => {
    await Promise.all(
      Array.from(selectedIds).map((id) => deleteDoc(doc(db, "users", id)))
    );
    setUsers((prev) => prev.filter((user) => !selectedIds.has(user.id)));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      alert("Вы вышли из системы");
    } catch (error) {
      console.error("Ошибка выхода", error);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ width: '800px' }}>
        <header className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h2 className="card-title">Административная панель</h2>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light"
          >
            Выйти
          </button>
        </header>

        <div className="card-body">
          <p className="font-weight-bold">Email пользователя: <span className="text-primary">{user?.email}</span></p>
          <div className="mb-3">
            <button
              onClick={handleBlock}
              className="btn btn-danger me-2"
            >
              Заблокировать
            </button>
            <button
              onClick={handleUnblock}
              className="btn btn-warning me-2"
            >
              Разблокировать
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Удалить
            </button>
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.size === users.length}
                  />
                </th>
                <th>Имя</th>
                <th>Email</th>
                <th>Статус</th>
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
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrivatePage;
