"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setBanners((data || []) as Banner[]);
    } catch (error) {
      console.error(error);
      alert("Error cargando banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const uploadBannerImage = async () => {
    if (!file) {
      alert("Debes seleccionar una imagen.");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `home/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      alert(uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("banners").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createBanner = async () => {
    if (!file) {
      alert("Selecciona una imagen para el banner.");
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadBannerImage();

      if (!imageUrl) return;

      const { error } = await supabase.from("banners").insert({
        title: title.trim() || null,
        image_url: imageUrl,
        link_url: linkUrl.trim() || null,
        sort_order: Number(sortOrder) || 0,
        is_active: true,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setTitle("");
      setLinkUrl("");
      setSortOrder("0");
      setFile(null);

      const input = document.getElementById(
        "banner-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      await loadBanners();

      alert("Banner creado correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error creando banner.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBanner = async (banner: Banner) => {
    const { error } = await supabase
      .from("banners")
      .update({
        is_active: !banner.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadBanners();
  };

  const updateBanner = async (banner: Banner) => {
    const newTitle = prompt("Título del banner:", banner.title || "");
    if (newTitle === null) return;

    const newLink = prompt("Link del banner:", banner.link_url || "");
    if (newLink === null) return;

    const newOrder = prompt(
      "Orden del banner:",
      String(banner.sort_order ?? 0)
    );
    if (newOrder === null) return;

    const { error } = await supabase
      .from("banners")
      .update({
        title: newTitle.trim() || null,
        link_url: newLink.trim() || null,
        sort_order: Number(newOrder) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadBanners();
  };

  const replaceImage = async (banner: Banner) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const selectedFile = input.files?.[0];

      if (!selectedFile) return;

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const filePath = `home/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from("banners")
        .update({
          image_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", banner.id);

      if (error) {
        alert(error.message);
        return;
      }

      await loadBanners();
      alert("Imagen reemplazada correctamente.");
    };

    input.click();
  };

  const deleteBanner = async (id: string) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar este banner?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadBanners();
  };

  if (loading) {
    return <p>Cargando banners...</p>;
  }

  return (
    <section className="mt-10 rounded-2xl border bg-white p-5 shadow">
      <h2 className="text-xl font-bold">Banners de portada</h2>

      <p className="mt-1 text-sm text-slate-600">
        Administra los anuncios dinámicos que aparecen en la portada de
        MiMotor.
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <h3 className="mb-4 font-bold">Crear nuevo banner</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título interno del banner"
            className="rounded-lg border px-3 py-2"
          />

          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link al hacer clic, opcional"
            className="rounded-lg border px-3 py-2"
          />

          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="Orden"
            type="number"
            className="rounded-lg border px-3 py-2"
          />

          <input
            id="banner-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-lg border px-3 py-2"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Tamaño recomendado: 1600 x 450 px o 1920 x 500 px.
        </p>

        <button
          type="button"
          onClick={createBanner}
          disabled={saving}
          className="mt-4 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:bg-slate-400"
        >
          {saving ? "Guardando..." : "Crear banner"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {banners.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
            Todavía no tienes banners creados.
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={banner.image_url}
                    alt={banner.title || "Banner"}
                    className="h-32 w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold">
                        {banner.title || "Banner sin título"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        Orden: {banner.sort_order ?? 0}
                      </p>

                      <p className="text-sm">
                        Estado:{" "}
                        <span
                          className={
                            banner.is_active
                              ? "font-semibold text-green-700"
                              : "font-semibold text-red-700"
                          }
                        >
                          {banner.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </p>

                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          className="mt-1 block text-sm text-blue-700 underline"
                        >
                          Ver link
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleBanner(banner)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                          banner.is_active ? "bg-orange-600" : "bg-green-600"
                        }`}
                      >
                        {banner.is_active ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateBanner(banner)}
                        className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Editar datos
                      </button>

                      <button
                        type="button"
                        onClick={() => replaceImage(banner)}
                        className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Cambiar imagen
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBanner(banner.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}