import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import AgencyCard from "./agency-card";

export default async function Agencies({ limit }: { limit?: number }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const agencies = await db.query.agencies.findMany({
    where: (agencies, { eq }) => eq(agencies.userId, session.user.id),
    orderBy: (agencies, { asc }) => asc(agencies.createdAt),
    ...(limit ? { limit } : {}),
  });

  return agencies.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {agencies.map((agency) => (
        <AgencyCard key={agency.id} data={agency} />
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Agencies Yet</h1>
      <Image
        alt="missing agency"
        src="https://illustrations.popsy.co/gray/web-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any agencies yet. Create one to get started.
      </p>
    </div>
  );
}
