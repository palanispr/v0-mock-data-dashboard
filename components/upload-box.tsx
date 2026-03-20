// Name: V.Hemanathan
// Describe: This component is used to upload the pdf files & images to the server.It uses invoicefields service to edit or include exclude fields in database
// Framework: Next.js -15.3.2

"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PDFDocumentProxy } from "pdfjs-dist";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateInvoiceDocument, useFieldDefinitions } from "@/lib/hooks";

interface Profile {
  id: string
  uploads_limit: number
  email?: string
}

interface FieldConfig {
  standardFields: { name: string; description: string }[];
  customFields: { name: string; description: string }[];
}

export default function UploadBox( profile: Profile) {
  const userId = profile?.id || "";

  const MAX_SELECTION = 500;
  const MAX_STORAGE_SIZE = 1073741824; // 1 GiB
  let remaining_space = 0;

  // File list & upload state
  const [files, setFiles] = useState<File[]>([]);

  const [isUploading, setIsUploading] = useState(false);

  // Dialog & field‐selector state
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogCustom, setOpenDialogCustom] = useState(false);
  const [extractionFields, setExtractionFields] = useState<FieldConfig>({
    standardFields: [],
    customFields: [],
  });
  const [ALLFields, setALLFields] = useState<FieldConfig>({
    standardFields: [],
    customFields: [],
  });
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // Custom‐field handlers // unused code start---
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const [newField, setNewField] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  // // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // Custom‐field handlers // unused code start---
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // New state for editing fields
  const [openEdit, setOpenEdit] = useState(false);
  const [editingField, setEditingField] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  // const [AllField, setAllField] = useState();
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );
  const [isEditingStandard, setIsEditingStandard] = useState<boolean>(false);
const remining_space = useGlobalState();
const [uploadsUsed, setUploadsUsed] = useState<number>(0);
useEffect(() => {
  if (remining_space.remining_space) {
    if (remining_space.remining_space && 'extractions_used' in remining_space.remining_space) {
      setUploadsUsed(Number(remining_space.remining_space.extractions_used)); 
    } 
  } else {
    // console.log("remining_space is null or undefined");
  }
}, [remining_space]);

  // Storage usage & errors
  const [total, setTotal] = useState<number | null>(null);
  const [totalsize_error, setError] = useState<string | null>(null);

  // User usage (uploads_used, extractions_used)
  const [usageData, setUsage] = useState<{
    uploads_used: number;
    extractions_used: number;
  } | null>(null);

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // 1) Fetch current total storage usage
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const totalSize = await getTotal();
        setTotal(totalSize);
      } catch {
        setError("Failed to fetch total size");
      }
    };
    fetchTotal();
  }, []);

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // 2) Fetch user usage data (uploads_used, extractions_used)
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    const fetchUsage = async () => {
      if (!profile) return;
      const { data: usageData, error } = await fetchUserUsage(profile.id);
      if (error) {
        setError(error.message);
        return;
      }
      if (usageData) {
        setUsage(usageData);
      }
    };
    fetchUsage();
  }, [profile]);

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // 3) Fetch invoice fields from Supabase when dialog opens
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    fetchInvoiceFields(userId);
  }, [userId]);
  const fetchInvoiceFields = async (userId: string) => {
    if (!userId) return;
  
    const data = await getInvoiceFields(userId);
  
    if (data) {
      setExtractionFields({
        standardFields: data.standard_fields,
        customFields: data.custom_fields,
      });
  
      setALLFields({
        standardFields: data.standard_fields,
        customFields: data.custom_fields,
      });
    } else {
      setALLFields({
        standardFields: [],
        customFields: [],
      });
    }
  };

  // Compute remaining storage space
  if (total !== null) {
    remaining_space = MAX_STORAGE_SIZE - total;
  } else if (totalsize_error !== null) {
    toast.error("Error fetching total size", { description: totalsize_error });
  }

  // Determine upload limit based on subscription tier
  const uploadsLimit: number = profile.uploads_limit;
