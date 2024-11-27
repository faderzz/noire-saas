import { unstable_cache } from "next/cache";
import db from "./db";
import { and, desc, eq, not } from "drizzle-orm";
import { posts, agencies, users, projects } from "./schema";
import { serialize } from "next-mdx-remote/serialize";
import { replaceExamples, replaceTweets } from "@/lib/remark-plugins";

export async function getAgencyData(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      return await db.query.agencies.findFirst({
        where: subdomain
          ? eq(agencies.subdomain, subdomain)
          : eq(agencies.customDomain, domain),
        with: {
          user: true,
        },
      });
    },
    [`${domain}-metadata`],
    {
      revalidate: 900,
      tags: [`${domain}-metadata`],
    },
  )();
}

export async function getPostsForAgency(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      return await db
        .select({
          title: posts.title,
          description: posts.description,
          slug: posts.slug,
          image: posts.image,
          imageBlurhash: posts.imageBlurhash,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .leftJoin(agencies, eq(posts.agencyId, agencies.id))
        .where(
          and(
            eq(posts.published, true),
            subdomain
              ? eq(agencies.subdomain, subdomain)
              : eq(agencies.customDomain, domain),
          ),
        )
        .orderBy(desc(posts.createdAt));
    },
    [`${domain}-posts`],
    {
      revalidate: 900,
      tags: [`${domain}-posts`],
    },
  )();
}

// export async function getPostData(domain: string, slug: string) {
//   const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
//     ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
//     : null;

//   return await unstable_cache(
//     async () => {
//       const data = await db
//         .select({
//           post: posts,
//           agency: agencies,
//           user: users,
//         })
//         .from(posts)
//         .leftJoin(agencies, eq(agencies.id, posts.agencyId))
//         .leftJoin(users, eq(users.id, agencies.userId))
//         .where(
//           and(
//             eq(posts.slug, slug),
//             eq(posts.published, true),
//             subdomain
//               ? eq(agencies.subdomain, subdomain)
//               : eq(agencies.customDomain, domain),
//           ),
//         )
//         .then((res) =>
//           res.length > 0
//             ? {
//                 ...res[0].post,
//                 agency: res[0].agency
//                   ? {
//                       ...res[0].agency,
//                       user: res[0].user,
//                     }
//                   : null,
//               }
//             : null,
//         );

//       if (!data) return null;

//       const [mdxSource, adjacentPosts] = await Promise.all([
//         getMdxSource(data.content!),
//         db
//           .select({
//             slug: posts.slug,
//             title: posts.title,
//             createdAt: posts.createdAt,
//             description: posts.description,
//             image: posts.image,
//             imageBlurhash: posts.imageBlurhash,
//           })
//           .from(posts)
//           .leftJoin(agencies, eq(agencies.id, posts.agencyId))
//           .where(
//             and(
//               eq(posts.published, true),
//               not(eq(posts.id, data.id)),
//               subdomain
//                 ? eq(agencies.subdomain, subdomain)
//                 : eq(agencies.customDomain, domain),
//             ),
//           ),
//       ]);

//       return {
//         ...data,
//         mdxSource,
//         adjacentPosts,
//       };
//     },
//     [`${domain}-${slug}`],
//     {
//       revalidate: 900, // 15 minutes
//       tags: [`${domain}-${slug}`],
//     },
//   )();
// }

async function getMdxSource(postContents: string) {
  // transforms links like <link> to [link](link) as MDX doesn't support <link> syntax
  // https://mdxjs.com/docs/what-is-mdx/#markdown
  const content =
    postContents?.replaceAll(/<(https?:\/\/\S+)>/g, "[$1]($1)") ?? "";
  // Serialize the content string into MDX
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [replaceTweets, () => replaceExamples(db)],
    },
  });

  return mdxSource;
}

export async function getProjectData(domain: string, slug: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      const data = await db
        .select({
          project: projects,
          agency: agencies,
          user: users,
        })
        .from(projects)
        .leftJoin(agencies, eq(agencies.id, projects.agencyId))
        .leftJoin(users, eq(users.id, agencies.userId))
        .where(
          and(
            eq(projects.id, slug),
            subdomain
              ? eq(agencies.subdomain, subdomain)
              : eq(agencies.customDomain, domain),
          ),
        )
        .then((res) =>
          res.length > 0
            ? {
                ...res[0].project,
                agency: res[0].agency
                  ? {
                      ...res[0].agency,
                      user: res[0].user,
                    }
                  : null,
              }
            : null,
        );

      if (!data) return null;

      return {
        ...data,
      };
    },
    [`${domain}-project-${slug}`],
    {
      revalidate: 900, // 15 minutes
      tags: [`${domain}-project-${slug}`],
    },
  )();
}

// im ai terry davis lol