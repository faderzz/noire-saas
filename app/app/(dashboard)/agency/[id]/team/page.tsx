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

  // const tableData = await getData(data.id);
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-cal text-2xl font-bold sm:text-3xl">
              Team Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage team members and their permissions for {data.name}
            </p>
          </div>
          <a
            href={`https://${url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {url} ↗
          </a>
        </div>
      </Card>

      <Card className="p-6">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}