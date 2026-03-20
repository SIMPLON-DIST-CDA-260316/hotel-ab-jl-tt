import { LoginForm } from "@/features/auth/components/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Se connecter</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
