"use client";

import { useState } from "react";
import { gantiSandiAction } from "./action";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

export default function FormGantiSandi() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const res = await gantiSandiAction(formData);

    if (res?.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Kata sandi berhasil diperbarui!" });
      (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kata Sandi Lama</label>
        <input name="old_password" type="password" required className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kata Sandi Baru</label>
        <input name="new_password" type="password" required className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        Perbarui Kata Sandi
      </button>
    </form>
  );
}