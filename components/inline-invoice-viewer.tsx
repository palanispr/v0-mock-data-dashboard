"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, ChevronLeft, ChevronRight, EyeOff, FileText, Loader2, Plus, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import { useFieldHeaders, useImagePublicUrl} from "@/service/ZoomableImage.service"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import type {
  GridReadyEvent,
  CellValueChangedEvent,
  ColDef,
  ICellRendererParams,
  GridOptions,
} from 'ag-grid-community'
import { HeadersMap, InvoicePage, LineItem } from '@/types/invoice'
import { useUpdateInvoiceStatus } from "@/service/insert.service"
import { toast } from "sonner"




interface InlineInvoiceViewerProps {
  fieldId: string
  invoice:  InvoicePage
  onClose: () => void
  onNavigate: (direction: "prev" | "next") => void
  canNavigatePrev: boolean
  canNavigateNext: boolean
  currentIndex: number
  totalCount: number
  currentOrg: string
}


// Renderer for the static "Add" row
// const AddButtonCellRenderer = (params: ICellRendererParams) => {
//   if (!params.data.isAddButton) return null
//   if (params.colDef?.field === 'description') {
//     return (
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => params.context.onAddNewRow()}
//         className="flex items-center gap-2 text-blue-600 hover:text-blue-700 h-full w-full justify-start"
//       >
//         <Plus className="h-4 w-4" />
//         Add Line Item
//       </Button>
//     )
//   }
//   return null
// }

