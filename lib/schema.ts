import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  // if you are using Github OAuth, you can get rid of the username attribute (that is for Twitter OAuth)
  username: text("username"),
  gh_username: text("gh_username"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      compoagencyPk: primaryKey({ columns: [table.identifier, table.token] }),
    };
  },
);

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  domainCount: integer("domainCount"),
  url: text("url"),
  image: text("image"),
  imageBlurhash: text("imageBlurhash"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    refreshTokenExpiresIn: integer("refresh_token_expires_in"),
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
      userIdIdx: index().on(table.userId),
      compoagencyPk: primaryKey({
        columns: [table.provider, table.providerAccountId],
      }),
    };
  },
);

export const agencies = pgTable(
  "agencies",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
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
    subdomain: text("subdomain").unique(),
    customDomain: text("customDomain").unique(),
    message404: text("message404").default(
      "Blimey! You''ve found a page that doesn''t exist.",
    ),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
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
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    published: boolean("published").default(false).notNull(),
    agencyId: text("agencyId").references(() => agencies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      agencyIdIdx: index().on(table.agencyId),
      userIdIdx: index().on(table.userId),
      slugAgencyIdKey: uniqueIndex().on(table.slug, table.agencyId),
    };
  },
);

///// Agency Changes
// New Enums
export const projectStatusEnum = pgEnum('project_status', ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const memberRoleEnum = pgEnum('member_role', ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']);
export const clientStatusEnum = pgEnum('client_status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const leadStatusEnum = pgEnum('lead_status', ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']);

// Agency Members (replacing subusers)
export const agencyMembers = pgTable(
  "agency_members",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    agencyId: text("agencyId")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default('MEMBER'),
    permissions: jsonb("permissions").$type<string[]>().default(['VIEW']),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    agencyUserUnique: uniqueIndex().on(table.agencyId, table.userId),
    agencyIdIdx: index().on(table.agencyId),
    userIdIdx: index().on(table.userId),
  })
);

// Clients
export const clients = pgTable(
  "clients",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    agencyId: text("agencyId")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    status: clientStatusEnum("status").default('ACTIVE'),
    address: jsonb("address").$type<{
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zip?: string;
    }>(),
    customFields: jsonb("customFields").$type<Record<string, any>>(),
    portalAccess: boolean("portalAccess").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    agencyIdIdx: index().on(table.agencyId),
    emailIdx: index().on(table.email),
  })
);

// Client Portal Users
export const clientUsers = pgTable(
  "client_users",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    clientId: text("clientId")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(), // Hashed password
    lastLogin: timestamp("lastLogin", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    clientIdIdx: index().on(table.clientId),
    emailIdx: uniqueIndex().on(table.email),
  })
);

// Projects
export const projects = pgTable(
  "projects",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    agencyId: text("agencyId")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    clientId: text("clientId")
      .references(() => clients.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    status: projectStatusEnum("status").default('NOT_STARTED'),
    priority: priorityEnum("priority").default('MEDIUM'),
    startDate: timestamp("startDate", { mode: "date" }),
    endDate: timestamp("endDate", { mode: "date" }),
    budget: decimal("budget", { precision: 10, scale: 2 }),
    customFields: jsonb("customFields").$type<Record<string, any>>(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    agencyIdIdx: index().on(table.agencyId),
    clientIdIdx: index().on(table.clientId),
  })
);

// Project Tasks
export const tasks = pgTable(
  "tasks",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assignedTo: text("assignedTo")
      .references(() => agencyMembers.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    status: projectStatusEnum("status").default('NOT_STARTED'),
    priority: priorityEnum("priority").default('MEDIUM'),
    dueDate: timestamp("dueDate", { mode: "date" }),
    order: integer("order").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    projectIdIdx: index().on(table.projectId),
    assignedToIdx: index().on(table.assignedTo),
  })
);

// Leads
export const leads = pgTable(
  "leads",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    agencyId: text("agencyId")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    status: leadStatusEnum("status").default('NEW'),
    source: text("source"),
    notes: text("notes"),
    customFields: jsonb("customFields").$type<Record<string, any>>(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    agencyIdIdx: index().on(table.agencyId),
    emailIdx: index().on(table.email),
  })
);

// Invoices
export const invoices = pgTable(
  "invoices",
  {
    id: text("id").$defaultFn(() => createId()).primaryKey(),
    agencyId: text("agencyId")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    clientId: text("clientId")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: text("projectId")
      .references(() => projects.id, { onDelete: "set null" }),
    number: text("number").notNull(),
    status: invoiceStatusEnum("status").default('DRAFT'),
    issueDate: timestamp("issueDate", { mode: "date" }).notNull(),
    dueDate: timestamp("dueDate", { mode: "date" }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).default('0'),
    items: jsonb("items").$type<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }[]>(),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    agencyIdIdx: index().on(table.agencyId),
    clientIdIdx: index().on(table.clientId),
    projectIdIdx: index().on(table.projectId),
  })
);

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  agency: one(agencies, { fields: [projects.agencyId], references: [agencies.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  tasks: many(tasks),
  invoices: many(invoices),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(agencyMembers, { fields: [tasks.assignedTo], references: [agencyMembers.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, { fields: [clients.agencyId], references: [agencies.id] }),
  projects: many(projects),
  invoices: many(invoices),
  users: many(clientUsers),
}));

export const agencyMembersRelations = relations(agencyMembers, ({ one, many }) => ({
  agency: one(agencies, { fields: [agencyMembers.agencyId], references: [agencies.id] }),
  user: one(users, { fields: [agencyMembers.userId], references: [users.id] }),
  tasks: many(tasks),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  agency: one(agencies, { fields: [leads.agencyId], references: [agencies.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  agency: one(agencies, { fields: [invoices.agencyId], references: [agencies.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
}));

// Update existing agency relations
export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  posts: many(posts),
  user: one(users, { references: [users.id], fields: [agencies.userId] }),
  members: many(agencyMembers),
  clients: many(clients),
  projects: many(projects),
  leads: many(leads),
  invoices: many(invoices),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  agency: one(agencies, { references: [agencies.id], fields: [posts.agencyId] }),
  user: one(users, { references: [users.id], fields: [posts.userId] }),
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

// Types
export type SelectProject = typeof projects.$inferSelect;
export type SelectTask = typeof tasks.$inferSelect;
export type SelectClient = typeof clients.$inferSelect;
export type SelectAgencyMember = typeof agencyMembers.$inferSelect;
export type SelectLead = typeof leads.$inferSelect;
export type SelectInvoice = typeof invoices.$inferSelect;

export type SelectAgency = typeof agencies.$inferSelect;
export type SelectPost = typeof posts.$inferSelect;
export type SelectExample = typeof examples.$inferSelect;
