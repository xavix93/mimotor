"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(true);
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        const currentUser = data.session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await checkAdmin(currentUser.id);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error cargando sesión:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
    setIsAdmin(false);

    window.location.href = "/login";
  };

  if (loading) {
    return (
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-blue-700">
            MiMotor
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-blue-700">
              Autos
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-blue-700">
          MiMotor
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-blue-700">
            Autos
          </Link>

          {user && (
            <>
              <Link href="/publicar" className="hover:text-blue-700">
                Publicar
              </Link>

              <Link href="/dashboard" className="hover:text-blue-700">
                Mi panel
              </Link>

              <Link href="/cuenta" className="hover:text-blue-700">
                Mi cuenta
              </Link>

              {isAdmin && (
                <Link href="/admin" className="hover:text-blue-700">
                  Admin
                </Link>
              )}
            </>
          )}

          {!user ? (
            <Link
              href="/login"
              className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
            >
              Ingresar
            </Link>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border px-4 py-2 font-semibold hover:bg-slate-100"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}