// Renderer for the actions on a new row
const NewRowActionsCellRenderer = (params: ICellRendererParams) => {
  if (!params.data.isNewRow)  return null
  const data = params.data as LineItem
  const fieldNames = Object.keys(data).filter(key => key !== 'id' && key !== 'isNewRow')
  
  console.log("fieldNames", fieldNames)
  const isComplete = fieldNames.every(name => {
    const v = data[name]
    return v !== null && v !== undefined && String(v).trim() !== ""
  })

  
  return (
    <div className="flex items-center gap-1">
      {isComplete && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
          onClick={() => params.context.onSaveNewRow(data)}
          title="Save new item"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        onClick={() => params.context.onCancelNewRow(data.id)}
        title="Cancel"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Combined actions renderer
// const ActionsCellRenderer = (params: ICellRendererParams) => {
//   return params.data.isNewRow ? NewRowActionsCellRenderer(params) : null
// }

export function InlineInvoiceViewer({
  fieldId,
  invoice,
  onClose,
  onNavigate,
  canNavigatePrev,
  canNavigateNext,
  currentIndex,
  totalCount,
  currentOrg,
}: InlineInvoiceViewerProps) {
  // initial rows + "Add" button
  const parsedItems: LineItem[] = useMemo(() => {
    const raw = invoice.invoice_lineitems ?? [];
    return raw.map(item =>
      typeof item === 'string' ? JSON.parse(item) as LineItem : item
    );
  }, [invoice.invoice_lineitems]);

  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    // const items = invoice.invoice_lineitems ?? []
    return [...parsedItems.map((it, i) => ({ id: i.toString(), ...it })), { id: 'add-button', isAddButton: true }]
  })

  const [undoItem, setUndoItem] = useState<{ row: LineItem; index: number } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)

  const [headersState, setHeadersState] = useState<{ edited: HeadersMap; saved: HeadersMap | null }>(() => ({
    edited: { ...(invoice.invoice_headers || {}) },
    saved: null,
  }))

  // const normalizeItems = (items: LineItem[]) =>
  //   items.filter(i => !i.isAddButton && !i.isNewRow).map(({ ...rest }) => rest)

  // const originalItems = useMemo(() => normalizeItems(parsedItems.map((it, i) => ({ id: i.toString(), ...it }))), [parsedItems])

  // const currentItems = useMemo(() => normalizeItems(lineItems), [lineItems])

  // const normalizeItemsForSave = (items: LineItem[]) =>
  //   items
  //     .filter(i => !i.isAddButton && !i.isNewRow)
  //     .map(({...rest }) => rest)

  // console.log(normalizeItemsForSave(lineItems))
  // LOCAL page number state — prevents refetches from resetting current viewer page
  const [localPageNumber, setLocalPageNumber] = useState<number>(invoice.page_number ?? 1)

  // Sync localPageNumber only when a *different* extraction/document opens
  useEffect(() => {
    setLocalPageNumber(invoice.page_number ?? 1)
  }, [invoice.id])

  // Handling Hold | Duplicate | Approve actions
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInvoiceStatus();

  const handleSaveHeaders = () => {
    if (!invoice.invoice_document?.id) {
      alert("Error: Cannot update status without a document ID.");
      return;
  }

  // Prepare the payload from component props and state
  const payload = {
      extractionId: invoice.id, // Assuming invoice prop has the extraction ID
      invoiceDocumentId: invoice.invoice_document.id,
      userId: invoice.user_id,
      orgId: currentOrg,
      clientId: invoice.client_id, // Assuming this is on the invoice prop
      clientName: invoice.client_name, // Assuming this is on the invoice prop
      filePath: invoice.file_path,
      headers: headersState.edited || {},
      lineItems: lineItems, // Send the current state of line items
      newStatus: invoice.status
  };
  
  updateStatus(payload, {
      onSuccess: () => {
          // Optional: Close the viewer or navigate to the next item after success
          // console.log(`Invoice headers updated successfully`);
          // onClose(); // Example: close viewer on success
          setHeadersState({ edited: { ...(payload.headers as HeadersMap) }, saved: { ...(payload.headers as HeadersMap) } })
          toast.success("Invoice headers updated successfully");

      },
      onError: () => toast.error('Failed to save headers'),
  });
}

const handleSaveLineItems = (itemsOverride?: LineItem[]) => {
  if (!invoice.invoice_document?.id) {
  alert("Error: Cannot update status without a document ID.")
  return
  }
  const items = itemsOverride ?? lineItems
  const payload = {
  extractionId: invoice.id,
  invoiceDocumentId: invoice.invoice_document.id,
  userId: invoice.user_id,
  orgId: currentOrg,
  clientId: invoice.client_id,
  clientName: invoice.client_name,
  filePath: invoice.file_path,
  headers: headersState.edited || invoice.invoice_headers || {},
  lineItems: items,
  newStatus: invoice.status,
  }

  console.log("Payload for updateStatus:", payload.lineItems)
  updateStatus(payload, {
  onSuccess: () => {
  toast.success("Line items saved successfully")
  // Optionally sync the “saved” baseline so dirty check resets
  // If you want the dirty check to reset immediately, update headersState.saved analog for items or rebuild originalItems source.
  },
  onError: () => toast.error("Failed to save line items"),
  })
  }

  const handleStatusUpdate = (newStatus: 'hold' | 'duplicate' | 'approved') => {
    // Ensure you have a valid invoice_document_id. Fallback or error if not.
    if (!invoice.invoice_document?.id) {
        toast("Error: Cannot update status without a document ID.");
        return;
    }

    // Prepare the payload from component props and state
    const payload = {
        extractionId: invoice.id, // Assuming invoice prop has the extraction ID
        invoiceDocumentId: invoice.invoice_document.id,
        userId: invoice.user_id,
        orgId: currentOrg,
        clientId: invoice.client_id, // Assuming this is on the invoice prop
        clientName: invoice.client_name, // Assuming this is on the invoice prop
        filePath: invoice.file_path,
        headers: invoice.invoice_headers || {},
        lineItems: lineItems, // Send the current state of line items
        newStatus: newStatus
    };
    
    updateStatus(payload, {
        onSuccess: () => {
            // Optional: Close the viewer or navigate to the next item after success
            // console.log(`Invoice successfully set to: ${newStatus}`);
            onClose(); // Example: close viewer on success
        }
    });
  };

  // sync when invoice prop changes
  useEffect(() => {
    setLineItems([
    ...parsedItems.map((it, i) => ({ id: i.toString(), ...it })),
    { id: 'add-button', isAddButton: true },
    ])
    }, [invoice.id]) 

  useEffect(() => {
    setHeadersState({ edited: { ...(invoice.invoice_headers || {}) }, saved: null })
  }, [invoice.id, invoice.invoice_headers])

  const areHeadersDirty = useMemo(() => {
    const base = headersState.saved ?? (invoice.invoice_headers ?? {})
    const edited = headersState.edited ?? {}
    const keys = new Set([...Object.keys(base), ...Object.keys(edited)])
    for (const k of keys) {
      if (String(base[k] ?? '') !== String(edited[k] ?? '')) return true
    }
    return false
  }, [headersState, invoice.invoice_headers])
  
  // const areLineItemsDirty = useMemo(() => {
  //   if (originalItems.length !== currentItems.length) return true
  //   // shallow compare each item’s keys/values (order-sensitive; adapt if you need id-based)
  //   return currentItems.some((it, idx) => {
  //   const a = it as Record<string, unknown>
  //   const b = originalItems[idx] as Record<string, unknown>
  //   const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  //   for (const k of keys) {
  //   if (String(a[k] ?? "") !== String(b[k] ?? "")) return true
  //   }
  //   return false
  //   })
  //   }, [originalItems, currentItems])

  // input change
  // const onHeaderChange = (name: string, value: string) =>
  //   setHeadersState(s => ({ ...s, edited: { ...s.edited, [name]: value } }))

  // fetch image and headers
  const {
    data: publicUrl,
    isLoading: imageLoading,
    error: imageError,
  } = useImagePublicUrl(invoice.file_path)

  const {data: fields, isLoading: fieldsLoading, error: fieldsError} = useFieldHeaders(fieldId)
  const fieldNames = fields?.lineitem_headers?.map(h => h.name) ?? []

  

  const fileName = invoice.file_name
  const actualCount = lineItems.filter(i => !i.isNewRow && !i.isAddButton).length
  const gridRef = useRef<AgGridReact>(null)

  // dynamic columns
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!fields?.lineitem_headers) return []
  
    // 1) Map your real headers exactly as before
    const dynamicCols: ColDef[] = (fields?.lineitem_headers ?? []).map(({ name, description }) => ({
      headerName: name,
      field: name,
      editable: (p) => !p.data.isAddButton,
      tooltipField: description,
      flex: 1,
      cellStyle: (p) => ({
        backgroundColor: p.data.isAddButton
          ? '#f9f9f9'
          : p.data.isNewRow
            ? '#f8f9fa'
            : '',
        border: p.data.isAddButton || p.data.isNewRow
          ? '1px dashed #dee2e6'
          : '',
        fontStyle: p.data.isNewRow ? 'italic' : '',
      }),
    }))
  
    // 2) Re‑define actions column to render either the Add button or the row‑actions
    const actionCol: ColDef = {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      filter: false,
      pinned: 'right',
      // this single renderer handles both your “Add” row and your “NewRow” actions
      cellRenderer: (params: ICellRendererParams) => {
        if (params.data.isAddButton) {
          // show the + button in the actions cell
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => params.context.onAddNewRow()}
              className="h-full w-full flex items-center justify-center text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )
        }
        if (params.data.isNewRow) {
          // show Save/Cancel icons for the new row
          return NewRowActionsCellRenderer(params)
        }
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={() => params.context.onDeleteRow(params.data.id!)}
            title="Delete line"
          >
            <X className="h-3 w-3" />
          </Button>
        );
      },
      cellStyle: (p) => ({
        backgroundColor: p.data.isAddButton ? '#f9f9f9' : '',
      }),
    }
  
    return [...dynamicCols, actionCol]
  }, [fields])
  

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, filter: true }), [])
  const gridOptions = useMemo<GridOptions>(() => ({}), [])

  const onGridReady = useCallback((e: GridReadyEvent) => e.api.sizeColumnsToFit(), [])

  // handle edits
  const onCellValueChanged = useCallback((evt: CellValueChangedEvent) => {
    const { data, colDef, newValue } = evt;
    const id = data.id!;
  
    // 1) Update React state (for both new & existing rows) by id
    setLineItems(prev => {
      return prev.map(item =>
        item.id === id
          ? { ...item, [colDef.field!]: newValue }
          : item
      );
    });
  
    // 2) If this was a new row, refresh just its actions cell so ✔️ appears/disappears
    if (data.isNewRow) {
      const api = gridRef.current!.api;
      const rowNode = api.getRowNode(id);
      if (rowNode) {
        api.refreshCells({
          rowNodes: [rowNode],
          columns: ['actions'],
          force: true,
        });
      }
    }
  }, []);
  
  

  // add a blank new row
  const onAddNewRow = useCallback(() => {
    if (lineItems.some(i => i.isNewRow)) return
    // build a blank record with *all* dynamic fields
    const blank: LineItem = { id: `new-${Date.now()}`, isNewRow: true }
    fieldNames.forEach(name => blank[name] = "")
    setLineItems(prev => {
      const copy = [...prev]
      const idx = copy.findIndex(i => i.isAddButton)
      copy.splice(idx, 0, blank)
      return copy
    })
  }, [lineItems, fieldNames])

  // save a new row
  const onSaveNewRow = useCallback((data: LineItem) => {
    setLineItems((prev: LineItem[]) => {
    const next = prev.map(x =>
    x.id === data.id ? { ...data, isNewRow: false } : x
    )
    
    // refresh UI
    setTimeout(() => {
      const rowNode = gridRef.current?.api.getRowNode(data.id!)
      if (rowNode) {
        gridRef.current?.api.refreshCells({ rowNodes: [rowNode], force: true })
      }
      // save using the computed next items, not from state
      handleSaveLineItems(next)
    }, 0)
    
    return next
    })
    }, [handleSaveLineItems])
  

  // cancel new row
  const onCancelNewRow = useCallback((id: string) => {
    setLineItems((prev: LineItem[]) => prev.filter(x => x.id !== id))
  }, [])

  const onDeleteRow = useCallback((id: string) => {
    setLineItems(prev => {
    const idx = prev.findIndex(i => i.id === id)
    if (idx === -1) return prev
    const row = prev[idx]
    
    // set undo buffer
    setUndoItem({ row, index: idx })
    
    // start/clear timer
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoItem(null), 5000)
    
    // compute next items and persist
    const next = [...prev]
    next.splice(idx, 1)
    
    // persist with next (avoid stale state)
    handleSaveLineItems(next)
    
    return next
    })
    }, [handleSaveLineItems])

  const onUndo = useCallback(() => {
    if (!undoItem) return
    setLineItems(prev => {
      const copy = [...prev]
      copy.splice(undoItem.index, 0, undoItem.row)
      return copy
    })
    window.clearTimeout(undoTimer.current)
    setUndoItem(null)
  }, [undoItem])
  
  

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>
    const statusMap: Record<'hold' | 'duplicate' | 'approved', 'destructive' | 'outline' | 'default'> = {
      hold: 'destructive',
      duplicate: 'outline',
      approved: 'default',
    }
    const variant = statusMap[status as keyof typeof statusMap] ?? 'default'
    const label = status.charAt(0).toUpperCase() + status.slice(1)
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Back to Table
          </Button>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("prev")} disabled={!canNavigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentIndex} of {totalCount}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("next")} disabled={!canNavigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-lg">{fileName}</h2>
              {localPageNumber && (
                <Badge variant="outline" className="text-xs">
                  Page {localPageNumber}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span>{format(new Date(invoice.created_at), "MMM dd, yyyy HH:mm")}</span>
              <span>•</span>
              <Badge variant="outline">{currentOrg}</Badge>
              <span>•</span>
              <span>{invoice.client_name}</span>
              <span>•</span>
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>
      </div>

      {/* main */}
      <div className="flex h-full">
        {/* Left Panel - Image Preview */}
        <div className="w-1/2 p-6 border-r bg-gray-50 h-full flex relative overflow-hidden">
        {imageLoading ? (
  <div className="flex-1 flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
  </div>
) : imageError || !publicUrl ? (
  <div className="flex-1 flex items-center justify-center text-red-500">
    <AlertCircle className="h-6 w-6 mr-2" />
    <span>Error loading image</span>
  </div>
) :  (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-0 left-10 flex space-x-2 z-10">
              <Button size="sm" variant="outline" onClick={() => zoomIn()}>
                +
              </Button>
              <Button size="sm" variant="outline" onClick={() => zoomOut()}>
                –
              </Button>
              <Button size="sm" variant="outline" onClick={() => resetTransform()}>
                ↺
              </Button>
            </div>
                  <div className="flex-1 overflow-hidden">
                    <TransformComponent>
                      <Image
                        src={publicUrl}
                        alt={`invoice ${fileName} – Page ${localPageNumber || 1}`}
                        width={800}
                        height={1000}
                        className="object-contain"
                        crossOrigin="anonymous"
                      />
                    </TransformComponent>
                  </div>
                </>
              )}
            </TransformWrapper>
          )}
        </div>

        {/* data */}
        <div className="w-1/2 p-6 overflow-auto">
          <Accordion type="multiple" defaultValue={["headers","lineitems"]}>
            <AccordionItem value="headers">
              <AccordionTrigger className="text-lg font-semibold">
                Headers<Badge variant="outline" className="ml-2">{fields?.headers?.length || 0} Headers</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {fieldsLoading ? <Loader2 className="animate-spin" /> : fieldsError ? (
                    <div className="text-red-500"><AlertCircle /></div>
                  ) : fields?.headers && fields.headers.length > 0 ? fields.headers.map(h=> (
                    <div key={h?.name} className="grid grid-cols-3 gap-4 items-center">
                      <Label className="text-sm font-medium" title={h.description}>{h.name}</Label>
                      <div className="col-span-2">
                      <Input
            className="bg-gray-50"
            // DRIVE the Input from editedHeaders, _not_ invoice.invoice_headers
            value={headersState.edited[h.name] ?? ""}
            onChange={e =>
              setHeadersState(prev => ({
                ...prev,
                edited: { ...prev.edited, [h.name]: e.target.value }
              }))
            }
          />
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-center py-8 border rounded-lg bg-gray-50">
                      <p>No headers available</p>
                    </div>
                  )}
                  {/* Conditional Save Button */}
          {areHeadersDirty && (
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSaveHeaders}
                disabled={isUpdatingStatus} // Assuming you use the `useUpdateInvoiceDetails` hook from the previous answer
              >
                {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Headers
              </Button>
            </div>
          )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lineitems">
              <AccordionTrigger className="text-lg font-semibold">
                Line Items<Badge variant="outline" className="ml-2">{actualCount} Line Items</Badge>
              </AccordionTrigger>
              <AccordionContent>
                {fieldsLoading ? <Loader2 className="animate-spin" /> : fieldsError ? (
                  <AlertCircle className="text-red-500" />
                ) :  lineItems.length > 0 ? (
                  <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                    <AgGridReact
                      theme="legacy"
                      ref={gridRef}
                      rowData={lineItems}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      gridOptions={gridOptions}
                      onGridReady={onGridReady}
                      onCellValueChanged={onCellValueChanged}
                      context={{onAddNewRow,onSaveNewRow,onCancelNewRow, onDeleteRow}}
                      getRowId={(params) => params.data.id}
                      rowSelection="single"
                    />
                    
                  </div>
                ):(
                  <div className="text-gray-500 text-center py-8 border rounded-lg bg-gray-50">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No line items available for this page</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {undoItem && (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded shadow-lg flex items-center gap-2">
    <span>Line item deleted</span>
    <Button size="sm" variant="link" className="text-blue-600" onClick={onUndo}>
      Undo
    </Button>
  </div>
)}


          {/* actions */}
          <div className="mt-6 pt-6 border-t flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => handleStatusUpdate('hold')}
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Hold
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleStatusUpdate('duplicate')}
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Mark Duplicate
        </Button>
        <Button 
          variant="default" 
          onClick={() => handleStatusUpdate('approved')}
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve
        </Button>
      </div>
        </div>
      </div>
    </div>
  )
}
