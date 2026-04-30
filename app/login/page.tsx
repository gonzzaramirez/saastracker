import { LoginForm } from './login-form'

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextParam = params.next
  const nextPath = nextParam && nextParam.startsWith('/') ? nextParam : '/'

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Acceso seguro</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ingresa tu contrasena maestra para abrir el dashboard.</p>
        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  )
}
