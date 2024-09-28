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
    for (const id of selectedIds) {
      await updateDoc(doc(db, "users", id), { status: "blocked" });

      // Проверяем, является ли текущий пользователь тем, кого мы блокируем
      if (id === user?.uid) {
        await logout();
        navigate("/");
      }
    }
    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.has(user.id) ? { ...user, status: "blocked" } : user
      )
    );
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

      // Проверяем, является ли текущий пользователь тем, кого мы удаляем
      if (id === user?.uid) {
        await logout();
        navigate("/");
      }
    }
    setUsers((prev) => prev.filter((user) => !selectedIds.has(user.id)));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      alert("You are logged out");
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-light">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-primary">
          Log out
        </button>
      </header>

      <div className="bg-white p-4 rounded shadow">
        <p className="h5">User Email: {user?.email}</p>
        <div className="mb-4">
          <button onClick={handleBlock} className="btn btn-danger me-2">
            Block
          </button>
          <button onClick={handleUnblock} className="btn btn-warning me-2">
            Unblock
          </button>
          <button onClick={handleDelete} className="btn btn-secondary">
            Delete
          </button>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th>Email</th>
              <th>Name</th>
              <th>Last Login</th>
              <th>Registration Time</th>
              <th>Status</th>
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
                    ? new Date(user.registrationTime.seconds * 1000).toLocaleString()
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
