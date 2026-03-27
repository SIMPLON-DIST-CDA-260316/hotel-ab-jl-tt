import { RegisterForm } from "@/features/auth/components/RegisterForm";

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Créer un compte</h1>
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
