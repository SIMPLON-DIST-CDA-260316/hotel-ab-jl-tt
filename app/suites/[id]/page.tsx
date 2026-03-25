import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSuiteWithDetails } from "@/features/suites/queries/get-suite-with-details";
import { SuiteDetail } from "@/features/suites/components/SuiteDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SuitePage({ params }: Props) {
  const { id } = await params;
  const [suite, session] = await Promise.all([
    getSuiteWithDetails(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!suite) {
    notFound();
  }

  return (
    <main id="main-content">
      <SuiteDetail suite={suite} isAuthenticated={!!session} />
    </main>
  );
}
