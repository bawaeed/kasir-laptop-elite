import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { LogIn, Laptop2, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

// Mengambil parameter dari URL untuk mendeteksi error
type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = params?.error;

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

        {/* MUNCULKAN PESAN ERROR JIKA GAGAL LOGIN */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-pulse">
            <AlertCircle size={18} />
            Username atau Password salah!
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            try {
              // Mencoba login, jika sukses akan otomatis ke halaman Utama ("/")
              await signIn("credentials", formData, { redirectTo: "/" });
            } catch (error) {
              // Menangkap error jika login gagal
              if (error instanceof AuthError) {
                if (error.type === 'CredentialsSignin') {
                  // Arahkan kembali ke halaman login sambil membawa pesan error
                  redirect("/login?error=CredentialsSignin");
                }
              }
              // Wajib ada untuk membiarkan Next.js melakukan redirect jika sukses
              throw error; 
            }
          }}
          className="space-y-5"
        >
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
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 mt-2 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Masuk Ke Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}