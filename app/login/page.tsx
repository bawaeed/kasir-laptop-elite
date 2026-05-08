"use client";

import { signIn } from "next-auth/react"; 
import { LogIn, Laptop2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res: any = await signIn("credentials", {
        username,
        password,
        redirect: false, 
      });

      if (res?.error) {
        setErrorMsg("Username atau Password salah!");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg("Koneksi ke server gagal.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 px-4 font-sans text-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <Laptop2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Elite Gear</h1>
          <p className="text-slate-500 text-sm mt-1">Sistem Kasir & Stok Lokal</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
              placeholder="Masukkan username..." 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
              placeholder="Masukkan password..." 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            }`}
          >
            {isLoading ? "Memverifikasi..." : <><LogIn size={20} /> Masuk Ke Dashboard</>}
          </button>
        </form>
      </div>
    </div>
  );
}