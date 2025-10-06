export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-semibold text-balance">Gold Price Prediction System</h1>
          <p className="text-sm text-muted-foreground mt-1">MERN stack scaffold with JWT auth and gold price CRUD.</p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground p-5">
            <h2 className="text-lg font-medium">What’s included</h2>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>backend/ (Express + MongoDB + JWT + bcrypt)</li>
              <li>frontend/ (React + Vite + Tailwind + React Router + Axios)</li>
              <li>README.md with setup instructions</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground p-5">
            <h2 className="text-lg font-medium">Quick start</h2>
            <ol className="list-decimal pl-5 mt-3 space-y-2">
              <li>
                Backend:
                <div className="mt-1 rounded bg-muted px-3 py-2 text-sm">
                  1) Copy backend/.env.example to backend/.env
                  <br />
                  2) Set MONGODB_URI and JWT_SECRET
                  <br />
                  3) cd backend && npm install && npm run dev
                </div>
              </li>
              <li>
                Frontend:
                <div className="mt-1 rounded bg-muted px-3 py-2 text-sm">
                  1) Optionally create frontend/.env with VITE_API_URL=http://localhost:9090
                  <br />
                  2) cd frontend && npm install && npm run dev
                </div>
              </li>
              <li>Open the frontend at http://localhost:5173 and the backend listens on http://localhost:9090</li>
            </ol>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground p-5">
            <h2 className="text-lg font-medium">App pages</h2>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Signup: create account and auto-login</li>
              <li>Login: obtain JWT token</li>
              <li>Dashboard: list gold prices, add new records, and logout</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Protected routes require the token stored in localStorage; Axios adds it via Authorization header.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
