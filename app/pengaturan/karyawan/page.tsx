import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma, catatLog } from "@/lib/db";
import { Users, UserPlus, Trash2, ShieldCheck, UserCog } from "lucide-react";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // 👈 Pastikan pakai bcryptjs agar tidak error build

export const dynamic = "force-dynamic";

export default async function KaryawanPage() {
  const session = await auth();

  // 🛡️ PROTEKSI: Hanya Admin yang bisa masuk
  if (!session || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Ambil data dari database
  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
  });

  // Fungsi Tambah User (Server Action)
  async function addKaryawan(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!username || !password) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await prisma.user.create({
        data: { username, password: hashedPassword, role },
      });
      await catatLog(Number((session?.user as any)?.id), "TAMBAH_USER", `User: ${username}`);
      revalidatePath("/pengaturan/karyawan");
    } catch (error) {
      console.error("Gagal tambah user:", error);
    }
  }

  // Fungsi Hapus User (Server Action)
  async function deleteKaryawan(id: number, username: string) {
    "use server";
    if (username === "admin") return; // Admin utama tidak boleh dihapus
    try {
      await prisma.user.delete({ where: { id } });
      await catatLog(Number((session?.user as any)?.id), "HAPUS_USER", `User: ${username}`);
      revalidatePath("/pengaturan/karyawan");
    } catch (error) {
      console.error("Gagal hapus user:", error);
    }
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-blue-600" /> Manajemen Karyawan
            </h1>
            <p className="text-slate-500">Kelola akun dan hak akses staf Anda.</p>
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center gap-2 border border-blue-200">
            <ShieldCheck size={20} /> Akses Administrator
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM TAMBAH (KIRI) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" /> Tambah Akun Baru
            </h2>
            <form action={addKaryawan} className="space-y-4">
              <input name="username" placeholder="Username" required className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="password" type="password" placeholder="Password" required className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
              <select name="role" className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                <option value="karyawan">Role: Karyawan</option>
                <option value="admin">Role: Admin</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all">
                Simpan Akun
              </button>
            </form>
          </div>

          {/* TABEL LIST (KANAN) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">User</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{u.username}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {u.username !== 'admin' && (
                        <form action={async () => {
                          "use server";
                          await deleteKaryawan(u.id, u.username);
                        }}>
                          <button type="submit" className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}