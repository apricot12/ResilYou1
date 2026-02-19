import { pgTable, text, timestamp, boolean, integer, index, json } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    avatar: text("avatar"),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["user", "admin"] })
        .notNull()
        .default("user"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    stripeCustomerId: text("stripe_customer_id")
});



export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
})

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(
        () => /* @__PURE__ */ new Date()
    ),
    updatedAt: timestamp("updated_at").$defaultFn(
        () => /* @__PURE__ */ new Date()
    )
})

export const subscriptions = pgTable("subscriptions", {
	id: text('id').primaryKey(),
	plan: text('plan').notNull(),
	referenceId: text('reference_id').notNull(),
	stripeCustomerId: text('stripe_customer_id'),
	stripeSubscriptionId: text('stripe_subscription_id'),
	status: text('status').default("incomplete"),
	periodStart: timestamp('period_start'),
    periodEnd: timestamp("period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    seats: integer("seats"),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end')
});

// Calendar Events Table
export const calendarEvents = pgTable("calendar_events", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startDateTime: timestamp("start_date_time", { withTimezone: true }).notNull(),
    endDateTime: timestamp("end_date_time", { withTimezone: true }).notNull(),
    location: text("location"),
    category: text("category", {
        enum: ["work", "personal", "appointment", "meeting", "other"]
    }).default("other"),
    reminderMinutes: integer("reminder_minutes").default(30),
    recurrence: text("recurrence", {
        enum: ["none", "daily", "weekly", "monthly", "yearly"]
    }).default("none"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date())
}, (table) => ({
    userIdIdx: index("calendar_events_user_id_idx").on(table.userId),
    startDateTimeIdx: index("calendar_events_start_date_time_idx").on(table.startDateTime)
}));

// Chat Conversations Table (for future chatbot feature)
export const chatConversations = pgTable("chat_conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date())
}, (table) => ({
    userIdIdx: index("chat_conversations_user_id_idx").on(table.userId)
}));

// Chat Messages Table (for future chatbot feature)
export const chatMessages = pgTable("chat_messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
        .notNull()
        .references(() => chatConversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    intent: json("intent").$type<{
        type: string;
        confidence: number;
        entities: Record<string, any>;
    }>(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date())
}, (table) => ({
    conversationIdIdx: index("chat_messages_conversation_id_idx").on(table.conversationId)
}));

// Todo Tasks Table
export const todoTasks = pgTable("todo_tasks", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    completed: boolean("completed").default(false).notNull(),
    priority: text("priority", {
        enum: ["low", "medium", "high"]
    }).default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    category: text("category"),
    createdBy: text("created_by", {
        enum: ["user", "ai"]
    }).default("user").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
    completedAt: timestamp("completed_at")
}, (table) => ({
    userIdIdx: index("todo_tasks_user_id_idx").on(table.userId),
    dueDateIdx: index("todo_tasks_due_date_idx").on(table.dueDate),
    completedIdx: index("todo_tasks_completed_idx").on(table.completed)
}));
