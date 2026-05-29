"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CuentaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userEmail, setUserEmail] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    user_type: "particular",
    business_name: "",
  });

  const loadProfile = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        alert(sessionError.message);
        return;
      }

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const user = sessionData.session.user;
      setUserEmail(user.email || "");

      const metadata = user.user_metadata || {};

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        alert(profileError.message);
        return;
      }

      if (!profile) {
        const newProfile = {
          id: user.id,
          first_name: metadata.first_name || metadata.given_name || "",
          last_name: metadata.last_name || metadata.family_name || "",
          full_name:
            metadata.full_name ||
            metadata.name ||
            `${metadata.first_name || ""} ${metadata.last_name || ""}`.trim(),
          phone: metadata.phone || "",
          user_type: metadata.user_type || "particular",
          business_name: metadata.business_name || null,
          avatar_url: metadata.avatar_url || "",
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .upsert(newProfile);

        if (insertError) {
          alert(insertError.message);
          return;
        }

        setForm({
          first_name: newProfile.first_name,
          last_name: newProfile.last_name,
          phone: newProfile.phone,
          user_type: newProfile.user_type,
          business_name: newProfile.business_name || "",
        });
      } else {
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          user_type: profile.user_type || "particular",
          business_name: profile.business_name || "",
        });
      }
    } catch (error) {
      console.error(error);
      alert("Error cargando la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async () => {
    if (!form.first_name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (!form.phone.trim()) {
      alert("El teléfono o WhatsApp es obligatorio.");
      return;
    }

    if (form.user_type === "automotora" && !form.business_name.trim()) {
      alert("Debes ingresar el nombre de la automotora.");
      return;
    }

    setSaving(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        alert(sessionError.message);
        return;
      }

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const user = sessionData.session.user;

      const fullName = `${form.first_name} ${form.last_name}`.trim();

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: fullName,
        phone: form.phone,
        user_type: form.user_type,
        business_name:
          form.user_type === "automotora" ? form.business_name : null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Datos de la cuenta actualizados correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error guardando la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p>Cargando cuenta...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Mi cuenta</h1>

        <p className="mb-6 text-sm text-slate-600">
          Modifica los datos asociados a tu cuenta de MiMotor.
        </p>

        <label className="mb-2 block text-sm font-medium">Correo</label>
        <input
          value={userEmail}
          disabled
          className="mb-4 w-full rounded-lg border bg-slate-100 px-3 py-2 text-slate-500"
        />

        <label className="mb-2 block text-sm font-medium">Nombre</label>
        <input
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          placeholder="Ej: Juan"
          className="mb-4 w-full rounded-lg border px-3 py-2"
        />

        <label className="mb-2 block text-sm font-medium">Apellido</label>
        <input
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          placeholder="Ej: Pérez"
          className="mb-4 w-full rounded-lg border px-3 py-2"
        />

        <label className="mb-2 block text-sm font-medium">
          Teléfono o WhatsApp
        </label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Ej: 56912345678"
          className="mb-4 w-full rounded-lg border px-3 py-2"
        />

        <label className="mb-2 block text-sm font-medium">
          Tipo de usuario
        </label>
        <select
          value={form.user_type}
          onChange={(e) => setForm({ ...form, user_type: e.target.value })}
          className="mb-4 w-full rounded-lg border px-3 py-2"
        >
          <option value="particular">Particular</option>
          <option value="automotora">Automotora</option>
        </select>

        {form.user_type === "automotora" && (
          <>
            <label className="mb-2 block text-sm font-medium">
              Nombre de la automotora
            </label>
            <input
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
              placeholder="Ej: Automotora Los Andes"
              className="mb-6 w-full rounded-lg border px-3 py-2"
            />
          </>
        )}

        {form.user_type !== "automotora" && <div className="mb-6" />}

        <button
          onClick={updateProfile}
          disabled={saving}
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </main>
  );
}