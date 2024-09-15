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
  lastLogin?: { seconds: number }; // Firestore Timestamp
  registrationTime?: { seconds: number }; // Firestore Timestamp
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
    <div>
      <p>User Email: {user?.email}</p>
      <div>
        <button onClick={handleBlock} className="bg-red-500 text-white p-2">
          Block
        </button>
        <button onClick={handleUnblock} className="p-2">
          Unblock
        </button>
        <button onClick={handleDelete} className="p-2">
          Delete
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th>ID</th>
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
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default PrivatePage;
