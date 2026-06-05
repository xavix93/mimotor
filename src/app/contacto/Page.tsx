import Link from "next/link";

export default function ContactoPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="text-3xl font-bold md:text-4xl">Contacto</h1>

          <p className="mt-3 max-w-2xl text-slate-200">
            Escríbenos si tienes dudas, necesitas ayuda con una publicación o
            quieres comunicarte con MiMotor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-slate-900">
              ¿En qué podemos ayudarte?
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              Para consultas sobre publicaciones, problemas de acceso, servicios
              premium, automotoras o información general, puedes contactarnos
              por correo electrónico.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Correo de contacto
              </p>

              <a
                href="mailto:contacto@mimotor.cl"
                className="mt-1 block text-lg font-bold text-blue-700"
              >
                contacto@mimotor.cl
              </a>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 p-5">
              <h3 className="font-bold text-blue-950">
                Para ayudarte más rápido
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-900">
                Incluye tu nombre, correo, teléfono, motivo de contacto y, si
                corresponde, el enlace o datos de la publicación relacionada.
              </p>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-slate-900">
              Accesos rápidos
            </h2>

            <div className="mt-5 space-y-3">
              <Link
                href="/ayuda"
                className="block rounded-lg border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Centro de ayuda
              </Link>

              <Link
                href="/publicar"
                className="block rounded-lg border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Publicar vehículo
              </Link>

              <Link
                href="/cuenta"
                className="block rounded-lg border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Mi cuenta
              </Link>

              <Link
                href="/buscar-autos"
                className="block rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Buscar autos
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}