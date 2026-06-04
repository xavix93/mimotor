export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Términos y condiciones</h1>

        <div className="mt-6 space-y-5 text-slate-700">
          <p>
            MiMotor.cl es una plataforma digital que permite publicar, buscar y
            contactar vendedores de vehículos en Chile.
          </p>

          <div>
            <h2 className="font-bold text-slate-900">Uso de la plataforma</h2>
            <p className="mt-1">
              Los usuarios son responsables de entregar información real,
              actualizada y verificable en sus publicaciones.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Publicaciones</h2>
            <p className="mt-1">
              MiMotor podrá revisar, aprobar, rechazar o eliminar publicaciones
              que contengan información falsa, incompleta, ofensiva o que no
              corresponda al objetivo de la plataforma.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Responsabilidad en la compra y venta
            </h2>
            <p className="mt-1">
              MiMotor no es propietario de los vehículos publicados ni participa
              directamente en la compraventa entre comprador y vendedor.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Servicios premium</h2>
            <p className="mt-1">
              Los servicios destacados o promocionales pueden estar sujetos a
              revisión, disponibilidad y confirmación previa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}