//    uploadsUsed = usageData?.uploads_used || 0;
// console.log("uploadsUsed 172", uploadsUsed);

  // togglefields

  const allFields = [
    ...(ALLFields?.standardFields.map((f) => ({ ...f, source: "standard" })) ||
      []),
    ...(ALLFields?.customFields.map((f) => ({ ...f, source: "custom" })) || []),
  ];

  const isSelected = (field: { name: string }) =>
    [...extractionFields.standardFields, ...extractionFields.customFields].some(
      (f) => f.name === field.name
    );

  const toggleField = (field: {
    name: string;
    description: string;
    source: string;
  }) => {
    setExtractionFields((prev) => {
      const inStd = prev.standardFields.some((f) => f.name === field.name);
      const inCust = prev.customFields.some((f) => f.name === field.name);
      let newStd = [...prev.standardFields];
      let newCust = [...prev.customFields];

      if (inStd || inCust) {
        newStd = newStd.filter((f) => f.name !== field.name);
        newCust = newCust.filter((f) => f.name !== field.name);
      } else {
        if (field.source === "standard") newStd.push(field);
        else newCust.push(field);
      }
      return { standardFields: newStd, customFields: newCust };
    });
  };
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // File drag & drop handler-start
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const selected = Array.from(e.dataTransfer.files);
      processFiles(selected);
    }
  };

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // File drag & drop handler-end
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selected = Array.from(e.target.files);
    e.currentTarget.value = ""; // allow reselecting same file
    processFiles(selected);
  };

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // File selection handler
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const processFiles = (incoming: File[]) => {
    // if (!e.target.files?.length) return;
    // e.currentTarget.value = ""; // Reset input value to allow re‐selection of same file
    const selected = incoming;
    //handle duplicate files-rabilan
    if (files.length > 0) {
      const hasDuplicate = files.some((file) => {
        if (selected.some((f) => f.name === file.name)) {
          toast.error(`File "${file.name}" is already selected.`);
          return true; // short-circuits .some
        }
        return false;
      });

      if (hasDuplicate) return;

      // Continue with handling files
    }

    // 1) Max selection count
    if (selected.length > MAX_SELECTION) {
      toast.error("Selection limit exceeded", {
        description: `You can only select up to ${MAX_SELECTION} files at once.`,
      });
      return;
    }

    // 2) Check against remaining upload quota
    if (selected.length + files.length > uploadsLimit - uploadsUsed) {
      toast.error("Upload limit exceeded", {
        description: `You can only upload ${
          uploadsLimit - uploadsUsed
        } more files.`,
      });
      return;
    }

    // 3) Check against remaining storage bytes
    if (remaining_space < 104857600) {
      // e.g. if less than 100 MiB remains
      toast.error("Not enough storage space", {
        description: `You’ve used almost all available storage.`,
      });
      return;
    }

    // 4) Filter out invalid types
    const valid = selected.filter((file) => {
      const ok =
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/png";
      if (!ok) {
        toast.error("Invalid file type", {
          description: `Only PDF, JPG, or PNG files are allowed.`,
        });
      }
      return ok;
    });

    setFiles((prev) => [...prev, ...valid]);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // Custom‐field handlers // unused code start---
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――

  //  const handleAdd = async () => {
  //    if (updated) {
  //      setCustomFields(updated);
  //      setNewField({ name: "", description: "" });
  //      setOpenAdd(false);
  //     }
      const handleAddCustom = async () =>  {
        if (!newField.name.trim()) {
          toast.error("Field name required", {
            description: "Please provide a name for your custom field.",
          });
          return;
        }

        const standardFields = allFields.filter((field) => field.source === "standard");
        const customFields = allFields.filter((field) => field.source === "custom");
        const updated = await addCustomField(userId, { ...newField, name: newField.name.trim(), description: newField.description.trim() },standardFields ,customFields );
        if (updated) {
          setExtractionFields((prev) => ({
            ...prev,
            customFields: [...prev.customFields, { ...newField }],
          }));
          setOpenDialogCustom(false);
          setNewField({ name: "", description: "" });
          fetchInvoiceFields(userId);
        }
        
  };

  // const handleRemoveCustom = (idx: number) => {
  //   setExtractionFields((prev) => ({
  //     ...prev,
  //     customFields: prev.customFields.filter((_, i) => i !== idx),
  //   }));
  // };
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  //  // unused code end---
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // Edit field handlers
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const handleEditField = (
    field: { name: string; description: string },
    index: number,
    isStandard: boolean
  ) => {
    setEditingField({ ...field });
    setEditingFieldIndex(index);
    setIsEditingStandard(isStandard);
    setOpenEdit(true);
  };

  const handleUpdateField = async () => {
    if (editingFieldIndex === null) return;

    // if (editIndex === null) return;
    const updatedStd = [...extractionFields.standardFields];
    const updatedCust = [...extractionFields.customFields];

    if (isEditingStandard) {
      updatedStd[editingFieldIndex] = { ...editingField };
    } else {
      updatedCust[editingFieldIndex] = { ...editingField };
    }

    // // editingField
    // const updatedStandard = [...extractionFields.standardFields];
    // const updatedCustom   = [...extractionFields.customFields];
    const ok = await updateField(userId, updatedStd, updatedCust);
    if (ok) {
      setOpenEdit(false);
      // toast.success("Field updated for this extraction.");
      setExtractionFields({
        standardFields: updatedStd,
        customFields: updatedCust,
      });
      setALLFields({
        standardFields: updatedStd,
        customFields: updatedCust,
      });
    } else {
      return { standardFields: updatedStd, customFields: updatedCust };
    }
  };

  async function pdfFileToPageBlobs(pdfFile: File): Promise<Blob[] | null> {
    try {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");

      // Point PDF.js at our worker in /public/pdf.worker.min.js
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf: PDFDocumentProxy = await pdfjs.getDocument({
        data: arrayBuffer,
      }).promise;
      const numPages = pdf.numPages;
      const blobs: Blob[] = [];
      const scale = 3;

      for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d")!;
        await page.render({ canvasContext: context, viewport }).promise;
        // Convert canvas to PNG Blob
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, "image/png")
        );
        if (blob) {
          blobs.push(blob);
        } else {
          return null;
        }
      }
      return blobs;
    } catch (err) {
      console.error("Error while parsing PDF:", err);
      return null;
    }
  }

  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  // Main “Process Files” button handler
  // ―――――――――――――――――――――――――――――――――――――――――――――――――――――
  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error("No files selected");
      return;
    }

    let totalPagesToUpload = 0;
    // First pass: count “pages” needed for all files
    const filePageInfos: {
      file: File;
      pageBlobs?: Blob[];
      isPDF: boolean;
      numPages: number;
    }[] = [];

    // Re‐fetch usage just before processing, in case it changed
    const { data: freshUsage, error: usageError } = await fetchUserUsage(
      profile.id
    );
    const currentUsed = freshUsage?.uploads_used ?? 0;
    let currentRemaining = profile.uploads_limit - currentUsed;
    if (usageError) {
      toast.error("Unable to retrieve usage data");
      return;
    }

    // For each selected File, determine how many pages
    for (const file of files) {
      if (file.type === "application/pdf") {
        // Count PDF pages
        const pageBlobs = await pdfFileToPageBlobs(file);
        if (!pageBlobs) {
          toast.error(`Failed to parse PDF: ${file.name}`);
          return;
        }
        const numPages = pageBlobs.length;
        if (numPages > currentRemaining) {
          toast.error(
            `Not enough upload allowance "${file.name}" (${numPages} pages). you can only upload ${currentRemaining} more page(s).`
          );
          return;
        }
        totalPagesToUpload += numPages;
        filePageInfos.push({ file, pageBlobs, isPDF: true, numPages });
      } else {
        // Image is “1 page”
        if (1 > currentRemaining) {
          toast.error(
            `Not enough upload allowance to upload image: ${file.name}`
          );
          return;
        }
        totalPagesToUpload += 1;
        filePageInfos.push({ file, isPDF: false, numPages: 1 });
      }
    }

    if (totalPagesToUpload > currentRemaining) {
      toast.error(
        `You can only upload ${currentRemaining} more page(s) in total, but selected files require ${totalPagesToUpload}.`
      );
      return;
    }

    // If we reach here, all counts are okay
    setIsUploading(true);

    // Second pass: actually upload
    for (const info of filePageInfos) {
      if (info.isPDF && info.pageBlobs) {
        // For each page‐blob, upload as a separate PNG
        const file_timestamp = Date.now();
        const file_randomPart = Math.random().toString(36).slice(2, 10);
        const file_id = `${file_timestamp}_${file_randomPart}`;
        for (let i = 0; i < info.numPages; i++) {
          const blob = info.pageBlobs[i];
          const filename = info.file.name;
          const baseName = filename.replace(/\.pdf$/i, ""); // => "test-invoice"
          const timestamp = Date.now();
          const randomPart = Math.random().toString(36).slice(2, 10);
          const pageFilename = `${timestamp}_${randomPart}_${baseName}`;
          // const pageFilename = `${profile.id}_${baseName}`;
          const storagePath = `${pageFilename}_page_${i + 1}.png`;

        const uploadData = await uploadFile(storagePath, blob)
           if (uploadData &&typeof uploadData === "object" && "message" in uploadData) {
            toast.error("Error uploading page to storage", {
              description: String(uploadData.message),
            });
            setIsUploading(false);
            return;
          }
          const result = await insertInvoiceDocument({
            userId: profile.id,
            filePath: uploadData && typeof uploadData === "object" && "fullPath" in uploadData ? (uploadData as { fullPath: string }).fullPath : "",
            standardFields: extractionFields.standardFields,
            customFields: extractionFields.customFields,
            orgID: null,
            clientID: null,
            client_name: null,
            file_name: filename,
            isPDF: true,
            file_id : file_id,
            page_count: i + 1
          });
          
          if (!result.success) {
            console.log("Error inserting document record:", result.error);
            toast.error("Error inserting document record", {
              description: result.error,
            });
          }
        
        }
      } else {
        // It’s an image (JPEG/PNG). Upload directly
        const imageFile = info.file;
        const baseName = imageFile.name
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).slice(2, 10);
        const storagePath = `${timestamp}_${randomPart}_${baseName}`;

        const uploadData = await uploadFile(storagePath, imageFile)              
          if (uploadData &&typeof uploadData === "object" && "message" in uploadData) {
            toast.error("Error uploading page to storage", {
              description: String(uploadData.message),
            });
            setIsUploading(false);
            return;
          }
          const result = await insertInvoiceDocument({
            userId: profile.id,
            filePath: uploadData && typeof uploadData === "object" && "fullPath" in uploadData ? (uploadData as { fullPath: string }).fullPath : "",
            standardFields: extractionFields.standardFields,
            customFields: extractionFields.customFields,
            orgID: null,
            clientID: null,
            client_name: null,
            file_name: baseName,
            isPDF: false,
            file_id: `${timestamp}_${randomPart}`,
            page_count: 1,
          });
          
          if (!result.success) {
            toast.error("Error inserting document record", {
              description: result.error,
            });
          }
        
      }
    }

    // Delay briefly so “Processing…” UI is visible, then finalize
    setTimeout(async () => {
      toast("Processing complete", {
        description: `Uploaded ${totalPagesToUpload} page(s).`,
      });
      setFiles([]);
      setIsUploading(false);
      setOpenDialog(false);

      // Refresh total size & usage
      try {
        const newTotal = await getTotal();
        const { data: updatedUsage } = await fetchUserUsage(profile.id);
        if (updatedUsage) {
          setUsage(updatedUsage);
         setUploadsUsed(usageData?.uploads_used || 0);
        //  console.log("uploadsUsed 574", uploadsUsed);
        currentRemaining = profile.uploads_limit - uploadsUsed;
        }
        setTotal(newTotal);
      } catch {
      }
    }, 2000);
  };

  return (
    <Card
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      className="border-dashed border-2 hover:border-primary/50 transition-colors"
    >
      <CardContent>
        <div className="w-full">
          <div
            className={`flex ease-in-out duration-900 transition-all ${
              files.length > 0
                ? "flex-row gap-2.5 "
                : " w-full items-center justify-center"
            }`}
          >
            <div className="flex flex-col items-center justify-center w-1/2 space-y-4">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Upload Documents
              </div>
              <CardDescription>
                Upload PDFs or images of invoices
              </CardDescription>
              <div className="rounded-full bg-primary/10 ">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, JPG, PNG (Max {uploadsLimit - uploadsUsed}{" "}
                  files)
                </p>
              </div>
              <div className="flex w-full flex-col justify-center content-center md:flex-col xl:flex-row 2xl:flex-row max-w-3xl space-x-4 items-center">
                <div className=" flex w-full justify-center items-center contain-content">
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Select Files
                    </Button>
                  </label>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">or</h2>
                </div>
                <div className="w-full  flex">
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                    id="upload-folder"
                    {...{ webkitdirectory: "" }}
                  />
                  <label htmlFor="upload-folder" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() =>
                        document.getElementById("upload-folder")?.click()
                      }
                    >
                      Select Folder
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            {/* {files.length > 0 && ( */}
              <div className={`flex  transition-all duration-400 ease-in-out ${
              files.length > 0
                ? "flex flex-col  w-1/2 h-[250px] justify-between"
                : "flex w-0"
            }`} >
                {files.length > 0 && ( 
                <>
                <h3 className="text-sm font-medium">
                  Selected Files ({files.length})
                </h3>
                <div className=" w-full h-full overflow-y-scroll max-h-[300px] border-2 border-secondary/80 rounded-md p-4 space-y-4">
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm bg-secondary/50 rounded-md p-2"
                      >
                        <span className="truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                 
                  <DialogTrigger asChild>
                    <div className="w-full flex justify-end">
                      <Button className=" bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90">
                        {isUploading ? "Processing..." : "Extract Data"}
                      </Button>
                    </div>
                  </DialogTrigger>

                    {/* extraction dialog */}
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configure Extraction</DialogTitle>
                      <DialogDescription>
                        Choose fields to extract from your documents.

                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">

                        <h3 className="text-sm font-medium">Invoice Fields</h3>
                                <button
                                  onClick={() => setOpenDialogCustom(true)}
                                  className="text-blue-500 flex justify-center items-center border rounded-full p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Add new field
                                </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {allFields.map((field, index) => (
                            <div
                              key={`std-${index}`}
                              className="flex items-center space-x-2 justify-between bg-secondary/50 rounded-md p-2"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected(field)}
                                  onChange={() => toggleField(field)}
                                  className="rounded border-gray-300"
                                />
                                <Label>{field.name}</Label>
                              </div>
                              {field && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditField(field, index, true)
                                }
                              >
                                Edit
                              </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setOpenDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-500 text-white"
                        onClick={handleProcess}
                        disabled={isUploading}
                      >
                        {isUploading ? "Processing..." : "Process Files"}
                      </Button>
                    </DialogFooter>

                    <Dialog
                      open={openDialogCustom}
                      onOpenChange={setOpenDialogCustom}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {" "}
                            Add new fields to extract from your documents.
                          </DialogTitle>
                          {/* <DialogDescription>
      </DialogDescription> */}
                        </DialogHeader>

                        <div className="space-y-3">
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="field-name">Field Name</Label>
                              <Input
                                id="field-name"
                                value={newField.name}
                                onChange={(e) =>
                                  setNewField((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="e.g. Vendor Name"
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="field-description">
                                Description (Optional)
                              </Label>
                              <Input
                                id="field-description"
                                value={newField.description}
                                onChange={(e) =>
                                  setNewField((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="e.g. Name of the vendor or supplier"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddCustom}
                              disabled={!newField.name.trim()}
                              className="w-full"
                            >
                              Add Custom Field
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Edit Field Dialog */}
                    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Field</DialogTitle>
                          <DialogDescription>
                            Update the field’s details below for this
                            extraction.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="edit-field-name">Field Name</Label>
                            <Input
                              id="edit-field-name"
                              value={editingField.name}
                              onChange={(e) =>
                                setEditingField((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="edit-field-description">
                              Description (Optional)
                            </Label>
                            <Input
                              id="edit-field-description"
                              value={editingField.description}
                              onChange={(e) =>
                                setEditingField((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setOpenEdit(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateField}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DialogContent>
                </Dialog>
                </>
                )}
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
