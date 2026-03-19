# Invoice Dashboard with AG Grid & Inline Viewer

A comprehensive invoice extraction and management dashboard built with **Next.js 16**, **TanStack Query**, **TypeScript**, and **AG Grid Community**. Features advanced data grid visualization and inline invoice viewer with editable line items.

## Features

✅ **Dashboard** - Overview of invoice processing with usage stats  
✅ **Extractions** - AG Grid-powered invoice table with expandable groups and multi-page support  
✅ **Inline Invoice Viewer** - Full-screen invoice preview with editable headers and line items  
✅ **AG Grid Community** - Advanced table with sorting, filtering, pinned columns, and cell rendering  
✅ **Line Items Editor** - Add, edit, and delete invoice line items with real-time validation  
✅ **Image Viewer** - Zoomable invoice image preview with pan/pinch controls  
✅ **TanStack Query** - Efficient data fetching with caching and synchronization  
✅ **TypeScript** - Full type safety throughout the application  
✅ **Mock Data** - Completely functional demo with realistic invoice data  

## Project Structure

```
app/
├── page.tsx                    # Dashboard home page
├── extractions/
│   └── page.tsx                # Extractions with AG Grid table
├── usage/
│   └── page.tsx                # Usage & quota tracking
├── settings/
│   └── page.tsx                # Account settings
├── layout.tsx                  # Root layout with providers
└── providers.tsx               # TanStack Query provider setup

components/
├── inline-invoice-viewer.tsx   # Full-screen invoice viewer with line items
├── invoices-table.tsx          # AG Grid invoice table with expandable rows
├── app-sidebar.tsx             # Navigation sidebar
├── invoices-overview.tsx       # Recent invoices widget
├── usage-stats.tsx             # Usage stats cards
└── ui/                         # shadcn/ui components

service/
├── extraction.service.ts       # Invoice data queries (useInvoices)
├── ZoomableImage.service.ts    # Image & field header queries
└── insert.service.service.ts   # Invoice update mutation (useUpdateInvoiceStatus)

types/
└── invoice.ts                  # TypeScript types for invoices

lib/
├── hooks.ts                    # Additional TanStack Query hooks
└── mock-data.ts                # Mock data generation
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

### Extractions (`/extractions`) - **AG Grid Powered**
- **AG Grid Community Table** with advanced features:
  - Multi-column sorting and filtering
  - Expandable rows to show multiple pages per invoice
  - Pinned action column on the right
  - Auto-resizing columns with flex layout
  - Status badges inline rendering
  - Page count indicators
- **Tabbed Interface** for invoice status filtering:
  - AI Results (all invoices)
  - Hold (pending review)
  - Duplicate (flagged as duplicate)
  - Approved (completed)
- **Click to View** - Opens inline invoice viewer for detailed inspection
- **Pagination** - Navigate through large invoice sets

### Inline Invoice Viewer (Extractions Modal)
- **Split-screen layout**:
  - Left: Zoomable invoice image preview
  - Right: Editable headers and line items table
- **Image Controls**:
  - Zoom in/out with buttons
  - Pan and pinch zoom support
  - Reset zoom
- **Header Editor**:
  - Inline editable invoice metadata
  - Save headers with one click
- **Line Items AG Grid**:
  - Add new line items with validation
  - Edit existing items in-place
  - Delete items with undo buffer (5-second window)
  - Dynamic columns based on field definitions
- **Status Management**:
  - Mark as Hold, Duplicate, or Approved
  - Update status immediately
  - Navigation between invoices (prev/next)

### Usage (`/usage`)
- Detailed usage statistics
- Upload and extraction quota tracking
- Remaining capacity information

### Settings (`/settings`)
- Profile information display
- Organization details
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
- **TanStack Query v5** - Server state management & data fetching
- **AG Grid Community v33** - Advanced data grid with sorting, filtering, editing
- **react-zoom-pan-pinch** - Image zooming and panning
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Lucide Icons** - Beautiful icon library
- **date-fns** - Date formatting utilities
- **Sonner** - Toast notifications

## Key Features Explained

### AG Grid Invoice Table
- **ModuleRegistry Setup**: All community modules registered once at component initialization
- **Dynamic Columns**: File name, Created At, Client, Status, and Actions
- **Row Expansion**: Multi-page invoices show expandable groups
- **Status Rendering**: Custom cell renderers show status badges with color coding
- **Context Menu**: Actions column with eye icon to view invoices
- **Auto-sizing**: Columns flex to fill available space

### Inline Invoice Viewer
- **State Management**: Uses React state for headers and line items
- **Editable Grid**: AG Grid with cell editing for line items
- **Dynamic Fields**: Columns generated from field definitions
- **Add/Edit/Delete**: Full CRUD operations on line items
- **Validation**: Checks all fields are populated before saving
- **Undo Buffer**: 5-second window to undo deletions

### Caching & Stale Time
All queries have a 5-minute stale time, meaning data is considered fresh for 5 minutes before refetching.

### Loading States
Components show skeleton loaders while data is being fetched, providing a smooth user experience.

### Error Handling
Error states are properly handled with user-friendly messages and Sonner toasts.

### Pagination
The extractions page supports AG Grid pagination for large datasets.

### Search & Filter
Real-time search functionality across invoices with TanStack Query caching.

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
