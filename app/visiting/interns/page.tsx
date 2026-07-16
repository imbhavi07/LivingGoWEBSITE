"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/Button";
type Intern = {
  id: string;
  name: string;
  username: string;
  active: boolean;
};

export default function InternPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadInterns() {
    const res = await apiClient.get("/visiting/interns", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
      },
    });

    setInterns(res.data.interns);
  }

  useEffect(() => {
    loadInterns();
  }, []);

  async function createIntern() {
    if (!name || !password) {
      alert("Please enter both name and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post(
        "/visiting/interns",
        { name,phone,password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
          },
        }
      );

      alert("Intern Created Successfully");

      setName("");
      setPhone("");
      setPassword("");
      loadInterns();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-10">

      <h1 className="text-4xl font-black mb-8">
        Intern Management
      </h1>

      <div className="rounded-xl border bg-white p-6 mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Create Intern
        </h2>

        <input
          placeholder="Intern Name"
          className="border rounded p-3 w-full mb-4"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />
        <input
          placeholder="Phone Number"
          className="border rounded p-3 w-full mb-4"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-3 w-full mb-4"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={createIntern}
          disabled={loading}
          className="bg-black text-white rounded px-6 py-3"
        >
          Create Intern
        </button>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="text-2xl font-bold mb-6">
          Existing Interns
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left">

              <th>Name</th>
              <th>Username</th>
              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {interns.map((intern)=>(
              <tr
                key={intern.id}
                className="border-t h-14"
              >
                <td>{intern.name}</td>
                <td>{intern.username}</td>
                <td>
                  {intern.active ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}