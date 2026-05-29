"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("particular");

  const register = async () => {
    if (!email || !password || !firstName) {
      alert("Completa nombre, correo y contraseña.");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          phone,
          user_type: userType,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone,
        user_type: userType,
      });

      if (profileError) {
        alert(profileError.message);
        return;
      }
    }

    alert("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
    setMode("login");
  };

  const login = async () => {
    if (!email || !password) {
      alert("Ingresa correo y contraseña.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/";
  };

  const loginWithProvider = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/cuenta`,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          {mode === "login" ? "Ingresar a MiMotor" : "Crear cuenta en MiMotor"}
        </h1>

        <p className="mb-6 text-sm text-slate-600">
          {mode === "login"
            ? "Accede a tu cuenta para publicar y administrar tus vehículos."
            : "Crea tu perfil para publicar vehículos en MiMotor."}
        </p>

        <div className="mb-5 grid gap-3">
          <button
            type="button"
            onClick={() => loginWithProvider("google")}
            className="rounded-lg border px-4 py-2 font-semibold"
          >
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={() => loginWithProvider("facebook")}
            className="rounded-lg border px-4 py-2 font-semibold"
          >
            Continuar con Facebook
          </button>
        </div>

        <div className="my-5 border-t" />

        {mode === "register" && (
          <>
            <label className="mb-2 block text-sm font-medium">Nombre</label>
            <input
              className="mb-4 w-full rounded-lg border px-3 py-2"
              type="text"
              placeholder="Ej: Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">Apellido</label>
            <input
              className="mb-4 w-full rounded-lg border px-3 py-2"
              type="text"
              placeholder="Ej: Perez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">
              Teléfono o WhatsApp
            </label>
            <input
              className="mb-4 w-full rounded-lg border px-3 py-2"
              type="text"
              placeholder="Ej: 56912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">
              Tipo de usuario
            </label>
            <select
              className="mb-4 w-full rounded-lg border px-3 py-2"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="particular">Particular</option>
              <option value="automotora">Automotora</option>
            </select>
          </>
        )}

        <label className="mb-2 block text-sm font-medium">
          Correo electrónico
        </label>
        <input
          className="mb-4 w-full rounded-lg border px-3 py-2"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-2 block text-sm font-medium">Contraseña</label>
        <input
          className="mb-6 w-full rounded-lg border px-3 py-2"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "login" ? (
          <>
            <button
              type="button"
              onClick={login}
              className="mb-3 w-full rounded-lg bg-blue-700 py-2 font-semibold text-white"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => setMode("register")}
              className="w-full rounded-lg border py-2 font-semibold"
            >
              Crear cuenta
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={register}
              className="mb-3 w-full rounded-lg bg-blue-700 py-2 font-semibold text-white"
            >
              Registrarme
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full rounded-lg border py-2 font-semibold"
            >
              Ya tengo cuenta
            </button>
          </>
        )}
      </div>
    </main>
  );
}