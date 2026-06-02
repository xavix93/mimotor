"use client";

import Link from "next/link";
import CarImageFrame from "./CarImageFrame";

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  price: number | null;
  region: string | null;
  featured?: boolean;
  car_images?: { image_url: string }[];
};

type Props = {
  car: Car;
};

export default function CarCard({ car }: Props) {
  const imageUrl =
    car.car_images && car.car_images.length > 0
      ? car.car_images[0].image_url
      : "/no-image.png";

  return (
    <Link
      href={`/autos/${car.id}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
    >
      <CarImageFrame
        src={imageUrl}
        alt={`${car.brand} ${car.model}`}
        isFeatured={!!car.featured}
      />

      <div className="p-4">
        <h3 className="text-[18px] font-semibold text-slate-800">
          {car.brand} {car.model}
        </h3>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          $
          {car.price
            ? car.price.toLocaleString("es-CL")
            : "0"}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {car.region || "Región no informada"}
        </p>
      </div>
    </Link>
  );
}