import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      tokenKey: uniqueIndex("VerificationToken_token_key").on(table.token),
      identifierTokenKey: uniqueIndex(
        "VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
    };
  },
);

export const examples = pgTable("Example", {
  id: serial("id").primaryKey().notNull(),
  name: text("name"),
  description: text("description"),
  domainCount: integer("domainCount"),
  url: text("url"),
  image: text("image"),
  imageBlurhash: text("imageBlurhash"),
});

export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    name: text("name"),
    username: text("username"),
    gh_username: text("gh_username"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "date" }),
    image: text("image"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
    };
  },
);

export const accounts = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    oauth_token_secret: text("oauth_token_secret"),
    oauth_token: text("oauth_token"),
  },
  (table) => {
    return {
      userIdIdx: index("Account_userId_idx").on(table.userId),
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "Account_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      providerProviderAccountIdKey: uniqueIndex(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export const sessions = pgTable(
  "Session",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "Session_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      sessionTokenKey: uniqueIndex("Session_sessionToken_key").on(
        table.sessionToken,
      ),
      userIdIdx: index("Session_userId_idx").on(table.userId),
    };
  },
);

export const agencies = pgTable(
  "Agency",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    name: text("name"),
    description: text("description"),
    logo: text("logo").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/JRajRyC-PhBHEinQkupt02jqfKacBVHLWJq7Iy.png",
    ),
    font: text("font").default("font-cal").notNull(),
    image: text("image").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/hxfcV5V-eInX3jbVUhjAt1suB7zB88uGd1j20b.png",
    ),
    imageBlurhash: text("imageBlurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    subdomain: text("subdomain"),
    customDomain: text("customDomain"),
    message404: text("message404").default(
      "Blimey! You''ve found a page that doesn''t exist.",
    ),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("userId"),
  },
  (table) => {
    return {
      subdomainKey: uniqueIndex("Agency_subdomain_key").on(table.subdomain),
      customDomainKey: uniqueIndex("Agency_customDomain_key").on(
        table.customDomain,
      ),
      userIdIdx: index("Agency_userId_idx").on(table.userId),
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "Agency_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export const posts = pgTable(
  "Post",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    title: text("title"),
    description: text("description"),
    content: text("content"),
    slug: text("slug")
      .notNull()
      .$defaultFn(() => createId()),
    image: text("image").default(
      "https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/hxfcV5V-eInX3jbVUhjAt1suB7zB88uGd1j20b.png",
    ),
    imageBlurhash: text("imageBlurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    published: boolean("published").default(false).notNull(),
    agencyId: text("agencyId"),
    userId: text("userId"),
  },
  (table) => {
    return {
      agencyIdIdx: index("Post_agencyId_idx").on(table.agencyId),
      userIdIdx: index("Post_userId_idx").on(table.userId),
      slugAgencyIdKey: uniqueIndex("Post_slug_agencyId_key").on(
        table.slug,
        table.agencyId,
      ),
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "Post_userId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
      agencyFk: foreignKey({
        columns: [table.agencyId],
        foreignColumns: [agencies.id],
        name: "Post_agencyId_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

export const postsRelations = relations(posts, ({ one }) => ({
  agency: one(agencies, { references: [agencies.id], fields: [posts.agencyId] }),
  user: one(users, { references: [users.id], fields: [posts.userId] }),
}));

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  posts: many(posts),
  user: one(users, { references: [users.id], fields: [agencies.userId] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [sessions.userId] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [accounts.userId] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  agencies: many(agencies),
  posts: many(posts),
}));

export type SelectAgency = typeof agencies.$inferSelect;
export type SelectPost = typeof posts.$inferSelect;
export type SelectExample = typeof examples.$inferSelect;
