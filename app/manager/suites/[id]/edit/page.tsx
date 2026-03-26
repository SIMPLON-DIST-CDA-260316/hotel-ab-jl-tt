import { notFound } from "next/navigation";
import { requireManager } from "@/lib/auth-guards";
import { getSuiteForManager } from "@/features/suites/queries/get-suite-for-manager";
import { SuiteForm } from "@/features/suites/components/SuiteForm";
import { updateSuite } from "@/features/suites/actions/update-suite";
import {
  getAmenitiesForSuite,
  getInheritedAmenityIds,
  getSuiteAmenityIds,
} from "@/features/suites/queries/get-amenities-for-suite";

type EditSuitePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSuitePage({ params }: EditSuitePageProps) {
  const session = await requireManager();
  const { id } = await params;

  const suiteData = await getSuiteForManager(id, session.user.id);

  if (!suiteData) {
    notFound();
  }

  const [availableAmenities, inheritedAmenityIds, selectedAmenityIds] =
    await Promise.all([
      getAmenitiesForSuite(),
      getInheritedAmenityIds(suiteData.establishmentId),
      getSuiteAmenityIds(id),
    ]);

  const updateAction = updateSuite.bind(null, id);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <SuiteForm
        action={updateAction}
        availableAmenities={availableAmenities}
        inheritedAmenityIds={inheritedAmenityIds}
        defaultValues={{
          title: suiteData.title,
          description: suiteData.description,
          price: suiteData.price,
          capacity: suiteData.capacity,
          area: suiteData.area,
          mainImageUrl: suiteData.mainImage,
          establishmentId: suiteData.establishmentId,
          selectedAmenityIds,
        }}
      />
    </main>
  );
}
