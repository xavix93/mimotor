"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";

type CarImage = {
  image_url: string;
  sort_order: number | null;
};

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  region: string | null;
  commune: string | null;
  fuel_type: string | null;
  transmission: string | null;
  color: string | null;
  description: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  status: string;
  car_images: CarImage[] | null;
};

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadCar = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("cars")
        .select(
          `
          *,
          car_images (
            image_url,
            sort_order
          )
        `
        )
        .eq("id", carId)
        .maybeSingle();

      if (error) {
        console.error(error.message);
        setCar(null);
        return;
      }

      if (!data) {
        setCar(null);
        return;
      }

      const loadedCar = data as Car;

      const orderedImages = [...(loadedCar.car_images || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      const finalCar = {
        ...loadedCar,
        car_images: orderedImages,
      };

      setCar(finalCar);
      setSelectedImage(orderedImages[0]?.image_url || null);
    } catch (error) {
      console.error(error);
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (carId) {
      loadCar();
    }
  }, [carId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando publicación...</p>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Publicación no encontrada</h1>
          <p className="mt-2 text-slate-600">
            El auto no existe o la publicación ya no está disponible.
          </p>
        </div>
      </main>
    );
  }

  const cleanPhone = car.seller_phone?.replace(/\D/g, "") || "";

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hola, vi tu ${car.brand} ${car.model} ${car.year} en MiMotor y me interesa recibir más información.`
      )}`
    : "";

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow">
              <div className="relative aspect-square w-full">
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt={`${car.brand} ${car.model}`}
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                    />

                    <div className="absolute inset-0 bg-black/10" />

                    <img
                      src={selectedImage}
                      alt={`${car.brand} ${car.model}`}
                      className="relative z-10 h-full w-full object-contain p-2"
                    />

                        <div className="absolute bottom-3 right-3 z-20">
  <img
    src="/watermark-logo.png"
    alt="MiMotor"
    className="h-20 w-auto opacity-80 "
  />
</div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    Sin foto
                  </div>
                )}
              </div>
            </div>

            {car.car_images && car.car_images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {car.car_images.map((image, index) => (
                  <button
                    key={`${image.image_url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`overflow-hidden rounded-xl border-2 bg-slate-200 ${
                      selectedImage === image.image_url
                        ? "border-blue-700"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`Foto ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-slate-500">
                  {car.region || "Región no informada"},{" "}
                  {car.commune || "Comuna no informada"}
                </p>

                <h1 className="text-3xl font-bold">
                  {car.brand} {car.model}
                </h1>

                <p className="mt-1 text-slate-600">Año {car.year}</p>
              </div>

              <FavoriteButton carId={car.id} />
            </div>

            <p className="mt-4 text-3xl font-bold text-blue-700">
              ${car.price.toLocaleString("es-CL")}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Año:</strong> {car.year}
              </p>

              <p>
                <strong>Kilometraje:</strong>{" "}
                {car.mileage
                  ? `${car.mileage.toLocaleString("es-CL")} km`
                  : "No informado"}
              </p>

              <p>
                <strong>Combustible:</strong>{" "}
                {car.fuel_type || "No informado"}
              </p>

              <p>
                <strong>Transmisión:</strong>{" "}
                {car.transmission || "No informado"}
              </p>

              <p>
                <strong>Color:</strong> {car.color || "No informado"}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="font-bold">Descripción</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">
                {car.description || "Sin descripción."}
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-slate-100 p-4">
              <h2 className="font-bold">Datos del vendedor</h2>

              <p className="mt-2">
                <strong>Nombre:</strong>{" "}
                {car.seller_name || "No informado"}
              </p>

              <p>
                <strong>Teléfono:</strong>{" "}
                {car.seller_phone || "No informado"}
              </p>
            </div>

            {cleanPhone && (
              <a
                href={whatsappUrl}
                target="_blank"
                className="mt-6 block rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700"
              >
                Contactar por WhatsApp
              </a>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}