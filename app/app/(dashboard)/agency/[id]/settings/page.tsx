import Form from "@/components/form";
import { updateAgency } from "@/lib/actions";
import DeleteAgencyForm from "@/components/form/delete-agency-form";
import db from "@/lib/db";

export default async function AgencySettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const data = await db.query.agencies.findFirst({
    where: (agencies, { eq }) => eq(agencies.id, decodeURIComponent(params.id)),
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
        description="The name of your agency. This will be used as the meta title on Google as well."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "My Awesome Agency",
          maxLength: 32,
        }}
        handleSubmit={updateAgency}
      />

      <Form
        title="Description"
        description="The description of your agency. This will be used as the meta description on Google as well."
        helpText="Include SEO-optimized keywords that you want to rank for."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: data?.description!,
          placeholder: "A blog about really interesting things.",
        }}
        handleSubmit={updateAgency}
      />

      <DeleteAgencyForm agencyName={data?.name!} />
    </div>
  );
}
