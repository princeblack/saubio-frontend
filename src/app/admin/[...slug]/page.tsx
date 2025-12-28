type Params = {
  slug: string[];
};

export default async function AdminCatchAllPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const pendingPath = resolved.slug?.join('/') ?? '';

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col justify-center gap-4 px-6 py-16 text-center text-saubio-slate">
      <h1 className="text-3xl font-semibold text-saubio-forest">Module administrateur en préparation</h1>
      <p className="text-base text-saubio-slate/80">
        La section <span className="font-semibold text-saubio-forest">/admin/{pendingPath}</span> n’est pas encore activée.
        Notre équipe prépare une interface dédiée pour les administrateurs globaux.
      </p>
      <p className="text-sm text-saubio-slate/70">
        Besoin d’un accès prioritaire ? Contactez product@saubio.de pour obtenir un point d’avancement.
      </p>
    </div>
  );
}
