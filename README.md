# Invoice Dashboard with Mock Data

A complete invoice extraction and management dashboard built with **Next.js 16**, **TanStack Query (React Query)**, and **TypeScript**. All data is mocked—no authentication or database required.

## Features

✅ **Dashboard** - Overview of invoice processing with usage stats  
✅ **Extractions** - Browse and filter invoices by status (AI Results, Hold, Duplicate, Approved)  
✅ **Usage Tracking** - Monitor document uploads and extraction quotas  
✅ **Settings** - View profile and account information  
✅ **TanStack Query** - Efficient data fetching with caching and synchronization  
✅ **TypeScript** - Full type safety throughout the application  
✅ **Mock Data** - Completely functional demo with realistic data  

## Project Structure

```
app/
├── page.tsx              # Dashboard home page
├── extractions/
│   └── page.tsx          # Extractions management
├── usage/
│   └── page.tsx          # Usage & quota tracking
├── settings/
│   └── page.tsx          # Account settings
├── layout.tsx            # Root layout with providers
└── providers.tsx         # TanStack Query provider setup

components/
├── app-sidebar.tsx       # Navigation sidebar
├── invoices-overview.tsx # Recent invoices widget
├── usage-stats.tsx       # Usage stats cards
└── ui/                   # shadcn/ui components

lib/
├── hooks.ts              # TanStack Query hooks
└── mock-data.ts          # Mock data generation
```

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Run the development server**
   ```bash
   pnpm dev
   ```

3. **Open your browser**
   - Navigate to `http://localhost:3000`

## Pages

### Dashboard (`/`)
- Overview of invoice processing metrics
- Usage statistics (uploads & extractions)
- Recent invoices at a glance

### Extractions (`/extractions`)
- Tabbed interface for invoice status filtering
- Search and filter invoices by name or client
- Shows invoice details, status counts, and page counts
- Responsive invoice list with status badges

### Usage (`/usage`)
- Detailed usage statistics
- Upload and extraction quota tracking
- Remaining capacity information

### Settings (`/settings`)
- Profile information display
- Organization details (for Teams tier)
- Subscription plan information

## Data Flow

```
Mock Data Generation
        ↓
useQuery Hooks (TanStack Query)
        ↓
Components with Loading/Error States
        ↓
UI Display with Pagination & Filtering
```

## TanStack Query Setup

All queries are configured in `lib/hooks.ts`:

```typescript
export function useInvoices(): UseQueryResult<...> {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => { /* fetch invoices */ },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

The QueryClient is configured in `app/providers.tsx` with sensible defaults.

## Mock Data

Mock data is generated dynamically in `lib/mock-data.ts`:

- **Invoices**: 15 random invoices with varying page counts and statuses
- **Usage Stats**: 42/100 uploads, 38/100 extractions
- **Profile**: Mock user with Teams subscription tier
- **Counts**: Distributed statuses (approved, hold, duplicate)

## Adding Real Data

To connect to a real backend, update the `queryFn` in `lib/hooks.ts`:

```typescript
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices')
      return res.json()
    },
  })
}
```

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TanStack Query v5** - Server state management
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Lucide Icons** - Beautiful icon library
- **date-fns** - Date formatting utilities

## Key Features Explained

### Caching & Stale Time
All queries have a 5-minute stale time, meaning data is considered fresh for 5 minutes before refetching.

### Loading States
Components show skeleton loaders while data is being fetched, providing a smooth user experience.

### Error Handling
Error states are properly handled with user-friendly messages.

### Pagination
The extractions page supports pagination for large datasets.

### Search & Filter
Real-time search functionality across invoices by file name and client.

## Customization

### Change Mock Data Size
In `lib/mock-data.ts`:
```typescript
generateMockInvoices(count: number = 15) // Change 15 to desired count
```

### Adjust Stale Time
In `lib/hooks.ts`:
```typescript
staleTime: 1000 * 60 * 10 // Change to desired milliseconds
```

### Customize UI
All shadcn/ui components are customizable through:
- Tailwind classes in component files
- `components/ui/` theme configuration

## Browser Support

Works in all modern browsers supporting ES2020+.

## License

MIT

---

Built with ❤️ using v0.app
