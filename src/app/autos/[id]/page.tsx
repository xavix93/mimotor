"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

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
  car_images: {
    image_url: string;
    sort_order: number;
  }[];
};

export default function CarDetailPage() {
  const params = useParams();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(image_url, sort_order)")
        .eq("id", carId)
        .single();

      if (error) {
        console.error(error.message);
        setLoading(false);
        return;
      }

      const loadedCar = data as Car;

      loadedCar.car_images = [...(loadedCar.car_images || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      setCar(loadedCar);
      setSelectedImage(loadedCar.car_images?.[0]?.image_url || null);
      setLoading(false);
    };

    loadCar();
  }, [carId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando vehículo...</p>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Auto no encontrado</h1>
        <p className="mt-2 text-slate-600">
          La publicación no existe o no está disponible.
        </p>
      </main>
    );
  }

  const cleanPhone = car.seller_phone
    ? car.seller_phone.replace(/\D/g, "")
    : "";

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hola, vi tu ${car.brand} ${car.model} en MiMotor y me interesa recibir más información.`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <div className="overflow-hidden rounded-2xl bg-slate-200 shadow">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={`${car.brand} ${car.model}`}
                className="h-96 w-full object-cover"
              />
            ) : (
              <div className="flex h-96 items-center justify-center text-slate-500">
                Sin foto principal
              </div>
            )}
          </div>

          {car.car_images?.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {car.car_images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(image.image_url)}
                  className={`overflow-hidden rounded-xl border-2 ${
                    selectedImage === image.image_url
                      ? "border-blue-700"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Foto ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <p className="mb-2 text-sm text-slate-500">
            {car.region || "Región no informada"},{" "}
            {car.commune || "Comuna no informada"}
          </p>

          <h1 className="text-3xl font-bold">
            {car.brand} {car.model}
          </h1>

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

            <p>
              <strong>Estado:</strong>{" "}
              {car.status === "pending"
                ? "Pendiente"
                : car.status === "approved"
                ? "Aprobado"
                : "Rechazado"}
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

          {cleanPhone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              className="mt-6 block rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white"
            >
              Contactar por WhatsApp
            </a>
          ) : (
            <p className="mt-6 rounded-lg bg-slate-100 px-6 py-3 text-center text-sm text-slate-600">
              El vendedor no dejó número de WhatsApp.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}