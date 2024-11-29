import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Form from "@/components/form";
import { updateProjectMetadata } from "@/lib/actions";
import DeleteProjectForm from "@/components/form/delete-project-form";
import db from "@/lib/db";

export default async function ProjectSettings({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, decodeURIComponent(params.id)),
  });

  // Find userId for agency
  const agency = await db.query.agencies.findFirst({
    where: (agencies, { eq }) => eq(agencies.id, data?.agencyId),
  })

  if (agency?.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Project Settings
        </h1>
        <Form
          title="Project Name"
          description="The project name is what your client will see and your team. It should be unique to this project."
          helpText="Please use a name that is unique to this project."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: data?.name!,
            placeholder: "name",
          }}
          handleSubmit={updateProjectMetadata}
        />

        <Form
          title="Thumbnail image"
          description="The thumbnail image for your project. Accepted formats: .png, .jpg, .jpeg"
          helpText="Max file size 50MB. Recommended size 1200x630."
          inputAttrs={{
            name: "image",
            type: "file",
            defaultValue: data?.image!,
          }}
          handleSubmit={updateProjectMetadata}
        />

        <DeleteProjectForm projectName={data?.name!} />
      </div>
    </div>
  );
}
