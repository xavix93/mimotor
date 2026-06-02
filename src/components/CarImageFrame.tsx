"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  isFeatured?: boolean;
};

export default function CarImageFrame({
  src,
  alt,
  isFeatured = false,
}: Props) {
  const [isSquare, setIsSquare] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-t-2xl bg-slate-100">
      {/* Cuadro siempre cuadrado */}
      <div className="relative aspect-square w-full">
        {/* Fondo blur */}
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover blur-xl scale-110"
        />

        <div className="absolute inset-0 bg-black/10" />

        {/* Imagen principal */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              onLoadingComplete={(img) => {
                setIsSquare(img.naturalWidth === img.naturalHeight);
              }}
              className={isSquare ? "object-cover" : "object-contain"}
            />
          </div>
        </div>

        {/* Etiqueta destacado */}
        {isFeatured && (
          <div className="absolute left-3 top-3 z-10 rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow">
            TOP NITRO
          </div>
        )}

        {/* Sello de agua */}
        <div className="absolute bottom-3 right-3 z-10 rounded-md bg-white/40 px-2 py-1 text-sm font-semibold text-slate-700 backdrop-blur-sm">
          mimotor.cl
        </div>
      </div>
    </div>
  );
}