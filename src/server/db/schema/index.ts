import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for better type safety
export const quotationStatusEnum = pgEnum('quotation_status', [
  'draft', 
  'pending', 
  'confirmed', 
  'cancelled', 
  'expired', 
  'invoiced', 
  'sold'
]);

export const partItemStatusEnum = pgEnum('part_item_status', [
  'available', 
  'sold', 
  'damaged', 
  'reserved'
]);

export const companyTypeEnum = pgEnum('company_type', [
  'customer', 
  'supplier', 
  'both'
]);

// Roles Table
export const Roles = pgTable('Roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  access: jsonb('access').notNull(), // Store permissions as JSON array
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Users Table
export const Users = pgTable('Users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('firstName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phoneNumber', { length: 20 }),
  password: varchar('password', { length: 255 }).notNull(),
  roleId: uuid('roleId').references(() => Roles.id).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isEmailVerified: boolean('isEmailVerified').default(false).notNull(),
  lastLoginAt: timestamp('lastLoginAt'),
  profileImage: varchar('profileImage', { length: 500 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Address Table
export const Address = pgTable('Address', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => Users.id).notNull(),
  addressLine1: varchar('addressLine1', { length: 255 }).notNull(),
  addressLine2: varchar('addressLine2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postalCode', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  isActive: boolean('isActive').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Companies Table
export const Companies = pgTable('Companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: companyTypeEnum('type').notNull(),
  logo: varchar('logo', { length: 500 }),
  email: varchar('email', { length: 255 }),
  phoneNumber: varchar('phoneNumber', { length: 20 }),
  faxNumber: varchar('faxNumber', { length: 20 }),
  website: varchar('website', { length: 255 }),
  tin: varchar('tin', { length: 50 }),
  registrationNumber: varchar('registrationNumber', { length: 100 }),
  // Address fields
  addressLine1: varchar('addressLine1', { length: 255 }),
  addressLine2: varchar('addressLine2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postalCode', { length: 20 }),
  country: varchar('country', { length: 100 }),
  // Bank details
  bankName: varchar('bankName', { length: 255 }),
  accountNumber: varchar('accountNumber', { length: 100 }),
  routingNumber: varchar('routingNumber', { length: 50 }),
  swiftCode: varchar('swiftCode', { length: 20 }),
  // Additional fields
  creditLimit: decimal('creditLimit', { precision: 15, scale: 2 }),
  paymentTerms: varchar('paymentTerms', { length: 100 }),
  taxRate: decimal('taxRate', { precision: 5, scale: 2 }),
  isActive: boolean('isActive').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// UserCompanies Table (Junction table)
export const UserCompanies = pgTable('UserCompanies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => Users.id).notNull(),
  companyId: uuid('companyId').references(() => Companies.id).notNull(),
  roleId: uuid('roleId').references(() => Roles.id).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Parts Table
export const Parts = pgTable('Parts', {
  id: uuid('id').primaryKey().defaultRandom(),
  partNumber: varchar('partNumber', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  brand: varchar('brand', { length: 100 }),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  compatibleModels: jsonb('compatibleModels'), // Array of compatible models
  specifications: jsonb('specifications'), // Technical specifications
  images: jsonb('images'), // Array of image URLs
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  costPrice: decimal('costPrice', { precision: 15, scale: 2 }),
  weight: decimal('weight', { precision: 10, scale: 3 }),
  dimensions: jsonb('dimensions'), // {length, width, height, unit}
  minimumStock: integer('minimumStock').default(0),
  isActive: boolean('isActive').default(true).notNull(),
  createdBy: uuid('createdBy').references(() => Users.id).notNull(),
  updatedBy: uuid('updatedBy').references(() => Users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// PartItems Table
export const PartItems = pgTable('PartItems', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('partId').references(() => Parts.id).notNull(),
  barCode: varchar('barCode', { length: 100 }).unique(),
  serialNumber: varchar('serialNumber', { length: 100 }),
  location: varchar('location', { length: 100 }),
  shelveLocation: varchar('shelveLocation', { length: 100 }),
  supplierId: uuid('supplierId').references(() => Companies.id),
  purchasePrice: decimal('purchasePrice', { precision: 15, scale: 2 }),
  purchaseDate: timestamp('purchaseDate'),
  expiryDate: timestamp('expiryDate'),
  warrantyPeriod: integer('warrantyPeriod'), // in months
  condition: varchar('condition', { length: 50 }).default('new'), // new, refurbished, used
  status: partItemStatusEnum('status').default('available').notNull(),
  quotationId: uuid('quotationId').references(() => Quotations.id),
  notes: text('notes'),
  addedBy: uuid('addedBy').references(() => Users.id).notNull(),
  updatedBy: uuid('updatedBy').references(() => Users.id),
  addedOn: timestamp('addedOn').defaultNow().notNull(),
  updatedOn: timestamp('updatedOn').defaultNow().notNull(),
});

// Quotations Table
export const Quotations = pgTable('Quotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  quotationNumber: varchar('quotationNumber', { length: 100 }).notNull().unique(),
  companyId: uuid('companyId').references(() => Companies.id),
  customerName: varchar('customerName', { length: 255 }),
  customerEmail: varchar('customerEmail', { length: 255 }),
  customerPhone: varchar('customerPhone', { length: 20 }),
  customerAddress: text('customerAddress'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).default('0'),
  shippingAmount: decimal('shippingAmount', { precision: 15, scale: 2 }).default('0'),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  status: quotationStatusEnum('status').default('draft').notNull(),
  validUntil: timestamp('validUntil'),
  paymentTerms: varchar('paymentTerms', { length: 255 }),
  notes: text('notes'),
  internalNotes: text('internalNotes'),
  createdBy: uuid('createdBy').references(() => Users.id).notNull(),
  updatedBy: uuid('updatedBy').references(() => Users.id),
  confirmedBy: uuid('confirmedBy').references(() => Users.id),
  confirmedAt: timestamp('confirmedAt'),
  invoicedAt: timestamp('invoicedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// QuotationItems Table
export const QuotationItems = pgTable('QuotationItems', {
  id: uuid('id').primaryKey().defaultRandom(),
  quotationId: uuid('quotationId').references(() => Quotations.id).notNull(),
  partId: uuid('partId').references(() => Parts.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  totalPrice: decimal('totalPrice', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Invoices Table (for when quotations are converted)
export const Invoices = pgTable('Invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoiceNumber', { length: 100 }).notNull().unique(),
  quotationId: uuid('quotationId').references(() => Quotations.id).notNull(),
  companyId: uuid('companyId').references(() => Companies.id),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).default('0'),
  shippingAmount: decimal('shippingAmount', { precision: 15, scale: 2 }).default('0'),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paidAmount', { precision: 15, scale: 2 }).default('0'),
  balanceAmount: decimal('balanceAmount', { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp('dueDate'),
  paymentStatus: varchar('paymentStatus', { length: 50 }).default('pending'), // pending, partial, paid, overdue
  notes: text('notes'),
  createdBy: uuid('createdBy').references(() => Users.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// InvoiceItems Table (for actual invoiced items)
export const InvoiceItems = pgTable('InvoiceItems', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoiceId').references(() => Invoices.id).notNull(),
  quotationItemId: uuid('quotationItemId').references(() => QuotationItems.id), // Optional reference to original quote item
  partId: uuid('partId').references(() => Parts.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  totalPrice: decimal('totalPrice', { precision: 15, scale: 2 }).notNull(),
  serialNumbers: jsonb('serialNumbers'), // Array of serial numbers for shipped items
  lotNumbers: jsonb('lotNumbers'), // Array of lot numbers
  deliveryDate: timestamp('deliveryDate'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Stock Transactions Table (for inventory tracking)
export const StockTransactions = pgTable('StockTransactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('partId').references(() => Parts.id).notNull(),
  partItemId: uuid('partItemId').references(() => PartItems.id),
  transactionType: varchar('transactionType', { length: 50 }).notNull(), // in, out, adjustment, transfer
  quantity: integer('quantity').notNull(),
  referenceType: varchar('referenceType', { length: 50 }), // quotation, purchase, adjustment
  referenceId: uuid('referenceId'),
  notes: text('notes'),
  createdBy: uuid('createdBy').references(() => Users.id).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Relations
export const rolesRelations = relations(Roles, ({ many }) => ({
  users: many(Users),
  userCompanies: many(UserCompanies),
}));

export const usersRelations = relations(Users, ({ one, many }) => ({
  role: one(Roles, {
    fields: [Users.roleId],
    references: [Roles.id],
  }),
  addresses: many(Address),
  userCompanies: many(UserCompanies),
  createdParts: many(Parts, { relationName: 'createdBy' }),
  updatedParts: many(Parts, { relationName: 'updatedBy' }),
  addedPartItems: many(PartItems, { relationName: 'addedBy' }),
  updatedPartItems: many(PartItems, { relationName: 'updatedBy' }),
  createdQuotations: many(Quotations, { relationName: 'createdBy' }),
  updatedQuotations: many(Quotations, { relationName: 'updatedBy' }),
  confirmedQuotations: many(Quotations, { relationName: 'confirmedBy' }),
  createdInvoices: many(Invoices),
  stockTransactions: many(StockTransactions),
}));

export const addressRelations = relations(Address, ({ one }) => ({
  user: one(Users, {
    fields: [Address.userId],
    references: [Users.id],
  }),
}));

export const companiesRelations = relations(Companies, ({ many }) => ({
  userCompanies: many(UserCompanies),
  suppliedPartItems: many(PartItems),
  quotations: many(Quotations),
  invoices: many(Invoices),
}));

export const userCompaniesRelations = relations(UserCompanies, ({ one }) => ({
  user: one(Users, {
    fields: [UserCompanies.userId],
    references: [Users.id],
  }),
  company: one(Companies, {
    fields: [UserCompanies.companyId],
    references: [Companies.id],
  }),
  role: one(Roles, {
    fields: [UserCompanies.roleId],
    references: [Roles.id],
  }),
}));

export const partsRelations = relations(Parts, ({ one, many }) => ({
  createdBy: one(Users, {
    fields: [Parts.createdBy],
    references: [Users.id],
    relationName: 'createdBy',
  }),
  updatedBy: one(Users, {
    fields: [Parts.updatedBy],
    references: [Users.id],
    relationName: 'updatedBy',
  }),
  partItems: many(PartItems),
  quotationItems: many(QuotationItems),
  stockTransactions: many(StockTransactions),
}));

export const partItemsRelations = relations(PartItems, ({ one }) => ({
  part: one(Parts, {
    fields: [PartItems.partId],
    references: [Parts.id],
  }),
  supplier: one(Companies, {
    fields: [PartItems.supplierId],
    references: [Companies.id],
  }),
  quotation: one(Quotations, {
    fields: [PartItems.quotationId],
    references: [Quotations.id],
  }),
  addedBy: one(Users, {
    fields: [PartItems.addedBy],
    references: [Users.id],
    relationName: 'addedBy',
  }),
  updatedBy: one(Users, {
    fields: [PartItems.updatedBy],
    references: [Users.id],
    relationName: 'updatedBy',
  }),
}));

export const quotationsRelations = relations(Quotations, ({ one, many }) => ({
  company: one(Companies, {
    fields: [Quotations.companyId],
    references: [Companies.id],
  }),
  createdBy: one(Users, {
    fields: [Quotations.createdBy],
    references: [Users.id],
    relationName: 'createdBy',
  }),
  updatedBy: one(Users, {
    fields: [Quotations.updatedBy],
    references: [Users.id],
    relationName: 'updatedBy',
  }),
  confirmedBy: one(Users, {
    fields: [Quotations.confirmedBy],
    references: [Users.id],
    relationName: 'confirmedBy',
  }),
  quotationItems: many(QuotationItems),
  partItems: many(PartItems),
  invoices: many(Invoices),
}));

export const quotationItemsRelations = relations(QuotationItems, ({ one, many }) => ({
  quotation: one(Quotations, {
    fields: [QuotationItems.quotationId],
    references: [Quotations.id],
  }),
  part: one(Parts, {
    fields: [QuotationItems.partId],
    references: [Parts.id],
  }),
  invoiceItems: many(InvoiceItems),
}));

export const invoicesRelations = relations(Invoices, ({ one, many }) => ({
  quotation: one(Quotations, {
    fields: [Invoices.quotationId],
    references: [Quotations.id],
  }),
  company: one(Companies, {
    fields: [Invoices.companyId],
    references: [Companies.id],
  }),
  createdBy: one(Users, {
    fields: [Invoices.createdBy],
    references: [Users.id],
  }),
  invoiceItems: many(InvoiceItems),
}));

export const invoiceItemsRelations = relations(InvoiceItems, ({ one }) => ({
  invoice: one(Invoices, {
    fields: [InvoiceItems.invoiceId],
    references: [Invoices.id],
  }),
  quotationItem: one(QuotationItems, {
    fields: [InvoiceItems.quotationItemId],
    references: [QuotationItems.id],
  }),
  part: one(Parts, {
    fields: [InvoiceItems.partId],
    references: [Parts.id],
  }),
}));

export const stockTransactionsRelations = relations(StockTransactions, ({ one }) => ({
  part: one(Parts, {
    fields: [StockTransactions.partId],
    references: [Parts.id],
  }),
  partItem: one(PartItems, {
    fields: [StockTransactions.partItemId],
    references: [PartItems.id],
  }),
  createdBy: one(Users, {
    fields: [StockTransactions.createdBy],
    references: [Users.id],
  }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: varchar("SessionToken").primaryKey(),
  userId: uuid("UserId")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});


// Export all tables for easy access
export const schema = {
  Roles,
  Users,
  Address,
  Companies,
  UserCompanies,
  Parts,
  PartItems,
  Quotations,
  QuotationItems,
  Invoices,
  InvoiceItems,
  StockTransactions,
  // Relations
  rolesRelations,
  usersRelations,
  addressRelations,
  companiesRelations,
  userCompaniesRelations,
  partsRelations,
  partItemsRelations,
  quotationsRelations,
  quotationItemsRelations,
  invoicesRelations,
  invoiceItemsRelations,
  stockTransactionsRelations,
};

// Type exports for TypeScript
export type Role = typeof Roles.$inferSelect;
export type NewRole = typeof Roles.$inferInsert;
export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;
export type Address = typeof Address.$inferSelect;
export type NewAddress = typeof Address.$inferInsert;
export type Company = typeof Companies.$inferSelect;
export type NewCompany = typeof Companies.$inferInsert;
export type UserCompany = typeof UserCompanies.$inferSelect;
export type NewUserCompany = typeof UserCompanies.$inferInsert;
export type Part = typeof Parts.$inferSelect;
export type NewPart = typeof Parts.$inferInsert;
export type PartItem = typeof PartItems.$inferSelect;
export type NewPartItem = typeof PartItems.$inferInsert;
export type Quotation = typeof Quotations.$inferSelect;
export type NewQuotation = typeof Quotations.$inferInsert;
export type QuotationItem = typeof QuotationItems.$inferSelect;
export type NewQuotationItem = typeof QuotationItems.$inferInsert;
export type InvoiceItem = typeof InvoiceItems.$inferSelect;
export type NewInvoiceItem = typeof InvoiceItems.$inferInsert;
export type Invoice = typeof Invoices.$inferSelect;
export type NewInvoice = typeof Invoices.$inferInsert;
export type StockTransaction = typeof StockTransactions.$inferSelect;
export type NewStockTransaction = typeof StockTransactions.$inferInsert;