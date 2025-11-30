export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-saubio-mist p-6 text-center">
      <div className="max-w-md space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/90 p-8 shadow-soft-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">403</p>
        <h1 className="text-2xl font-semibold text-saubio-forest">Zugriff verweigert</h1>
        <p className="text-sm text-saubio-slate/70">
          Du verfügst nicht über die notwendigen Berechtigungen, um diesen Bereich aufzurufen.
          Bitte wende dich an den Support oder wechsle zu einem verfügbaren Bereich.
        </p>
      </div>
    </main>
  );
}
