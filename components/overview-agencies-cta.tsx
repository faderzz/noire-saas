import { getSession } from "@/lib/auth";
import CreateAgencyButton from "./create-agency-button";
import CreateAgencyModal from "./modal/create-agency";
import Link from "next/link";
import db from "@/lib/db";
import { agencies } from "@/lib/schema";
import { count, eq } from "drizzle-orm";

export default async function OverviewAgenciesCTA() {
  const session = await getSession();
  if (!session) {
    return 0;
  }
  const [agenciesResult] = await db
    .select({ count: count() })
    .from(agencies)
    .where(eq(agencies.userId, session.user.id));

  return agenciesResult.count > 0 ? (
    <Link
      href="/agencies"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All Agencies
    </Link>
  ) : (
    <CreateAgencyButton>
      <CreateAgencyModal />
    </CreateAgencyButton>
  );
}
