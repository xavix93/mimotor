export default function SeguridadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Consejos de seguridad</h1>

        <div className="mt-6 space-y-5 text-slate-700">
          <div>
            <h2 className="font-bold text-slate-900">
              Revisa la documentación
            </h2>
            <p className="mt-1">
              Verifica el padrón, permiso de circulación, revisión técnica,
              multas y antecedentes del vehículo antes de concretar una compra.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Agenda en lugares seguros
            </h2>
            <p className="mt-1">
              Prefiere reunirte en lugares públicos, iluminados y concurridos.
              Evita entregar dinero antes de revisar el vehículo.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Desconfía de precios demasiado bajos
            </h2>
            <p className="mt-1">
              Si una oferta parece demasiado conveniente, revisa con más cuidado
              la información del vendedor y del vehículo.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              No compartas claves ni códigos
            </h2>
            <p className="mt-1">
              MiMotor nunca te pedirá claves bancarias, códigos de verificación
              ni información sensible por mensajes externos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}