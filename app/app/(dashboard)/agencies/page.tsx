import { Suspense } from "react";
import Agencies from "@/components/agencies";
import PlaceholderCard from "@/components/placeholder-card";
import CreateAgencyButton from "@/components/create-agency-button";
import CreateAgencyModal from "@/components/modal/create-agency";

export default function AllAgencies({ params }: { params: { id: string } }) {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            All Agencies
          </h1>
          <CreateAgencyButton>
            <CreateAgencyModal />
          </CreateAgencyButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          {/* @ts-expect-error Server Component */}
          <Agencies agencyId={decodeURIComponent(params.id)} />
        </Suspense>
      </div>
    </div>
  );
}
