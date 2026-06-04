import Link from "next/link";

export default function AyudaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Centro de ayuda</h1>

        <div className="mt-6 space-y-5">
          <div>
            <h2 className="font-bold">¿Cómo publico un auto?</h2>
            <p className="mt-1 text-slate-600">
              Debes iniciar sesión, completar tus datos en Mi cuenta y luego
              ingresar a Publicar vehículo.
            </p>
          </div>

          <div>
            <h2 className="font-bold">¿Por qué mi publicación no aparece?</h2>
            <p className="mt-1 text-slate-600">
              Las publicaciones pueden quedar pendientes de aprobación antes de
              mostrarse públicamente.
            </p>
          </div>

          <div>
            <h2 className="font-bold">¿Cómo contacto a un vendedor?</h2>
            <p className="mt-1 text-slate-600">
              En cada publicación encontrarás los datos de contacto o el botón
              para contactar por WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="font-bold">¿Cómo destaco una publicación?</h2>
            <p className="mt-1 text-slate-600">
              Desde Mi cuenta puedes solicitar servicios premium para destacar
              autos, automotoras o banners.
            </p>
          </div>
        </div>

        <Link
          href="/contacto"
          className="mt-8 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
        >
          Contactar a MiMotor
        </Link>
      </section>
    </main>
  );
}