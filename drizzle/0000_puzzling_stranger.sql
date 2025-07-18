CREATE TYPE "public"."company_type" AS ENUM('customer', 'supplier', 'both');--> statement-breakpoint
CREATE TYPE "public"."part_item_status" AS ENUM('available', 'sold', 'damaged', 'reserved');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'pending', 'confirmed', 'cancelled', 'expired', 'invoiced', 'sold');--> statement-breakpoint
CREATE TABLE "Address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"addressLine1" varchar(255) NOT NULL,
	"addressLine2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postalCode" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "company_type" NOT NULL,
	"logo" varchar(500),
	"email" varchar(255),
	"phoneNumber" varchar(20),
	"faxNumber" varchar(20),
	"website" varchar(255),
	"tin" varchar(50),
	"registrationNumber" varchar(100),
	"addressLine1" varchar(255),
	"addressLine2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"country" varchar(100),
	"bankName" varchar(255),
	"accountNumber" varchar(100),
	"routingNumber" varchar(50),
	"swiftCode" varchar(20),
	"creditLimit" numeric(15, 2),
	"paymentTerms" varchar(100),
	"taxRate" numeric(5, 2),
	"isActive" boolean DEFAULT true NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "InvoiceItems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceId" uuid NOT NULL,
	"quotationItemId" uuid,
	"partId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(15, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"totalPrice" numeric(15, 2) NOT NULL,
	"serialNumbers" jsonb,
	"lotNumbers" jsonb,
	"deliveryDate" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceNumber" varchar(100) NOT NULL,
	"quotationId" uuid NOT NULL,
	"companyId" uuid,
	"subtotal" numeric(15, 2) NOT NULL,
	"taxAmount" numeric(15, 2) DEFAULT '0',
	"discountAmount" numeric(15, 2) DEFAULT '0',
	"shippingAmount" numeric(15, 2) DEFAULT '0',
	"totalAmount" numeric(15, 2) NOT NULL,
	"paidAmount" numeric(15, 2) DEFAULT '0',
	"balanceAmount" numeric(15, 2) NOT NULL,
	"dueDate" timestamp,
	"paymentStatus" varchar(50) DEFAULT 'pending',
	"notes" text,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "PartItems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partId" uuid NOT NULL,
	"barCode" varchar(100),
	"serialNumber" varchar(100),
	"location" varchar(100),
	"shelveLocation" varchar(100),
	"supplierId" uuid,
	"purchasePrice" numeric(15, 2),
	"purchaseDate" timestamp,
	"expiryDate" timestamp,
	"warrantyPeriod" integer,
	"condition" varchar(50) DEFAULT 'new',
	"status" "part_item_status" DEFAULT 'available' NOT NULL,
	"quotationId" uuid,
	"notes" text,
	"addedBy" uuid NOT NULL,
	"updatedBy" uuid,
	"addedOn" timestamp DEFAULT now() NOT NULL,
	"updatedOn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PartItems_barCode_unique" UNIQUE("barCode")
);
--> statement-breakpoint
CREATE TABLE "Parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partNumber" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"brand" varchar(100),
	"category" varchar(100),
	"subcategory" varchar(100),
	"compatibleModels" jsonb,
	"specifications" jsonb,
	"images" jsonb,
	"price" numeric(15, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"costPrice" numeric(15, 2),
	"weight" numeric(10, 3),
	"dimensions" jsonb,
	"minimumStock" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdBy" uuid NOT NULL,
	"updatedBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Parts_partNumber_unique" UNIQUE("partNumber")
);
--> statement-breakpoint
CREATE TABLE "QuotationItems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotationId" uuid NOT NULL,
	"partId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(15, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"totalPrice" numeric(15, 2) NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotationNumber" varchar(100) NOT NULL,
	"companyId" uuid,
	"customerName" varchar(255),
	"customerEmail" varchar(255),
	"customerPhone" varchar(20),
	"customerAddress" text,
	"subtotal" numeric(15, 2) NOT NULL,
	"taxAmount" numeric(15, 2) DEFAULT '0',
	"discountAmount" numeric(15, 2) DEFAULT '0',
	"shippingAmount" numeric(15, 2) DEFAULT '0',
	"totalAmount" numeric(15, 2) NOT NULL,
	"status" "quotation_status" DEFAULT 'draft' NOT NULL,
	"validUntil" timestamp,
	"paymentTerms" varchar(255),
	"notes" text,
	"internalNotes" text,
	"createdBy" uuid NOT NULL,
	"updatedBy" uuid,
	"confirmedBy" uuid,
	"confirmedAt" timestamp,
	"invoicedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Quotations_quotationNumber_unique" UNIQUE("quotationNumber")
);
--> statement-breakpoint
CREATE TABLE "Roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"access" jsonb NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "StockTransactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partId" uuid NOT NULL,
	"partItemId" uuid,
	"transactionType" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"referenceType" varchar(50),
	"referenceId" uuid,
	"notes" text,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserCompanies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	"roleId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(20),
	"password" varchar(255) NOT NULL,
	"roleId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isEmailVerified" boolean DEFAULT false NOT NULL,
	"lastLoginAt" timestamp,
	"profileImage" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvoiceItems" ADD CONSTRAINT "InvoiceItems_invoiceId_Invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvoiceItems" ADD CONSTRAINT "InvoiceItems_quotationItemId_QuotationItems_id_fk" FOREIGN KEY ("quotationItemId") REFERENCES "public"."QuotationItems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvoiceItems" ADD CONSTRAINT "InvoiceItems_partId_Parts_id_fk" FOREIGN KEY ("partId") REFERENCES "public"."Parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_quotationId_Quotations_id_fk" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_createdBy_Users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PartItems" ADD CONSTRAINT "PartItems_partId_Parts_id_fk" FOREIGN KEY ("partId") REFERENCES "public"."Parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PartItems" ADD CONSTRAINT "PartItems_supplierId_Companies_id_fk" FOREIGN KEY ("supplierId") REFERENCES "public"."Companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PartItems" ADD CONSTRAINT "PartItems_quotationId_Quotations_id_fk" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PartItems" ADD CONSTRAINT "PartItems_addedBy_Users_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PartItems" ADD CONSTRAINT "PartItems_updatedBy_Users_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Parts" ADD CONSTRAINT "Parts_createdBy_Users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Parts" ADD CONSTRAINT "Parts_updatedBy_Users_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuotationItems" ADD CONSTRAINT "QuotationItems_quotationId_Quotations_id_fk" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuotationItems" ADD CONSTRAINT "QuotationItems_partId_Parts_id_fk" FOREIGN KEY ("partId") REFERENCES "public"."Parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quotations" ADD CONSTRAINT "Quotations_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quotations" ADD CONSTRAINT "Quotations_createdBy_Users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quotations" ADD CONSTRAINT "Quotations_updatedBy_Users_id_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quotations" ADD CONSTRAINT "Quotations_confirmedBy_Users_id_fk" FOREIGN KEY ("confirmedBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_partId_Parts_id_fk" FOREIGN KEY ("partId") REFERENCES "public"."Parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_partItemId_PartItems_id_fk" FOREIGN KEY ("partItemId") REFERENCES "public"."PartItems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StockTransactions" ADD CONSTRAINT "StockTransactions_createdBy_Users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanies" ADD CONSTRAINT "UserCompanies_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanies" ADD CONSTRAINT "UserCompanies_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCompanies" ADD CONSTRAINT "UserCompanies_roleId_Roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_Roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Roles"("id") ON DELETE no action ON UPDATE no action;