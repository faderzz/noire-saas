import { notFound } from "next/navigation";
import { getAgencyData, getProjectData } from "@/lib/fetchers";
import BlurImage from "@/components/blur-image";
import { toDateString } from "@/lib/utils";
import db from "@/lib/db";
import { projects, agencies } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const slug = decodeURIComponent(params.slug);

  const [data, agencyData] = await Promise.all([
    getProjectData(domain, slug),
    getAgencyData(domain),
  ]);
  if (!data || !agencyData) {
    return null;
  }
  const { name, description } = data;

  return {
    name,
    description,
    openGraph: {
      name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      name,
      description,
      creator: "@vercel",
    },
    // Optional: Set canonical URL to custom domain if it exists
    // ...(params.domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
    //   agencyData.customDomain && {
    //     alternates: {
    //       canonical: `https://${agencyData.customDomain}/${params.slug}`,
    //     },
    //   }),
  };
}

export async function generateStaticParams() {
  const allProjects = await db
    .select({
      slug: projects.id,
      agency: {
        subdomain: agencies.subdomain,
        customDomain: agencies.customDomain,
      },
    })
    .from(projects)
    .leftJoin(agencies, eq(projects.agencyId, agencies.id))
    .where(eq(agencies.subdomain, "demo")); // feel free to remove this filter if you want to generate paths for all projects

  const allPaths = allProjects
    .flatMap(({ agency, slug }) => [
      agency?.subdomain && {
        domain: `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        slug,
      },
      agency?.customDomain && {
        domain: agency.customDomain,
        slug,
      },
    ])
    .filter(Boolean);

  return allPaths;
}

export default async function AgencyProjectPage({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const slug = decodeURIComponent(params.slug);
  const data = await getProjectData(domain, slug);

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 md:text-base dark:text-stone-400">
            {toDateString(data.createdAt)}
          </p>
          <h1 className="mb-10 font-title text-3xl font-bold text-stone-800 md:text-6xl dark:text-white">
            {data.name}
          </h1>
          <p className="text-md m-auto w-10/12 text-stone-600 md:text-lg dark:text-stone-400">
            {data.description}
          </p>
        </div>
        <a
          // if you are using Github OAuth, you can get rid of the Twitter option
          href={
            data.agency?.user?.username
              ? `https://twitter.com/${data.agency.user.username}`
              : `https://github.com/${data.agency?.user?.gh_username}`
          }
          rel="noreferrer"
          target="_blank"
        >
          <div className="my-8">
            <div className="relative inline-block h-8 w-8 overflow-hidden rounded-full align-middle md:h-12 md:w-12">
              {data.agency?.user?.image ? (
                <BlurImage
                  alt={data.agency?.user?.name ?? "User Avatar"}
                  height={80}
                  src={data.agency.user.image}
                  width={80}
                />
              ) : (
                <div className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">
                  ?
                </div>
              )}
            </div>
            <div className="text-md ml-3 inline-block align-middle md:text-lg dark:text-white">
              by <span className="font-semibold">{data.agency?.user?.name}</span>
            </div>
          </div>
        </a>
      </div>
      <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl lg:w-2/3">
        {/* <BlurImage
          alt={data.title ?? "Post image"}
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
          src={data.image ?? "/placeholder.png"}
        /> */}
        <h1 className="text-white">test</h1>
      </div>
    </>
  );
}
