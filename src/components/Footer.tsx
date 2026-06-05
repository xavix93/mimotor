import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-[#071A3D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img
              src="/mimotor-logo.png"
              alt="MiMotor"
              className="mb-4 h-14 w-auto"
            />

            <p className="max-w-sm text-sm leading-6 text-slate-300">
              MiMotor es una plataforma chilena para buscar, publicar y
              contactar vendedores de vehículos de forma simple, rápida y
              directa.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/buscar-autos"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-950 hover:bg-slate-100"
              >
                Ver autos
              </Link>

              <Link
                href="/publicar"
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Publicar vehículo
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-200">
              Buscar rápido
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              <Link href="/buscar-autos" className="block hover:text-white">
                Todos los autos
              </Link>

              <Link
                href="/buscar-autos?brand=Toyota"
                className="block hover:text-white"
              >
                Toyota
              </Link>

              <Link
                href="/buscar-autos?brand=Hyundai"
                className="block hover:text-white"
              >
                Hyundai
              </Link>

              <Link
                href="/buscar-autos?brand=Chevrolet"
                className="block hover:text-white"
              >
                Chevrolet
              </Link>

              <Link
                href="/buscar-autos?fuelType=Eléctrico"
                className="block hover:text-white"
              >
                Autos eléctricos
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-200">
              MiMotor
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              <Link href="/cuenta" className="block hover:text-white">
                Mi cuenta
              </Link>

              <Link href="/login" className="block hover:text-white">
                Ingresar
              </Link>

              <Link href="/publicar" className="block hover:text-white">
                Publicar vehículo
              </Link>

              <Link href="/buscar-autos" className="block hover:text-white">
                Buscar vehículo
              </Link>

              <Link href="/contacto" className="block hover:text-white">
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-200">
              Ayuda y legal
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              <Link href="/ayuda" className="block hover:text-white">
                Centro de ayuda
              </Link>

              <Link href="/terminos" className="block hover:text-white">
                Términos y condiciones
              </Link>

              <Link href="/privacidad" className="block hover:text-white">
                Política de privacidad
              </Link>

              <Link href="/seguridad" className="block hover:text-white">
                Consejos de seguridad
              </Link>
              <Link href="/quienes-somos" className="block hover:text-white">
                Quienes somos
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-white">
                Compra con más confianza
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Revisa los documentos del vehículo, datos del vendedor y agenda
                en lugares seguros.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Contacto directo</p>
              <p className="mt-1 text-sm text-slate-300">
                Contacta al vendedor por WhatsApp desde cada publicación.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                Servicios premium
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Destaca autos, automotoras o banners desde tu cuenta.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            © MiMotor.cl 2026. Plataforma independiente de compra y venta de
            vehículos en Chile.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Síguenos</span>

            <a
              href="https://www.instagram.com/mimotor.cl/"
              target="_blank"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white hover:bg-white/20"
            >
              IG
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white hover:bg-white/20"
            >
              f
            </a>

            <a
              href="https://www.tiktok.com/"
              target="_blank"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white hover:bg-white/20"
            >
              TT
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}