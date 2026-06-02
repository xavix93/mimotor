"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FavoritesInAccount from "@/components/FavoritesInAccount";

type TabType = "perfil" | "favoritos" | "premium";

export default function CuentaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("perfil");

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

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
      setUserId(user.id);

      const metadata = user.user_metadata || {};

      const googleFullName = metadata.full_name || metadata.name || "";
      const nameParts = googleFullName.trim().split(" ");

      const firstNameFromGoogle =
        metadata.first_name || metadata.given_name || nameParts[0] || "";

      const lastNameFromGoogle =
        metadata.last_name ||
        metadata.family_name ||
        nameParts.slice(1).join(" ") ||
        "";

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
          first_name: firstNameFromGoogle,
          last_name: lastNameFromGoogle,
          full_name: `${firstNameFromGoogle} ${lastNameFromGoogle}`.trim(),
          phone: metadata.phone || "",
          user_type: metadata.user_type || "particular",
          business_name: metadata.business_name || null,
          avatar_url: metadata.avatar_url || metadata.picture || "",
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
        const firstName = profile.first_name || firstNameFromGoogle || "";
        const lastName = profile.last_name || lastNameFromGoogle || "";

        setForm({
          first_name: firstName,
          last_name: lastName,
          phone: profile.phone || "",
          user_type: profile.user_type || "particular",
          business_name: profile.business_name || "",
        });

        if (!profile.first_name && firstNameFromGoogle) {
          await supabase.from("profiles").upsert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            phone: profile.phone || "",
            user_type: profile.user_type || "particular",
            business_name: profile.business_name || null,
            avatar_url:
              profile.avatar_url ||
              metadata.avatar_url ||
              metadata.picture ||
              "",
            updated_at: new Date().toISOString(),
          });
        }
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

  const requestService = async (
    serviceType: string,
    serviceName: string,
    price: number,
    message: string
  ) => {
    if (!userId) {
      alert("Debes iniciar sesión para solicitar un servicio.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Antes de solicitar un servicio, completa tu teléfono en Mi cuenta.");
      setActiveTab("perfil");
      return;
    }

    setRequesting(true);

    const { error } = await supabase.from("service_requests").insert({
      user_id: userId,
      user_email: userEmail,
      user_phone: form.phone,
      business_name:
        form.user_type === "automotora" ? form.business_name : null,
      service_type: serviceType,
      service_name: serviceName,
      price,
      status: "pending",
      message,
    });

    setRequesting(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Solicitud enviada correctamente. Te contactaremos para confirmar el pago y activar el servicio."
    );
  };

  const premiumServices = [
    {
      type: "car_featured_7",
      name: "Auto destacado 7 días",
      price: 4990,
      description:
        "Tu publicación tendrá mayor visibilidad durante 7 días en MiMotor.",
      recommendedFor: "Ideal para vender más rápido.",
    },
    {
      type: "car_featured_30",
      name: "Auto destacado 30 días",
      price: 12990,
      description:
        "Tu publicación tendrá mayor visibilidad durante 30 días en MiMotor.",
      recommendedFor: "Ideal para autos de mayor valor.",
    },
    {
      type: "business_featured",
      name: "Automotora destacada",
      price: 29990,
      description:
        "Tu automotora podrá aparecer como destacada dentro de MiMotor.",
      recommendedFor: "Ideal para automotoras con varias publicaciones.",
    },
    {
      type: "business_banner",
      name: "Banner en publicaciones",
      price: 19990,
      description:
        "Permite mostrar un banner promocional de tu automotora en tus publicaciones.",
      recommendedFor: "Ideal para promociones, financiamiento o contacto.",
    },
    {
      type: "business_pack",
      name: "Pack automotora destacada + banner",
      price: 39990,
      description:
        "Incluye automotora destacada y banner promocional en tus publicaciones.",
      recommendedFor: "Ideal para automotoras que quieren más presencia.",
    },
  ];

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p>Cargando cuenta...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Mi cuenta</h1>

        <p className="mb-6 text-sm text-slate-600">
          Administra tus datos, favoritos y servicios premium de MiMotor.
        </p>

        <div className="mb-6 flex flex-wrap gap-2 border-b">
          <button
            type="button"
            onClick={() => setActiveTab("perfil")}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === "perfil"
                ? "border-b-2 border-blue-700 text-blue-700"
                : "text-slate-500"
            }`}
          >
            Datos de cuenta
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("favoritos")}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === "favoritos"
                ? "border-b-2 border-blue-700 text-blue-700"
                : "text-slate-500"
            }`}
          >
            Favoritos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("premium")}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === "premium"
                ? "border-b-2 border-blue-700 text-blue-700"
                : "text-slate-500"
            }`}
          >
            Servicios premium
          </button>
        </div>

        {activeTab === "perfil" && (
          <>
            <label className="mb-2 block text-sm font-medium">Correo</label>
            <input
              value={userEmail}
              disabled
              className="mb-4 w-full rounded-lg border bg-slate-100 px-3 py-2 text-slate-500"
            />

            <label className="mb-2 block text-sm font-medium">Nombre</label>
            <input
              value={form.first_name}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
              placeholder="Ej: Juan"
              className="mb-4 w-full rounded-lg border px-3 py-2"
            />

            <label className="mb-2 block text-sm font-medium">Apellido</label>
            <input
              value={form.last_name}
              onChange={(e) =>
                setForm({ ...form, last_name: e.target.value })
              }
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
              onChange={(e) =>
                setForm({ ...form, user_type: e.target.value })
              }
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
              type="button"
              onClick={updateProfile}
              disabled={saving}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </>
        )}

        {activeTab === "favoritos" && (
          <section>
            <h2 className="mb-2 text-xl font-bold">Mis favoritos</h2>
            <FavoritesInAccount />
          </section>
        )}

        {activeTab === "premium" && (
          <section>
            <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              Estos servicios se solicitan manualmente. Después de enviar la
              solicitud, MiMotor te contactará para confirmar el pago y activar
              el beneficio.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {premiumServices.map((service) => (
                <div
                  key={service.type}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <h2 className="text-lg font-bold">{service.name}</h2>

                  <p className="mt-2 text-2xl font-bold text-blue-700">
                    ${service.price.toLocaleString("es-CL")}
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {service.description}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {service.recommendedFor}
                  </p>

                  <button
                    type="button"
                    disabled={requesting}
                    onClick={() =>
                      requestService(
                        service.type,
                        service.name,
                        service.price,
                        `Solicitud desde Mi cuenta. Usuario: ${
                          form.first_name
                        } ${form.last_name}. Tipo: ${
                          form.user_type
                        }. Automotora: ${form.business_name || "No aplica"}.`
                      )
                    }
                    className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:bg-slate-400"
                  >
                    {requesting ? "Enviando..." : "Solicitar servicio"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              Próximamente podrás pagar directamente en línea. Por ahora, las
              solicitudes quedan registradas para gestión manual.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}