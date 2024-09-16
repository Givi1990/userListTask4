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
      const q = query(collection(db, "users"));
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
    <div className="min-h-screen p-8 bg-gray-100 flrx flex-col">
      <header className="flex justify-between items-center mb-6">
        <h1 className="flex justify-between items-center mb-6">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          Log out
        </button>
      </header>

      <div className="flex flex-col bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-4">User Email: {user?.email}</p>
        <div className="mb-4 flex space-x-2">
          <button
            onClick={handleBlock}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
          >
            Block
          </button>
          <button
            onClick={handleUnblock}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition"
          >
            Unblock
          </button>
          <button
            onClick={handleDelete}
            className="g-red-600 text-black px-4 py-2 rounded shadow hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="p-3 text-left">
                <input type="checkbox" onChange={handleSelectAll} />
              </th>

              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Last Login</th>
              <th className="p-3 text-left">Registration Time</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => handleSelect(user.id)}
                  />
                </td>

                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">
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
                <td className="p-3">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrivatePage;
