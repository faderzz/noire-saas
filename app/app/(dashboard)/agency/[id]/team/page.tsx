import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { columns, Team } from "./columns";
import { DataTable } from "./data-table";
import { Card } from "@/components/ui/card";

async function getData(agencyId): Promise<Team[]> {
  const agencyMembers = await db.query.agencyMembers.findMany({
    where: (agencyMembers, { eq }) => eq(agencyMembers.agencyId, agencyId),
    include: {
      user: true,
    },
  })
  
  return agencyMembers.map((member) => ({
    id: member.id,
    email: member.user.email,
    role: member.role as "admin" | "user" | "owner",
    permissions: member.permissions,
  }));
}

export default async function AgencyTeam({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await db.query.agencies.findFirst({
    where: (agencies, { eq }) => eq(agencies.id, decodeURIComponent(params.id)),
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  const tableData = [
    {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      permissions: ["write", "delete"],
    },
    {
      id: "2",
      email: "user@example.com",
      role: "user",
      permissions: ["read"],
    },
    {
      id: "3",
      email: "owner@example.com",
      role: "owner",
      permissions: ["write", "delete", "manage"],
    },
  ] as Team[]

  return (
    <>
    <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
      <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
        <h1 className="w-60 truncate font-cal text-xl font-bold sm:w-auto sm:text-3xl dark:text-white">
          Team Management for {data.name}
        </h1>
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
      </div>
    </div>
    <div className="w-full max-w-6xl mt-8">
        <Card className="p-6 dark:bg-stone-900">
          <DataTable columns={columns} data={tableData} />
        </Card>
      </div>
    </>
  );
}