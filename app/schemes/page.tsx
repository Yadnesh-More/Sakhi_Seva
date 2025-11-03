import { SiteHeader } from "@/components/site-header"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

type Scheme = {
  title: string
  description: string
  link?: string
}

const SCHEMES: Scheme[] = [
  {
    title: "Mahila Udyam Nidhi (SIDBI)",
    description: "Financial assistance for women entrepreneurs to set up new projects in small-scale sectors.",
    link: "https://www.sidbi.in/",
  },
  {
    title: "Stand-Up India",
    description: "Bank loans for women, SC/ST entrepreneurs to start greenfield enterprises.",
    link: "https://www.standupmitra.in/",
  },
  {
    title: "PM Mudra Yojana",
    description: "Loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.",
    link: "https://www.mudra.org.in/",
  },
  {
    title: "Udyam Registration",
    description: "Free MSME registration to avail government benefits and subsidies.",
    link: "https://udyamregistration.gov.in/",
  },
  {
    title: "Digital Saksharta Abhiyan (DISHA)",
    description: "Digital literacy program to help citizens use devices and online services.",
    link: "https://www.pmgdisha.in/",
  },
]

export default function SchemesPage() {
  return (
    <ProtectedRoute>
      <main>
        <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Government schemes</h1>
          <p className="text-sm text-foreground/70 mt-1">
            Discover programs supporting women entrepreneurs in Maharashtra.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {SCHEMES.map((s) => (
            <article key={s.title} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-foreground/80">{s.description}</p>
              {s.link && (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                >
                  Learn more
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="font-medium">Note</h2>
          <p className="mt-1 text-sm text-foreground/80">
            This page provides general information only. For eligibility, required documents, and application process,
            please visit official sites or consult your local facilitation center.
          </p>
        </div>
      </section>
      </main>
    </ProtectedRoute>
  )
}
