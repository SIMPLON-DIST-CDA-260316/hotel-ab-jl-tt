import { notFound } from "next/navigation";
import { getSuiteWithDetails } from "@/features/suites/queries/get-suite-with-details";
import { SuiteDetail } from "@/features/suites/components/SuiteDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SuitePage({ params }: Props) {
  const { id } = await params;
  const suite = await getSuiteWithDetails(id);

  if (!suite) {
    notFound();
  }

  return (
    <main id="main-content">
      <SuiteDetail suite={suite} />
    </main>
  );
}
