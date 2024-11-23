import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import ProjectCard from "./project-card";

export default async function Projects({
  agencyId,
  limit,
}: {
  agencyId?: string;
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  // Find projects where agencyId matches
  const projects = await db.query.projects.findMany({
    where: (projects, { eq }) => agencyId ? eq(projects.agencyId, agencyId) : undefined,
    orderBy: (projects) => projects.createdAt,
    take: limit || 20,
  });

  // example projects
  // const projects = [];

  return projects.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} data={project} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Projects Yet</h1>
      <Image
        alt="missing project"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any projects yet. Create one to get started.
      </p>
    </div>
  );
}
