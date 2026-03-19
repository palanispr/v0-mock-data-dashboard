"use client"

import type React from "react"

import { useState, useMemo, useCallback, JSX } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community"
import { useInvoices, type GroupedInvoice } from "@/service/extraction.service"
import { InlineInvoiceViewer } from "./inline-invoice-viewer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ChevronRight, ChevronDown, FileText } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community"

// Register all community modules **once**
ModuleRegistry.registerModules([AllCommunityModule])

// Import AG Grid styles
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"

interface InvoicesTableProps {
  userId: string
  tab: string
  status: string | null
  dateRange: { from: Date; to: Date }
  searchTerm: string
  selectedClient: string
  currentOrg: string
  subscriptionTier: string
  isTeamsManager: boolean
}

type InvoicePage = GroupedInvoice['pages'][number]



// Custom cell renderer for expand/collapse button and file name
const FileNameCellRenderer = (params: ICellRendererParams) => {
  const data = params.data as GroupedInvoice
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="space-y-2">
      {/* Main file row */}
      <div className="flex items-center gap-2">
        {data.page_count > 1 && (
          <Button variant="ghost" size="sm" onClick={handleToggle} className="h-6 w-6 p-0">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        <FileText className="h-4 w-4 text-gray-500" />
        <span className="font-medium">{data.file_name}</span>
        {data.page_count > 1 && (
          <Badge variant="outline" className="text-xs">
            {data.page_count} pages
          </Badge>
          )}
      </div>
      <div className="flex items-center gap-2 pl-6">
          {/* Status badges */}
          {/* {data.statusCounts.pending > 0 && (
      <Badge variant="destructive" className="text-xs">
        {data.statusCounts.approved} approved
      </Badge>
    )} */}
          {data.statusCounts.approved > 0 && (
  <Badge
    variant="outline"
    className="border-green-500 text-green-500 text-xs"
  >
    {data.statusCounts.approved} approved
  </Badge>
)}
    {data.statusCounts.hold > 0 && (
      <Badge variant="destructive" className="text-xs">
        {data.statusCounts.hold} hold
      </Badge>
    )}
    {data.statusCounts.duplicate > 0 && (
  <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">
    {data.statusCounts.duplicate} duplicate
  </Badge>
)}
      </div>

      {/* Expanded pages */}
      {isExpanded && data.page_count > 1 && (
        <div className="ml-8 space-y-1 border-l-2 border-gray-200 pl-4">
          {data.pages.map((page) => (
            // console.log(page),
            <div key={page.id} className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-600">Page {page.page_number}</span>

              <div className="ml-4">
            {StatusCellRenderer({ value: page.status } as ICellRendererParams)}
          </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (params.context?.onViewPage) {
                    params.context.onViewPage(page)
                  }
                }}
                className="h-6 w-6 p-0 ml-auto"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Custom cell renderer for status badges
const StatusCellRenderer = (params: ICellRendererParams) => {
  const status = params.value as 'hold' | 'duplicate' | 'approved' | null

  if (!status) {
    return <Badge variant="secondary">Pending</Badge>
  }


  const statusConfig: Record<
    'hold' | 'duplicate' | 'approved',
    { variant: Parameters<typeof Badge>[0]['variant']; className?: string; label: string }
  >  = {
    hold: { variant: "destructive" as const, label: "Hold" },
    duplicate: {
      variant: 'outline',
      className: 'border-orange-500 text-orange-500',
      label: 'Duplicate',
    },
    approved: {
      variant: 'outline',
      className: 'border-green-500 text-green-500',
      label: 'Approved',
    },
  }

  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

const MixedStatusRenderer = (params: ICellRendererParams) => {
  const { statusCounts, page_count } = params.data as GroupedInvoice;
  const { approved, hold, duplicate } = statusCounts;
  const pending = page_count - (approved + hold + duplicate);

  // build up badges in display order
  const badges: JSX.Element[] = [];
  if (pending > 0) {
    badges.push(
      <Badge key="pending" variant="secondary" className="text-xs">
        {pending} Pending
      </Badge>
    );
  }
  if (approved > 0) {
    badges.push(
      <Badge key="approved" variant="outline" className="border-green-500 text-green-500 text-xs">
        {approved} Approved
      </Badge>
    );
  }
  if (hold > 0) {
    badges.push(
      <Badge key="hold" variant="destructive" className="text-xs">
        {hold} Hold
      </Badge>
    );
  }
  if (duplicate > 0) {
    badges.push(
      <Badge
        key="duplicate"
        variant="outline"
        className="border-orange-500 text-orange-500 text-xs"
      >
        {duplicate} Duplicate
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>;
};

// Custom cell renderer for actions
const ActionsCellRenderer = (params: ICellRendererParams) => {
  const data = params.data as GroupedInvoice

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (params.context?.onViewInvoice) {
      // For single page documents, view the page directly
      // For multi-page documents, view the first page
      const pageToView = data.page_count === 1 ? data.pages[0] : data.pages[0]
      params.context.onViewInvoice(pageToView)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleViewClick} className="h-8 w-8 p-0">
      <Eye className="h-4 w-4" />
    </Button>
  )
}

export function InvoicesTable({ userId, status, dateRange, searchTerm, selectedClient, currentOrg, subscriptionTier, isTeamsManager }: InvoicesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePage | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  const {
    data: invoices,
    isLoading,
    error,
  } = useInvoices({
    userId,
    status,
    dateRange,
    searchTerm,
    selectedClient,
    page: currentPage,
    pageSize,
    isTeamsManager
  })

  // console.log(isTeamsManager)
  // console.log("InvoicesTable - invoices:", invoices)

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => {
      const cols: ColDef[] = [
      {
        headerName: "File Name",
        field: "file_name",
        flex: 2.5,
        sortable: true,
        filter: true,
        cellRenderer: FileNameCellRenderer,
        autoHeight: true, // Allow row to expand for child pages
      },
      {
        headerName: "Created At",
        field: "created_at",
        flex: 1.5,
        sortable: true,
        filter: "agDateColumnFilter",
        valueFormatter: (params) => {
          if (!params.value) return ""
          return format(new Date(params.value), "MMM dd, yyyy HH:mm")
        },
      },
      {
        headerName: "Client",
        field: "client_name",
        flex: 1,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        sortable: true,
        filter: true,
        cellRenderer: MixedStatusRenderer,
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: ActionsCellRenderer,
        pinned: "right",
      },

    ];
    if (isTeamsManager) {
      // Insert the Users column after Client
      cols.splice(3, 0, {
      headerName: "Users",
      field: "user_name",
      flex: 1,
      sortable: true,
      filter: true,
      valueGetter:  (p) => p.data?.user_name ?? "", // safe
      });
      }
      
      return cols;
      }, [isTeamsManager]);


  // AG Grid default column properties
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      cellStyle: {
        borderRight:  '1px solid rgba(0,0,0,0.12)',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
      }
    }),
    [],
  )

  const handleViewInvoice = useCallback((page: InvoicePage) => {
    setSelectedInvoice(page)
  }, [])

  const handleViewPage = useCallback((page: InvoicePage) => {
    setSelectedInvoice(page)
  }, [])

  const handleCloseViewer = useCallback(() => {
    setSelectedInvoice(null)
  }, [])

  const handleNavigateInvoice = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedInvoice || !invoices?.data) return

      // Find all pages across all grouped invoices
      const allPages: InvoicePage[] = []
      invoices.data.forEach((group: GroupedInvoice) => {
        allPages.push(...group.pages)
      })

      const currentIndex = allPages.findIndex((page) => page.id === selectedInvoice.id)
      if (currentIndex === -1) return

      if (direction === "prev" && currentIndex > 0) {
        setSelectedInvoice(allPages[currentIndex - 1])
      } else if (direction === "next" && currentIndex < allPages.length - 1) {
        setSelectedInvoice(allPages[currentIndex + 1])
      }
    },
    [selectedInvoice, invoices?.data],
  )

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns
    params.api.sizeColumnsToFit()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading invoices: {error.message}</p>
      </div>
    )
  }

  if (!invoices?.data?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No invoices found</p>
      </div>
    )
  }

  // Show inline viewer if an invoice is selected
  if (selectedInvoice  &&
    (subscriptionTier === "Teams" && selectedClient))
   {
    // Find all pages for navigation
    const allPages: InvoicePage[] = []
    invoices.data.forEach((group: GroupedInvoice) => {
      allPages.push(...group.pages)
    })

    const currentIndex = allPages.findIndex((page) => page.id === selectedInvoice.id)

    return (
      <InlineInvoiceViewer
        fieldId = {selectedClient}
        invoice={selectedInvoice}
        onClose={handleCloseViewer}
        onNavigate={handleNavigateInvoice}
        canNavigatePrev={currentIndex > 0}
        canNavigateNext={currentIndex < allPages.length - 1}
        currentIndex={currentIndex + 1}
        totalCount={allPages.length}
        currentOrg={currentOrg}
      />
    )
  } else if (selectedInvoice && subscriptionTier !== "Teams") {
     // Find all pages for navigation
     const allPages: InvoicePage[] = []
     invoices.data.forEach((group: GroupedInvoice) => {
       allPages.push(...group.pages)
     })
 
     const currentIndex = allPages.findIndex((page) => page.id === selectedInvoice.id)
 
     return (
       <InlineInvoiceViewer
         fieldId = {userId}
         invoice={selectedInvoice}
         onClose={handleCloseViewer}
         onNavigate={handleNavigateInvoice}
         canNavigatePrev={currentIndex > 0}
         canNavigateNext={currentIndex < allPages.length - 1}
         currentIndex={currentIndex + 1}
         totalCount={allPages.length}
         currentOrg={currentOrg}
       />
     )
    }

  return (
    <div className="space-y-4">
      {/* AG Grid Table */}
      <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
        <AgGridReact
          rowData={invoices.data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          theme="legacy" // Use legacy theme to avoid theming conflicts
          context={{
            onViewInvoice: handleViewInvoice,
            onViewPage: handleViewPage,
          }}
          rowHeight={60} // Increased to accommodate expanded content
          headerHeight={45}
          animateRows={true}
          domLayout="normal"
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, invoices.total)} of{" "}
          {invoices.total} files
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * pageSize >= invoices.total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
