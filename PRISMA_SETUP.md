# Prisma PostgreSQL Setup Guide

This project has been refactored to use **Prisma ORM** with **PostgreSQL** and **Next.js Server Actions** instead of mock data and client-side services.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud-hosted)
- `npm` or `pnpm` package manager

## Step 1: Environment Configuration

Create a `.env.local` file in the project root with your PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/invoice_db"
```

For **Vercel Postgres**:
```bash
DATABASE_URL="postgresql://user:password@host.us-east-1.postgres.vercel-storage.com/invoice_db"
```

For **Neon** (PostgreSQL service):
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/invoice_db"
```

For **AWS RDS**:
```bash
DATABASE_URL="postgresql://user:password@rds-instance.region.rds.amazonaws.com:5432/invoice_db"
```

## Step 2: Install Prisma

Dependencies are already added to `package.json`:
- `@prisma/client` - ORM runtime
- `@prisma/cli` - Prisma CLI tools

Install dependencies:
```bash
npm install
# or
pnpm install
```

## Step 3: Initialize Database Schema

Generate the Prisma client and create the database tables:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create the database if it doesn't exist
2. Apply the schema from `prisma/schema.prisma`
3. Generate the Prisma client

## Step 4: (Optional) Seed Database

To populate the database with initial data, create `prisma/seed.ts`:

```typescript
import { prisma } from '@/lib/prisma'

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      uploads_limit: 500,
    },
  })

  // Create field definitions
  await prisma.fieldDefinition.createMany({
    data: [
      { name: 'invoice_number', description: 'Invoice number', type: 'text' },
      { name: 'invoice_date', description: 'Date of invoice', type: 'date' },
      { name: 'due_date', description: 'Due date for payment', type: 'date' },
      { name: 'total_amount', description: 'Total amount of invoice', type: 'number' },
      { name: 'description', description: 'Description of the line item', type: 'text' },
      { name: 'quantity', description: 'Quantity of items', type: 'number' },
      { name: 'unit_price', description: 'Price per unit', type: 'number' },
      { name: 'amount', description: 'Total amount (quantity × unit price)', type: 'number' },
    ],
  })

  console.log('Seed data created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run seed:
```bash
npx prisma db seed
```

## Step 5: Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Navigate to `http://localhost:3000`

## Project Structure

### Database Schema (`prisma/schema.prisma`)

**Tables:**
- `User` - User accounts with upload limits
- `InvoiceDocument` - Main invoice records
- `InvoicePage` - Individual pages of invoices (with images)
- `InvoiceHeader` - Invoice header fields (invoice_number, date, etc.)
- `InvoiceLineItem` - Line items with flexible JSON data
- `FieldDefinition` - Field definitions for invoices

### Server Actions (`app/actions/`)

All backend logic is organized in server actions:

- **`invoices.ts`** - Invoice CRUD operations
  - `getInvoices(userId, status?)` - Fetch invoices by status
  - `getInvoiceById(invoiceId)` - Fetch single invoice
  - `updateInvoiceStatus(invoiceId, status)` - Change status
  - `deleteInvoice(invoiceId)` - Delete invoice
  - `getInvoiceCounts(userId)` - Count invoices by status

- **`uploads.ts`** - File upload & invoice creation
  - `createInvoiceDocument(input)` - Create invoice with pages and headers
  - `updateInvoiceHeaders(invoiceId, headers)` - Update headers
  - `updateInvoiceLineItems(invoiceId, lineItems)` - Update line items

- **`fields.ts`** - Field definitions management
  - `getFieldDefinitions()` - Fetch all field definitions
  - `createCustomField(name, description, type)` - Add custom field
  - `updateField(fieldId, description)` - Update field

- **`users.ts`** - User management
  - `getUserProfile(userId)` - Fetch user info
  - `getUserUsage(userId)` - Get upload counts
  - `createUser(email, name)` - Create new user

### TanStack Query Hooks (`lib/hooks.ts`)

All hooks now use server actions with caching:

```typescript
// Invoices
const { data: invoices } = useInvoices(userId, 'approved')
const { data: counts } = useInvoiceCounts(userId)
const updateStatus = useUpdateInvoiceStatus()

// Users
const { data: profile } = useUserProfile(userId)
const { data: usage } = useUserUsage(userId)

// Fields
const { data: fields } = useFieldDefinitions()
```

### Prisma Client (`lib/prisma.ts`)

Singleton instance with proper connection pooling:

```typescript
import { prisma } from '@/lib/prisma'

// Use in server actions
const invoice = await prisma.invoiceDocument.findUnique({
  where: { id: invoiceId },
})
```

## Common Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name add_field_name

# Generate Prisma client types
npx prisma generate

# Check database connection
npx prisma db execute --stdin < query.sql
```

## Deployment (Vercel)

1. Add `DATABASE_URL` to Vercel project settings (Environment Variables)
2. Run migrations before deployment:
   ```bash
   npx prisma migrate deploy
   ```
3. Deploy with `git push` or `vercel deploy`

## Removed Mock Files

The following files have been removed as they're no longer needed:

- `lib/mock-data.ts` - Mock data generator
- `service/extraction.service.ts` - Mock invoice service
- `service/uploadbox.service.ts` - Mock upload service
- `service/invoiceFieldsService.ts` - Mock field service
- `service/ZoomableImage.service.ts` - Mock image service
- `service/insert.service.ts` - Mock update service
- `utils/supabase/` - Supabase mock utilities
- `context/GlobalState.tsx` - Global state context

All functionality is now handled by Prisma + Server Actions.

## Next Steps

1. Update components to use the new hooks with actual user IDs
2. Add authentication (Auth.js, Supabase Auth, etc.)
3. Implement file upload handling (Vercel Blob, AWS S3, etc.)
4. Add PDF processing (pdfjs-dist is already configured)
5. Set up database backups and monitoring
