import { useEffect, useState } from "react";

const LEADS_API =
  import.meta.env.VITE_LEADS_API ?? "https://widgets.cryptotaxdigest.com/api/leads";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function RegularizeLeadForm({
  annRev,
  defaultEmail,
}: {
  annRev?: string;
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(LEADS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          widgetId: "impots-scanner-regularize",
          tenantId: "ctd",
          source: "impots-scanner",
          locale: "fr",
          metadata: {
            formType: "impots-scanner-regularize",
            indCompteEtranger: "1",
            annRev: annRev ?? "",
          },
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Envoi impossible — réessayez.");
      }

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    }
  };

  if (status === "done") {
    return (
      <div className="lead-form lead-form--done" role="status">
        <p>
          <strong>C&apos;est noté.</strong> La procédure pour contacter l&apos;administration et vous
          régulariser arrive dans votre boîte mail.
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <h3>Recevoir la procédure de régularisation</h3>
      <p className="muted">
        L&apos;indicateur vaut <strong>1</strong> : mieux vaut contacter l&apos;administration avant
        qu&apos;elle ne vous relance. Laissez votre e-mail pour recevoir les étapes concrètes.
      </p>
      <div className="lead-form__row">
        <input
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          required
        />
        <button type="submit" className="btn btn--primary" disabled={status === "loading"}>
          {status === "loading" ? "Envoi…" : "Recevoir la procédure"}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="muted lead-form__legal">
        Un e-mail avec la marche à suivre. Pas de spam — désinscription en un clic.
      </p>
    </form>
  );
}
