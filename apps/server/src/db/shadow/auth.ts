// This file should stay out of the schema folder.
// Any changes to this file should be made in the shadow folder.

import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const authUsers = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	bio: text("bio"),
	role: text("role"), // Nullable, stores comma-separated roles
	banned: boolean("banned"),
	calendar_link: text("calendar_link"),
	banReason: text("banReason"),
	banExpires: timestamp("banExpires", { withTimezone: true }),
	createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const authSessions = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => authUsers.id),
});

export const authAccounts = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => authUsers.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpires: timestamp("accessTokenExpires", { withTimezone: true }),
	refreshTokenExpires: timestamp("refreshTokenExpires", { withTimezone: true }),
	scope: text("scope"),
	password: text("password").notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const authVerifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true }),
	updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const authPasskeys = pgTable("passkey", {
	id: text("id").primaryKey(),
	name: text("name"),
	publicKey: text("publicKey").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => authUsers.id),
	credentialId: text("credentialId").notNull(),
	counter: text("counter").notNull(),
	deviceType: text("deviceType").notNull(),
	backedUp: boolean("backedUp"),
	transports: text("transports"),
	createdAt: timestamp("createdAt", { withTimezone: true }),
	aaguid: text("aaguid"),
});
