"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PreviewImage = {
  file: File;
  previewUrl: string;
};

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  user_type: string | null;
  business_name: string | null;
};

export default function PublicarPage() {
  const MAX_IMAGES = 20;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedImages, setSelectedImages] = useState<PreviewImage[]>([]);

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

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error.message);
        window.location.href = "/login?redirect=/publicar";
        return;
      }

      const user = data.session?.user;

      if (!user) {
        window.location.href = "/login?redirect=/publicar";
        return;
      }

      setUserId(user.id);
      setCheckingSession(false);
    };

    checkSession();
  }, []);

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

    const onlyImages = filesArray.filter((file) =>
      file.type.startsWith("image/")
    );

    if (onlyImages.length !== filesArray.length) {
      alert("Solo puedes subir archivos de imagen.");
      return;
    }

    const newImages = onlyImages.map((file) => ({
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

  const validateForm = () => {
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
      return false;
    }

    const currentYear = new Date().getFullYear() + 1;
    const year = Number(form.year);
    const price = Number(form.price);

    if (Number.isNaN(year) || year < 1900 || year > currentYear) {
      alert("Ingresa un año válido.");
      return false;
    }

    if (Number.isNaN(price) || price <= 0) {
      alert("Ingresa un precio válido.");
      return false;
    }

    if (form.mileage && Number(form.mileage) < 0) {
      alert("El kilometraje no puede ser negativo.");
      return false;
    }

    if (selectedImages.length > MAX_IMAGES) {
      alert(`Puedes subir un máximo de ${MAX_IMAGES} fotos.`);
      return false;
    }

    return true;
  };

  const getProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, user_type, business_name")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      alert(error.message);
      return null;
    }

    if (!data) {
      alert("Primero completa tus datos en Mi cuenta antes de publicar.");
      window.location.href = "/cuenta";
      return null;
    }

    return data as Profile;
  };

  const validateProfile = (profile: Profile) => {
    if (!profile.phone?.trim()) {
      alert("Debes completar tu teléfono en Mi cuenta antes de publicar.");
      window.location.href = "/cuenta";
      return false;
    }

    if (profile.user_type === "automotora" && !profile.business_name?.trim()) {
      alert(
        "Debes completar el nombre de tu automotora en Mi cuenta antes de publicar."
      );
      window.location.href = "/cuenta";
      return false;
    }

    if (profile.user_type !== "automotora" && !profile.first_name?.trim()) {
      alert("Debes completar tu nombre en Mi cuenta antes de publicar.");
      window.location.href = "/cuenta";
      return false;
    }

    return true;
  };

  const uploadCarImages = async (carId: string) => {
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i].file;

      const safeFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-");

      const filePath = `${userId}/${carId}/${Date.now()}-${i}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

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
          car_id: carId,
          image_url: publicUrlData.publicUrl,
          sort_order: i,
        });

      if (imageInsertError) {
        alert(`Error guardando foto ${i + 1}: ${imageInsertError.message}`);
      }
    }
  };

  const publishCar = async () => {
    if (loading) return;

    if (!userId) {
      alert("Debes iniciar sesión para publicar.");
      window.location.href = "/login?redirect=/publicar";
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const profile = await getProfile();

      if (!profile) {
        setLoading(false);
        return;
      }

      if (!validateProfile(profile)) {
        setLoading(false);
        return;
      }

      const sellerName =
        profile.user_type === "automotora"
          ? profile.business_name
          : `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

      const { data: car, error: carError } = await supabase
        .from("cars")
        .insert({
          user_id: userId,
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: Number(form.year),
          price: Number(form.price),
          mileage: form.mileage ? Number(form.mileage) : null,
          region: form.region.trim() || null,
          commune: form.commune.trim() || null,
          fuel_type: form.fuel_type || null,
          transmission: form.transmission || null,
          color: form.color.trim() || null,
          description: form.description.trim() || null,
          seller_name: sellerName || null,
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

      await uploadCarImages(car.id);

      alert("Auto publicado correctamente. Quedará pendiente de aprobación.");
      window.location.href = "/cuenta";
    } catch (error) {
      console.error(error);
      alert("Error inesperado al publicar.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p>Verificando sesión...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Publicar auto</h1>

        <p className="mb-6 text-sm text-slate-600">
          Completa los datos del vehículo para publicarlo en MiMotor.
        </p>

        <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          Los datos de contacto del vendedor se tomarán automáticamente desde tu
          sección “Mi cuenta”.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="brand"
            placeholder="Marca *"
            value={form.brand}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="model"
            placeholder="Modelo *"
            value={form.model}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="year"
            placeholder="Año *"
            type="number"
            value={form.year}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="price"
            placeholder="Precio *"
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
            <option value="">Combustible</option>
            <option value="Bencina">Bencina</option>
            <option value="Diésel">Diésel</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Gas">Gas</option>
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
          rows={5}
          className="mt-4 w-full rounded-lg border px-3 py-2"
        />

        <div className="mt-6 rounded-xl border bg-slate-50 p-4">
          <h2 className="font-bold">Fotos del vehículo</h2>

          <p className="mt-1 text-sm text-slate-600">
            Puedes subir hasta {MAX_IMAGES} fotos. La primera foto será la
            principal.
          </p>

          <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => {
    handleSelectImages(e.target.files);
    e.target.value = "";
  }}
  className="hidden"
/>

<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="mt-4 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
>
  Elegir fotos
</button>

<p className="mt-2 text-xs text-slate-500">
  Puedes seguir agregando fotos hasta completar el máximo permitido.
</p>

          {selectedImages.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {selectedImages.map((image, index) => (
                <div
                  key={`${image.previewUrl}-${index}`}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <img
                      src={image.previewUrl}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">
                        Principal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === selectedImages.length - 1}
                      className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={publishCar}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
        >
          {loading ? "Publicando..." : "Publicar auto"}
        </button>
      </div>
    </main>
  );
}