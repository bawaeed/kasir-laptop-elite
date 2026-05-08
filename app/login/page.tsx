"use client"; // ✅ DIUBAH: Menggunakan Client Component agar navigasi lebih mulus

import { signIn } from "next-auth/react"; // Import dari /react untuk client side
import { LogIn, Laptop2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // 🚀 Mengeksekusi Login via NextAuth
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false, // 🛑 Jangan redirect otomatis, biar kita yang atur
      });

      if (res?.error) {
        setErrorMsg("Username atau Password salah!");
        setIsLoading(false);
      } else if (res?.ok) {
        // ✅ JIKA SUKSES, TENDANG KE DASHBOARD
        router.push("/dashboard");
        router.refresh(); // Wajib agar layout tahu user sudah login
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan sistem. Coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Laptop2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Elite Gear Admin</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Silakan masuk untuk mengelola sistem.</p>
        </div>

        {/* 🚨 MUNCULKAN PESAN ERROR JIKA GAGAL LOGIN */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-pulse">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {/* 📝 FORM LOGIN CLIENT-SIDE */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
            <input 
              name="username" 
              type="text" 
              required 
              className="w-full border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
              placeholder="username" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
              placeholder="password" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            }`}
          >
            {isLoading ? (
              <span className="animate-pulse">Memverifikasi...</span>
            ) : (
              <>
                <LogIn size={20} /> Masuk Ke Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}