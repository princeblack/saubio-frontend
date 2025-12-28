export default function AdminPlaceholderPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16 text-center text-saubio-slate">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-saubio-slate/60">Saubio Admin</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Bienvenue dans l’espace administrateur</h1>
        <p className="text-base text-saubio-slate/80">
          L’espace administrateur dédié arrive très bientôt. En attendant, vous pouvez suivre la feuille de route
          produit ou contacter l’équipe plateforme pour toute action critique.
        </p>
      </div>
      <div className="mx-auto flex flex-col gap-3 text-sm text-saubio-slate/70">
        <p className="font-semibold text-saubio-forest">Actions disponibles</p>
        <ul className="mx-auto list-none space-y-2 text-left">
          <li className="rounded-2xl border border-saubio-forest/15 bg-white/90 px-4 py-3 shadow-soft-lg">
            • Consultez le backoffice employé pour suivre l’avancement (accessible aux comptes employé uniquement).
          </li>
          <li className="rounded-2xl border border-saubio-forest/15 bg-white/90 px-4 py-3 shadow-soft-lg">
            • Contactez product@saubio.de pour activer les prochains modules admin.
          </li>
        </ul>
      </div>
    </div>
  );
}
