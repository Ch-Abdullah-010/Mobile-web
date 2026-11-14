import { SITE } from "@/lib/constants";

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro?: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <div className="container-page py-12">
      <article className="mx-auto max-w-3xl">
        <header>
          <h1 className="text-3xl font-bold text-content sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-content-subtle">Last updated: {updated}</p>
          {intro ? <p className="mt-5 text-content-muted">{intro}</p> : null}
        </header>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-content">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-content-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 rounded-xl border border-border bg-surface-muted p-5 text-sm text-content-muted">
          Questions? Contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand hover:underline">
            {SITE.email}
          </a>{" "}
          or call {SITE.phone}.
        </footer>
      </article>
    </div>
  );
}
