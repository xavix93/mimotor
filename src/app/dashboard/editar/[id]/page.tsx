"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

type CarImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export default function EditarAutoPage() {
  const params = useParams();
  const carId = params.id as string;

  const MAX_IMAGES = 20;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<CarImage[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

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
    const loadCar = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(id, image_url, sort_order)")
        .eq("id", carId)
        .single();

      if (error || !data) {
        alert("No se pudo cargar la publicación.");
        window.location.href = "/dashboard";
        return;
      }

      if (data.user_id !== sessionData.session.user.id) {
        alert("No tienes permiso para editar esta publicación.");
        window.location.href = "/dashboard";
        return;
      }

      setForm({
        brand: data.brand || "",
        model: data.model || "",
        year: String(data.year || ""),
        price: String(data.price || ""),
        mileage: data.mileage ? String(data.mileage) : "",
        region: data.region || "",
        commune: data.commune || "",
        fuel_type: data.fuel_type || "",
        transmission: data.transmission || "",
        color: data.color || "",
        description: data.description || "",
      });

      const orderedImages = [...(data.car_images || [])].sort(
        (a: CarImage, b: CarImage) =>
          (a.sort_order || 0) - (b.sort_order || 0)
      );

      setImages(orderedImages);
      setLoading(false);
    };

    loadCar();
  }, [carId]);

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

  const getStoragePathFromUrl = (url: string) => {
    const marker = "/storage/v1/object/public/car-images/";
    const parts = url.split(marker);
    return parts[1];
  };

  const saveImageOrder = async (orderedImages: CarImage[]) => {
    for (let i = 0; i < orderedImages.length; i++) {
      await supabase
        .from("car_images")
        .update({ sort_order: i })
        .eq("id", orderedImages[i].id);
    }
  };

  const moveImage = async (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);
    await saveImageOrder(newImages);
  };

  const deleteImage = async (image: CarImage) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar esta foto?");
    if (!confirmDelete) return;

    const path = getStoragePathFromUrl(image.image_url);

    if (path) {
      await supabase.storage.from("car-images").remove([path]);
    }

    const { error } = await supabase
      .from("car_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      alert(error.message);
      return;
    }

    const updatedImages = images.filter((img) => img.id !== image.id);
    setImages(updatedImages);
    await saveImageOrder(updatedImages);
  };

  const uploadNewImages = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      alert("Debes iniciar sesión.");
      return;
    }

    if (!newFiles || newFiles.length === 0) return;

    if (images.length + newFiles.length > MAX_IMAGES) {
      alert(`No puedes superar el máximo de ${MAX_IMAGES} fotos.`);
      return;
    }

    const user = sessionData.session.user;
    const filesArray = Array.from(newFiles);
    const uploadedImages: CarImage[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];

      const safeFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "-");

      const filePath = `${user.id}/${carId}/${Date.now()}-${i}-${safeFileName}`;

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

      const newSortOrder = images.length + uploadedImages.length;

      const { data: newImage, error: insertError } = await supabase
        .from("car_images")
        .insert({
          car_id: carId,
          image_url: publicUrlData.publicUrl,
          sort_order: newSortOrder,
        })
        .select()
        .single();

      if (insertError) {
        alert(`Error guardando foto ${i + 1}: ${insertError.message}`);
        continue;
      }

      uploadedImages.push(newImage as CarImage);
    }

    if (uploadedImages.length > 0) {
      const updatedImages = [...images, ...uploadedImages].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      setImages(updatedImages);
    }

    setNewFiles(null);
  };

  const updateCar = async () => {
    if (saving) return;

    if (!form.brand || !form.model || !form.year || !form.price) {
      alert("Marca, modelo, año y precio son obligatorios.");
      return;
    }

    setSaving(true);

    await uploadNewImages();

    const { error } = await supabase
      .from("cars")
      .update({
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
        status: "pending",
      })
      .eq("id", carId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Publicación actualizada. Quedará pendiente de aprobación nuevamente.");
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p>Cargando publicación...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Editar publicación</h1>

        <p className="mb-6 text-sm text-slate-600">
          Modifica los datos y fotos del vehículo. La primera foto será la imagen principal.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="brand"
            value={form.brand}
            placeholder="Marca"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="model"
            value={form.model}
            placeholder="Modelo"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="year"
            value={form.year}
            placeholder="Año"
            type="number"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="price"
            value={form.price}
            placeholder="Precio"
            type="number"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="mileage"
            value={form.mileage}
            placeholder="Kilometraje"
            type="number"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="region"
            value={form.region}
            placeholder="Región"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />

          <input
            name="commune"
            value={form.commune}
            placeholder="Comuna"
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
            value={form.color}
            placeholder="Color"
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          />
        </div>

        <textarea
          name="description"
          value={form.description}
          placeholder="Descripción del vehículo"
          onChange={handleChange}
          className="mt-4 h-32 w-full rounded-lg border px-3 py-2"
        />

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Fotos actuales</h2>

          {images.length === 0 ? (
            <p className="text-sm text-slate-600">
              Esta publicación no tiene fotos.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt="Foto del auto"
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
                      disabled={index === images.length - 1}
                      className="rounded-lg border px-2 py-1 text-sm disabled:opacity-40"
                    >
                      Bajar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteImage(image)}
                    className="w-full bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Eliminar foto
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Agregar nuevas fotos</h2>

          <label className="inline-block cursor-pointer rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700">
            Seleccionar fotos
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selectedFiles = e.target.files;

                if (!selectedFiles) {
                  setNewFiles(null);
                  return;
                }

                const totalImages = images.length + selectedFiles.length;

                if (totalImages > MAX_IMAGES) {
                  alert(
                    `Esta publicación puede tener un máximo de ${MAX_IMAGES} fotos. Actualmente tienes ${images.length}, por lo que solo puedes agregar ${
                      MAX_IMAGES - images.length
                    } más.`
                  );

                  e.target.value = "";
                  setNewFiles(null);
                  return;
                }

                setNewFiles(selectedFiles);
              }}
            />
          </label>

          <p className="mt-2 text-sm text-slate-500">
            {newFiles
              ? `${newFiles.length} nueva(s) foto(s) seleccionada(s).`
              : `Puedes agregar hasta ${
                  MAX_IMAGES - images.length
                } foto(s) más.`}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={updateCar}
            disabled={saving}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <a
            href="/dashboard"
            className="rounded-lg border px-6 py-3 font-semibold"
          >
            Cancelar
          </a>
        </div>
      </div>
    </main>
  );
}