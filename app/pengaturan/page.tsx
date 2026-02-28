"use client"; // Wajib jadi client component

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { KeyRound, ShieldCheck } from "lucide-react";
import { gantiPasswordAction } from "./actions";

export default function PengaturanPage() {
  const [state, action] = useActionState(gantiPasswordAction, null);

  // Efek untuk memunculkan toast saat ada error
  useEffect(() => {
    if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
          <KeyRound size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Pengaturan Keamanan</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex items-center gap-2 mb-6 text-sm text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <ShieldCheck size={20} />
          <p>Setelah sandi berhasil diubah, Anda akan otomatis keluar dari sistem.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password Lama</label>
            <input name="passwordLama" type="password" required className="w-full border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password Baru</label>
            <input name="passwordBaru" type="password" required className="w-full border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all">
            Simpan Password Baru
          </button>
        </form>
      </div>
    </div>
  );
}