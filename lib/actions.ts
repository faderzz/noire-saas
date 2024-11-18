"use server";

import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  removeDomainFromVercelProject,
  validDomainRegex,
} from "@/lib/domains";
import { getBlurDataURL } from "@/lib/utils";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { withPostAuth, withAgencyAuth } from "./auth";
import db from "./db";
import { SelectPost, SelectAgency, posts, agencies, users } from "./schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createAgency = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const [response] = await db
      .insert(agencies)
      .values({
        name,
        description,
        subdomain,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateAgency = withAgencyAuth(
  async (formData: FormData, agency: SelectAgency, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;

      if (key === "customDomain") {
        if (value.includes("noire.agency")) {
          return {
            error: "Cannot use noire.agency subdomain as your custom domain",
          };

          // if the custom domain is valid, we need to add it to Vercel
        } else if (validDomainRegex.test(value)) {
          response = await db
            .update(agencies)
            .set({
              customDomain: value,
            })
            .where(eq(agencies.id, agency.id))
            .returning()
            .then((res) => res[0]);

          await Promise.all([
            addDomainToVercel(value),
            // Optional: add www subdomain as well and redirect to apex domain
            // addDomainToVercel(`www.${value}`),
          ]);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await db
            .update(agencies)
            .set({
              customDomain: null,
            })
            .where(eq(agencies.id, agency.id))
            .returning()
            .then((res) => res[0]);
        }

        // if the agency had a different customDomain before, we need to remove it from Vercel
        if (agency.customDomain && agency.customDomain !== value) {
          response = await removeDomainFromVercelProject(agency.customDomain);

          /* Optional: remove domain from Vercel team 

          // first, we need to check if the apex domain is being used by other agencies
          const apexDomain = getApexDomain(`https://${agency.customDomain}`);
          const domainCount = await db.select({ count: count() }).from(agencies).where(or(eq(agencies.customDomain, apexDomain), ilike(agencies.customDomain, `%.${apexDomain}`))).then((res) => res[0].count);


          // if the apex domain is being used by other agencies
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(agency.customDomain);
          } else {
            // this is the only agency using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(
              agency.customDomain
            );
          }
          
          */
        }
      } else if (key === "image" || key === "logo") {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return {
            error:
              "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd",
          };
        }

        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await db
          .update(agencies)
          .set({
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          })
          .where(eq(agencies.id, agency.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(agencies)
          .set({
            [key]: value,
          })
          .where(eq(agencies.id, agency.id))
          .returning()
          .then((res) => res[0]);
      }

      console.log(
        "Updated agency data! Revalidating tags: ",
        `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${agency.customDomain}-metadata`,
      );
      revalidateTag(
        `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      agency.customDomain && revalidateTag(`${agency.customDomain}-metadata`);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteAgency = withAgencyAuth(
  async (_: FormData, agency: SelectAgency) => {
    try {
      const [response] = await db
        .delete(agencies)
        .where(eq(agencies.id, agency.id))
        .returning();

      revalidateTag(
        `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      response.customDomain && revalidateTag(`${agency.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const getAgencyFromPostId = async (postId: string) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: {
      agencyId: true,
    },
  });

  return post?.agencyId;
};

export const createPost = withAgencyAuth(
  async (_: FormData, agency: SelectAgency) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const [response] = await db
      .insert(posts)
      .values({
        agencyId: agency.id,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    agency.customDomain && revalidateTag(`${agency.customDomain}-posts`);

    return response;
  },
);

export const createProject = withAgencyAuth(
  async (formData: FormData, agency: SelectAgency) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const budget = formData.get("budget") as string;
    const customFields = formData.get("customFields") as string;

    const [response] = await db
      .insert(projects)
      .values({
        agencyId: agency.id,
        userId: session.user.id,
        name,
        description,
        status: status as any,
        priority: priority as any,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        customFields: customFields ? JSON.parse(customFields) : null,
      })
      .returning();

    revalidateTag(
      `${agency.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-projects`,
    );
    agency.customDomain && revalidateTag(`${agency.customDomain}-projects`);

    return response;
  },
);

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: SelectPost) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, data.id),
    with: {
      agency: true,
    },
  });

  if (!post || post.userId !== session.user.id) {
    return {
      error: "Post not found",
    };
  }

  try {
    const [response] = await db
      .update(posts)
      .set({
        title: data.title,
        description: data.description,
        content: data.content,
      })
      .where(eq(posts.id, data.id))
      .returning();

    revalidateTag(
      `${post.agency?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    revalidateTag(
      `${post.agency?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );

    // if the agency has a custom domain, we need to revalidate those tags too
    post.agency?.customDomain &&
      (revalidateTag(`${post.agency?.customDomain}-posts`),
      revalidateTag(`${post.agency?.customDomain}-${post.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
  async (
    formData: FormData,
    post: SelectPost & {
      agency: SelectAgency;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = await getBlurDataURL(url);
        response = await db
          .update(posts)
          .set({
            image: url,
            imageBlurhash: blurhash,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(posts)
          .set({
            [key]: key === "published" ? value === "true" : value,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      }

      revalidateTag(
        `${post.agency?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.agency?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the agency has a custom domain, we need to revalidate those tags too
      post.agency?.customDomain &&
        (revalidateTag(`${post.agency?.customDomain}-posts`),
        revalidateTag(`${post.agency?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deletePost = withPostAuth(
  async (_: FormData, post: SelectPost) => {
    try {
      const [response] = await db
        .delete(posts)
        .where(eq(posts.id, post.id))
        .returning({
          agencyId: posts.agencyId,
        });

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const [response] = await db
      .update(users)
      .set({
        [key]: value,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
