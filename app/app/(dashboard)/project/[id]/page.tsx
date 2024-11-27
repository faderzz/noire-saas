import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, decodeURIComponent(params.id)),
    with: {
      agency: {
        columns: {
          subdomain: true,
        },
      },
    },
  });
  // console.log(data);

  // Get agency ID
  const agencyId = data?.agencyId;
  // Get the owner for the agency
  const agency = await db.query.agencies.findFirst({
    where: (agencies, { eq }) => eq(agencies.id, agencyId),
    select: {
      userId: true,
    },
  });
  
  if (!data || agency?.userId !== session.user.id) {
    notFound();
  }

  // return <Editor project={data} />;
  return <div className="text-white">Project page</div>;
}
