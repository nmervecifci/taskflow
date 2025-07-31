"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Kayıt başarısız");
        return;
      }

      router.push("/login"); // kayıt başarılıysa login sayfasına yönlendir
    } catch (err) {
      setError("Sunucu hatası");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Kayıt Ol</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2">Şifre</label>
        <input
          type="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}
