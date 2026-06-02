import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-5">
          <div>
            <h3 className="mb-4 font-bold text-slate-900">Busca un auto</h3>

            <div className="space-y-3 text-sm text-slate-600">
              <Link href="/buscar-autos" className="block hover:text-blue-700">
                Todos nuestros autos
              </Link>

              <Link
                href="/buscar-autos?fuelType=Eléctrico"
                className="block hover:text-blue-700"
              >
                Autos eléctricos
              </Link>

              <Link
                href="/buscar-autos?model=SUV"
                className="block hover:text-blue-700"
              >
                Camionetas y SUV
              </Link>

              <Link href="/buscar-autos" className="block hover:text-blue-700">
                Autos nuevos
              </Link>

              <Link href="/buscar-autos" className="block hover:text-blue-700">
                Autos usados
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">Busca por marca</h3>

            <div className="space-y-3 text-sm text-slate-600">
              <Link
                href="/buscar-autos?brand=Chevrolet"
                className="block hover:text-blue-700"
              >
                Chevrolet
              </Link>

              <Link
                href="/buscar-autos?brand=Hyundai"
                className="block hover:text-blue-700"
              >
                Hyundai
              </Link>

              <Link
                href="/buscar-autos?brand=Toyota"
                className="block hover:text-blue-700"
              >
                Toyota
              </Link>

              <Link
                href="/buscar-autos?brand=Nissan"
                className="block hover:text-blue-700"
              >
                Nissan
              </Link>

              <Link
                href="/buscar-autos?brand=Suzuki"
                className="block hover:text-blue-700"
              >
                Suzuki
              </Link>

              <Link
                href="/buscar-autos?brand=Kia"
                className="block hover:text-blue-700"
              >
                Kia
              </Link>

              <Link
                href="/buscar-autos?brand=Ford"
                className="block hover:text-blue-700"
              >
                Ford
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">Busca en tu ciudad</h3>

            <div className="space-y-3 text-sm text-slate-600">
              <Link
                href="/buscar-autos?region=Santiago"
                className="block hover:text-blue-700"
              >
                Santiago
              </Link>

              <Link
                href="/buscar-autos?region=Concepción"
                className="block hover:text-blue-700"
              >
                Concepción
              </Link>

              <Link
                href="/buscar-autos?region=Temuco"
                className="block hover:text-blue-700"
              >
                Temuco
              </Link>

              <Link
                href="/buscar-autos?region=Viña del Mar"
                className="block hover:text-blue-700"
              >
                Viña del Mar
              </Link>

              <Link
                href="/buscar-autos?region=Rancagua"
                className="block hover:text-blue-700"
              >
                Rancagua
              </Link>

              <Link
                href="/buscar-autos?region=Talca"
                className="block hover:text-blue-700"
              >
                Talca
              </Link>

              <Link
                href="/buscar-autos?region=Puerto Montt"
                className="block hover:text-blue-700"
              >
                Puerto Montt
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">Soporte y ayuda</h3>

            <div className="space-y-3 text-sm text-slate-600">
              <Link href="/contacto" className="block hover:text-blue-700">
                Contáctanos
              </Link>

              <Link href="/ayuda" className="block hover:text-blue-700">
                Portal de ayuda
              </Link>

              <Link href="/terminos" className="block hover:text-blue-700">
                Términos y condiciones
              </Link>

              <Link href="/privacidad" className="block hover:text-blue-700">
                Privacidad
              </Link>

              <Link href="/mapa-del-sitio" className="block hover:text-blue-700">
                Mapa del sitio
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">
              Plataforma para automotoras
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <Link href="/login" className="block hover:text-blue-700">
                Regístrate
              </Link>

              <Link href="/login" className="block hover:text-blue-700">
                Ingresa
              </Link>

              <Link href="/publicar" className="block hover:text-blue-700">
                Publica tu auto
              </Link>

              <Link href="/cuenta" className="block hover:text-blue-700">
                Mi cuenta
              </Link>

              <Link href="/cuenta" className="block hover:text-blue-700">
                Servicios premium
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              © MiMotor.cl 2026. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">
                Descubre nuestras RRSS
              </span>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white"
              >
                IG
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white"
              >
                f
              </a>

              <a
                href="https://www.tiktok.com/"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white"
              >
                TT
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white"
              >
                ▶
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}