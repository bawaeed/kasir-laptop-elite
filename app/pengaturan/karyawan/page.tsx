import { pool, catatLog } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { UserPlus, Users, ShieldCheck, Trash2, UserCog } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ManajemenKaryawanPage() {
  // 🔒 PROTEKSI: Hanya Admin yang boleh masuk
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";
  if (!isAdmin) redirect("/");

  // Ambil daftar user dari database
  const result = await pool.query('SELECT id, username, role FROM "Users" ORDER BY role ASC');
  const allUsers = result.rows;

  async function tambahKaryawan(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const session = await auth();
    const activeUser = session?.user?.name || "Admin";

    try {
      // Cek apakah username sudah dipakai
      const cekUser = await pool.query('SELECT id FROM "Users" WHERE username = $1', [username]);
      if (cekUser.rows.length > 0) return; // Tambahkan handling error jika perlu

      const hashedPw = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO "Users" (username, password, role) VALUES ($1, $2, $3)',
        [username, hashedPw, role]
      );

      await catatLog(activeUser, "TAMBAH AKUN", `Mendaftarkan user baru: ${username} sebagai ${role}`);
      revalidatePath("/pengaturan/karyawan");
    } catch (error) {
      console.error("Gagal tambah karyawan:", error);
    }
  }

  async function hapusKaryawan(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const targetUsername = formData.get("username");

    const session = await auth();
    const activeUser = session?.user?.name || "Admin";

    // Mencegah menghapus diri sendiri atau akun admin utama
    if (targetUsername === "admin") return;

    try {
      await pool.query('DELETE FROM "Users" WHERE id = $1', [id]);
      await catatLog(activeUser, "HAPUS AKUN", `Menghapus akses user: ${targetUsername}`);
      revalidatePath("/pengaturan/karyawan");
    } catch (error) {
      console.error("Gagal hapus karyawan:", error);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
          <UserCog size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Karyawan</h1>
          <p className="text-sm text-gray-500">Daftarkan akun kasir baru dan kelola hak akses toko Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORM TAMBAH AKUN */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" /> Akun Baru
            </h2>
            <form action={tambahKaryawan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                <input name="username" type="text" required className="w-full border rounded-lg p-2.5 text-sm" placeholder="misal: kasir_budi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input name="password" type="password" required className="w-full border rounded-lg p-2.5 text-sm" placeholder="******" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pangkat (Role)</label>
                <select name="role" className="w-full border rounded-lg p-2.5 text-sm bg-gray-50">
                  <option value="kasir">Kasir (Terbatas)</option>
                  <option value="admin">Admin (Akses Penuh)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition">
                Daftarkan User
              </button>
            </form>
          </div>
        </div>

        {/* DAFTAR AKUN TERDAFTAR */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
              <Users size={18} className="text-gray-600" />
              <h2 className="font-bold">Daftar Pengguna Aktif</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Pangkat</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.username !== 'admin' && (
                        <form action={hapusKaryawan} className="flex justify-center">
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="username" value={user.username} />
                          <button type="submit" className="text-gray-400 hover:text-red-600 transition">
                            <Trash2 size={18} />
                          </button>
                        </form>
                      )}
                      {user.username === 'admin' && (
                        <div className="flex justify-center text-gray-300">
                          <ShieldCheck size={18} />
                        </div>
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