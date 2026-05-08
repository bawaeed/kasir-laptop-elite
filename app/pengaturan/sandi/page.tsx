import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import FormGantiSandi from "./FormGantiSandi"; 

export default async function PengaturanSandiPage() {
  const session = await auth();

  // 1. Cek Login saja, JANGAN cek role admin
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
          <KeyRound className="text-blue-600" /> Pengaturan Keamanan
        </h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="mb-6 text-sm text-slate-500">
            User: <span className="font-bold text-slate-700">{session.user?.name}</span>
          </p>
          <FormGantiSandi />
        </div>
      </div>
    </div>
  );
}