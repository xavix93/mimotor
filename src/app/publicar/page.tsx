"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PreviewImage = {
  file: File;
  previewUrl: string;
};

export default function PublicarPage() {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<PreviewImage[]>([]);

  const MAX_IMAGES = 20;

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    region: "",
    commune: "",
    fuel_type: "",
    transmission: "",
    color: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectImages = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);

    if (selectedImages.length + filesArray.length > MAX_IMAGES) {
      alert(`Puedes subir un máximo de ${MAX_IMAGES} fotos.`);
      return;
    }

    const newImages = filesArray.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...newImages]);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...selectedImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setSelectedImages(newImages);
  };

  const removeImage = (index: number) => {
    const confirmDelete = confirm("¿Seguro que deseas quitar esta foto?");
    if (!confirmDelete) return;

    setSelectedImages((current) => current.filter((_, i) => i !== index));
  };

  const publishCar = async () => {
    if (loading) return;

    const requiredFields = [
      { key: "brand", label: "Marca" },
      { key: "model", label: "Modelo" },
      { key: "year", label: "Año" },
      { key: "price", label: "Precio" },
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = form[field.key as keyof typeof form];
      return !String(value).trim();
    });

    if (missingFields.length > 0) {
      alert(
        `Faltan los siguientes campos obligatorios:\n\n${missingFields
          .map((field) => `- ${field.label}`)
          .join("\n")}`
      );
      return;
    }

    if (selectedImages.length > MAX_IMAGES) {
      alert(`Puedes subir un máximo de ${MAX_IMAGES} fotos.`);
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      alert("Debes iniciar sesión para publicar.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    const user = sessionData.session.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, phone, user_type, business_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("Primero completa tus datos en Mi cuenta antes de publicar.");
      setLoading(false);
      window.location.href = "/cuenta";
      return;
    }

    if (!profile.phone) {
      alert("Debes completar tu teléfono en Mi cuenta antes de publicar.");
      setLoading(false);
      window.location.href = "/cuenta";
      return;
    }

    if (profile.user_type === "automotora" && !profile.business_name) {
      alert(
        "Debes completar el nombre de tu automotora en Mi cuenta antes de publicar."
      );
      setLoading(false);
      window.location.href = "/cuenta";
      return;
    }

    if (profile.user_type !== "automotora" && !profile.first_name) {
      alert("Debes completar tu nombre en Mi cuenta antes de publicar.");
      setLoading(false);
      window.location.href = "/cuenta";
      return;
    }

    const sellerName =
      profile.user_type === "automotora"
        ? profile.business_name
        : profile.first_name;

    const { data: car, error: carError } = await supabase
      .from("cars")
      .insert({
        user_id: user.id,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : null,
        region: form.region || null,
        commune: form.commune || null,
        fuel_type: form.fuel_type || null,
        transmission: form.transmission || null,
        color: form.color || null,
        description: form.description || null,
        seller_name: sellerName,
        seller_phone: profile.phone,
        status: "pending",
      })
      .select()
      .single();

    if (carError || !car) {
      alert(carError?.message || "Error al publicar el auto.");
      setLoading(false);
      return;
    }

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i].file;

      const safeFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-");

      const filePath = `${user.id}/${car.id}/${Date.now()}-${i}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(filePath, file);

      if (uploadError) {
        alert(`Error subiendo foto ${i + 1}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(filePath);

      const { error: imageInsertError } = await supabase
        .from("car_images")
        .insert({
          car_id: car.id,
          image_url: publicUrlData.publicUrl,
          sort_order: i,
        });

      if (imageInsertError) {
        alert(`Error guardando foto ${i + 1}: ${imageInsertError.message}`);
      }
    }

    setLoading(false);
    alert("Auto publicado correctamente. Quedará pendiente de aprobación.");
    window.location.href = "/dashboard";
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Publicar auto</h1>

        <p className="mb-6 text-sm text-slate-600">
          Completa los datos del vehículo para publicarlo en MiMotor.
        </p>

        <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          Los datos de contacto del vendedor se tomarán automáticamente desde
          tu sección “Mi cuenta”.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="brand"
            placeholder="Marca"
            value={form.brand}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="model"
            placeholder="Modelo"
            value={form.model}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="year"
            placeholder="Año"
            type="number"
            value={form.year}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="price"
            placeholder="Precio"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="mileage"
            placeholder="Kilometraje"
            type="number"
            value={form.mileage}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="region"
            placeholder="Región"
            value={form.region}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="commune"
            placeholder="Comuna"
            value={form.commune}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <select
            name="fuel_type"
            value={form.fuel_type}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">Tipo de combustible</option>
            <option value="Bencina">Bencina</option>
            <option value="Diésel">Diésel</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Eléctrico">Eléctrico</option>
          </select>

          <select
            name="transmission"
            value={form.transmission}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">Transmisión</option>
            <option value="Manual">Manual</option>
            <option value="Automática">Automática</option>
          </select>

          <input
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />
        </div>

        <textarea
          name="description"
          placeholder="Descripción del vehículo"
          value={form.description}
          onChange={handleChange}
          className="mt-4 h-32 w-full rounded-lg border px-3 py-2"
        />

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium">
            Fotos del vehículo
          </label>

          <label className="inline-block cursor-pointer rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700">
            Seleccionar fotos
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleSelectImages(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          <p className="mt-2 text-sm text-slate-500">
            {selectedImages.length > 0
              ? `${selectedImages.length} foto(s) seleccionada(s). Máximo ${MAX_IMAGES}.`
              : `Puedes seleccionar hasta ${MAX_IMAGES} fotos.`}
          </p>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Orden de las fotos</h2>

            <p className="mb-4 text-sm text-slate-600">
              La primera foto será la imagen principal de la publicación.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {selectedImages.map((image, index) => (
                <div
                  key={image.previewUrl}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <div className="relative">
                    <img
                      src={image.previewUrl}
                      alt={`Foto ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">
                        Principal
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="rounded-lg border px-2 py-1 text-sm disabled:opacity-40"
                    >
                      Subir
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === selectedImages.length - 1}
                      className="rounded-lg border px-2 py-1 text-sm disabled:opacity-40"
                    >
                      Bajar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="w-full bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Quitar foto
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={publishCar}
          disabled={loading}
          className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
        >
          {loading ? "Publicando..." : "Publicar auto"}
        </button>
      </div>
    </main>
  );
}