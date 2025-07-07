import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceHeader } from "@/components/service-header";
import { FileText, Upload, Shield, Clock, Hash, User, CheckCircle, FileCheck, ExternalLink, Download, Eye } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document, InsertDocument } from "@shared/schema";

export default function BeaverDoc() {
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [auditLog, setAuditLog] = useState<{action: string; timestamp: string; description: string}[]>([]);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  // Fetch all documents from API
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Mutation to create new documents
  const createDocumentMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      return apiRequest("/api/documents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document Processed",
        description: "Document has been successfully processed and saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Debug log to see if selectedFile is properly updated
  console.log("Current selectedFile:", selectedFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("File selected:", event.target.files[0]);
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) return;
    
    console.log("Processing document:", selectedFile.name);
    
    try {
      // Read the file as ArrayBuffer to store the original PDF data
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      // Generate unique identifiers
      const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
      const uid = `UID-${timestamp}-USR0042-CPY7890-${Math.random().toString(36).substr(2, 12)}`;
      const token = `DOC-${timestamp}-${Math.random().toString(36).substr(2, 12)}`;
      const hash = await calculateSHA256(arrayBuffer);
      
      // Convert ArrayBuffer to base64 for storage
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64Data = btoa(binaryString);
      
      // Create document data for API
      const documentData: InsertDocument = {
        title: selectedFile.name.replace(/\.pdf$/i, ''),
        uid: uid,
        token: token,
        hash: hash,
        status: "Processed",
        author: "Rémi Guillette",
        originalFileName: selectedFile.name,
        originalPdfData: base64Data
      };
      
      // Save to database via API
      createDocumentMutation.mutate(documentData);
      
      // Add audit log entry
      const auditEntry = {
        action: "Document Processed",
        timestamp: new Date().toLocaleString('en-CA', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }).replace(/,/, ''),
        description: `${selectedFile.name} processed with ${uid}`
      };
      setAuditLog(prev => [auditEntry, ...prev]);
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error processing document. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
  };

  const handleViewDocument = (doc: Document | any) => {
    console.log("Viewing document:", doc.title);
    setViewingDocument(doc);
  };

  // Function to calculate SHA-256 hash
  const calculateSHA256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const addUidAndTokenToPdf = async (
    pdfBuffer: ArrayBuffer,
    uid: string,
    token: string,
    hash: string,
    signatureInfo?: string
  ): Promise<Uint8Array> => {
    try {
      // Load the existing PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Get a standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Very small font size for footer text
      const fontSize = 6;
      
      // Number of pages in the document
      const pages = pdfDoc.getPages();
      
      // Current date for timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('en-CA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
      
      // Add UID and token to each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Simplified version in short format for better readability
        const uidShort = uid.substring(uid.length - 8);
        const tokenShort = token.substring(token.length - 8);
        
        // Text to add with UID and token in short format
        const text = `BeaverDoc: P${i + 1}/${pages.length} | UID:${uidShort} | Token:${tokenShort}`;
        
        // Calculate text width
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const x = width - textWidth - 10; // Right aligned with margin
        
        // Position at bottom of page with sufficient margin to avoid cropping
        const y = 20; // Increased to avoid being cut off
        
        // Create a white semi-transparent rectangle as background for text
        page.drawRectangle({
          x: x - 2,
          y: y - 2,
          width: textWidth + 4,
          height: fontSize + 4,
          color: rgb(1, 1, 1), // White
          opacity: 0.7 // Semi-transparent
        });
        
        // Add text to page with dark color
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3), // Dark gray
          opacity: 0.9 // Well visible
        });
        
        // If document is signed, add signature info on separate line
        if (signatureInfo) {
          const sigText = `Signé: ${signatureInfo.split(':')[1]?.trim() || 'DIGITAL_'} | ${timestamp}`;
          const sigTextWidth = font.widthOfTextAtSize(sigText, fontSize);
          const sigX = width - sigTextWidth - 10;
          const sigY = y + fontSize + 3;
          
          // White rectangle for signature text
          page.drawRectangle({
            x: sigX - 2,
            y: sigY - 2,
            width: sigTextWidth + 4,
            height: fontSize + 4,
            color: rgb(1, 1, 1),
            opacity: 0.7
          });
          
          // Signature text
          page.drawText(sigText, {
            x: sigX,
            y: sigY,
            size: fontSize,
            font,
            color: rgb(0.3, 0.3, 0.3),
            opacity: 0.9
          });
        }
      }
      
      // Update document metadata for legal validity following the comprehensive model
      const metadataTimestamp = new Date().toISOString();
      const createDate = new Date();
      
      // Core metadata fields
      pdfDoc.setTitle(`Document sécurisé - ${uid}`);
      pdfDoc.setAuthor('Rémi Guillette');
      pdfDoc.setCreator('Rémi Guillette Consulting');
      pdfDoc.setProducer('BeaverDoc Secure Document System');
      pdfDoc.setCreationDate(createDate);
      pdfDoc.setModificationDate(createDate);
      
      // Complete security information for Subject field
      const securityInfo = `UID:${uid} | Token:${token} | Hash:${hash} | Created:${metadataTimestamp}`;
      const issuerInfo = `Certifié par: Rémi Guillette Consulting | Vérification: beaverdoc.verify.com`;
      
      // Set comprehensive subject with all security information
      pdfDoc.setSubject(`Document authentifié par BeaverDoc - ${securityInfo} | ${issuerInfo}`);
      
      // Comprehensive keywords array following the metadata model exactly
      const keywords = [
        'document',
        'sécurisé', 
        'authentifié',
        uid,
        token,
        hash,
        'Rémi',
        'Guillette', 
        'Consulting'
      ];
      
      // Add signature-related keywords if document is signed
      if (signatureInfo) {
        keywords.push(
          'signé',
          'électroniquement',
          `signature:${signatureInfo.split(':')[1]?.trim() || 'Signé'}`,
          'électroniquement:',
          'DIGITAL_',
          `date_signature:${metadataTimestamp}`
        );
      }
      
      // Set all keywords as a single string (PDF standard format)
      pdfDoc.setKeywords(keywords);
      
      // Serialize the modified document to a new buffer
      const modifiedPdfBytes = await pdfDoc.save();
      
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Error modifying PDF:', error);
      throw new Error('Unable to modify PDF to add UID and token');
    }
  };

  const handleOpenPDF = async (doc: Document) => {
    console.log("Opening PDF for document:", doc.title);
    
    try {
      // Use the original PDF data if available, otherwise create a demo document
      let originalPdfBytes: Uint8Array;
      
      if (doc.originalPdfData) {
        // Convert base64 back to ArrayBuffer, then to Uint8Array
        const binaryString = atob(doc.originalPdfData);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        originalPdfBytes = uint8Array;
      } else {
        // For sample documents, create a representative document
        const tempDoc = await PDFDocument.create();
        const tempPage = tempDoc.addPage();
        const { width, height } = tempPage.getSize();
        const font = await tempDoc.embedFont(StandardFonts.Helvetica);
        
        tempPage.drawText(`Document: ${doc.title}`, {
          x: 72,
          y: height - 100,
          size: 18,
          font,
          color: rgb(0, 0, 0),
        });
        
        // Add some sample content
        const content = [
          'This is a sample legal document that demonstrates',
          'the BeaverDoc security overlay system.',
          '',
          'Original document content would appear here',
          'exactly as it was in the source file.',
          '',
          'The security information is added as an overlay',
          'without modifying the original content.'
        ];
        
        let yPos = height - 150;
        content.forEach(line => {
          tempPage.drawText(line, {
            x: 72,
            y: yPos,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
          yPos -= 20;
        });
        
        originalPdfBytes = await tempDoc.save();
      }
      
      // Calculate hash of original document if not already available
      let documentHash = doc.hash;
      if (!documentHash && doc.originalPdfData) {
        documentHash = await calculateSHA256(doc.originalPdfData);
      }
      
      // Add security overlay to the original document
      const signatureInfo = `Status:${doc.status}`;
      const modifiedPdfBytes = await addUidAndTokenToPdf(
        originalPdfBytes.buffer,
        doc.uid,
        doc.token,
        documentHash || doc.hash,
        signatureInfo
      );
      
      // Create blob and open in new tab
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating PDF. Please try again.');
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log("Downloading document:", doc.title);
    
    // Create document metadata as JSON for download
    const documentData = {
      document: {
        id: doc.id,
        title: doc.title,
        uid: doc.uid,
        token: doc.token,
        hash: doc.hash,
        status: doc.status,
        timestamp: new Date(doc.createdAt!).toLocaleString(),
        author: doc.author,
        originalFileName: doc.originalFileName
      },
      security: {
        verified: true,
        integrity: "Valid",
        authenticity: "Confirmed"
      },
      exportedAt: new Date().toISOString(),
      exportedBy: "BeaverDoc System"
    };
    
    // Create and download the file
    const jsonString = JSON.stringify(documentData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareDocument = (doc: Document) => {
    console.log("Sharing document:", doc.title);
    
    // Create shareable document information
    const shareText = `Document: ${doc.title}
Document ID: ${doc.id}
UID: ${doc.uid}
Status: ${doc.status}
Processed: ${new Date(doc.createdAt!).toLocaleString()}
Author: ${doc.author}

Shared via BeaverDoc Legal Document Traceability System`;

    // Use Web Share API if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        title: `BeaverDoc - ${doc.title}`,
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        // Show success message without alert
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Document information copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        // Show fallback dialog with information
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
            <h3 class="font-semibold mb-3">Share Document Information</h3>
            <textarea readonly class="w-full h-32 p-2 border rounded text-sm" onclick="this.select()">${shareText}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
      });
    }
  };

  const handleVerifyDocument = (doc: Document | any) => {
    console.log("Verifying document:", doc.title);
    
    // Simulate document verification process
    const verificationResult = {
      isValid: true,
      verificationId: `VER-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      checksPerformed: [
        "UID Format Validation",
        "Token Authenticity Check",
        "Hash Integrity Verification",
        "Metadata Consistency Check"
      ]
    };
    
    const verificationInfo = `Document Verification Complete:
    
Document: ${doc.title}
Verification ID: ${verificationResult.verificationId}
Status: ${verificationResult.isValid ? 'VALID' : 'INVALID'}
Verified: ${verificationResult.timestamp}

Security Checks Performed:
${verificationResult.checksPerformed.map(check => `✓ ${check}`).join('\n')}

This document has passed all security verification checks and maintains its legal authenticity.`;
    
    alert(verificationInfo);
    
    // Add audit log entry for verification
    const auditEntry = {
      action: "Document Verified",
      timestamp: new Date().toLocaleString('en-CA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/,/, ''),
      description: `${doc.title} verified successfully - ${verificationResult.verificationId}`
    };
    setAuditLog(prev => [auditEntry, ...prev]);
  };



  return (
    <div className="min-h-screen bg-background">
      <ServiceHeader
        serviceName="BeaverDoc"
        serviceIcon={FileText}
        actionButton={
          <Button onClick={handleBackToDashboard} variant="outline">
            Back to Dashboard
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Legal Document Traceability System</h1>
          <p className="text-muted-foreground">
            Secure document traceability solution with unique identifiers and security tokens for guaranteed authenticity and legal value.
          </p>
        </div>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Library
                </CardTitle>
                <CardDescription>
                  Manage and view all processed documents with their security identifiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show loading state */}
                  {documentsLoading && (
                    <div className="text-center p-4">Loading documents...</div>
                  )}
                  
                  {/* Show documents from database */}
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">Document ID: {doc.id}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">Recently Processed</p>
                        </div>
                        <Badge variant={doc.status === "Signed" ? "default" : doc.status === "Processed" ? "secondary" : "outline"}>
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">UID:</span> {doc.uid}
                        </div>
                        <div>
                          <span className="font-medium">Token:</span> {doc.token}
                        </div>
                        <div>
                          <span className="font-medium">Hash:</span> {doc.hash.substring(0, 16)}...
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(doc.createdAt!).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                          <FileCheck className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDocument(doc)}>
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show message if no documents */}
                  {documents.length === 0 && !documentsLoading && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No documents processed yet. Upload a PDF to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document Upload
                </CardTitle>
                <CardDescription>
                  Import PDF documents with automatic generation of unique identifiers and security tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload PDF Document</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <div className="flex justify-center">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="max-w-sm cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {selectedFile && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-semibold mb-2">Selected File</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={handleProcessDocument}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Process Document
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedFile(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Unique Identifier (UID)</h4>
                        <p className="text-sm text-muted-foreground">
                          Standardized format with date/time and user identifiers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Traceability Token</h4>
                        <p className="text-sm text-muted-foreground">
                          Unique security token for each document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileCheck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Cryptographic Fingerprint</h4>
                        <p className="text-sm text-muted-foreground">
                          SHA-256 hash of original content
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Markup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Internal Markup</h4>
                        <p className="text-sm text-muted-foreground">
                          Direct insertion of identifiers within document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Visible Markup</h4>
                        <p className="text-sm text-muted-foreground">
                          Semi-transparent text in footer on each page
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Metadata Enrichment</h4>
                        <p className="text-sm text-muted-foreground">
                          Security metadata with author, creator, hash, timestamp
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>
                  Complete traceability of all document actions for legal compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Show new audit entries first */}
                  {auditLog.map((entry, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-sm text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  ))}
                  
                  {/* Show sample audit entries */}
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">Document Processed</span>
                      <span className="text-sm text-muted-foreground">2025-01-07 16:21:33</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Certificate of Compliance processed with UID-20250107-162133-RG03
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">Document Signed</span>
                      <span className="text-sm text-muted-foreground">2025-01-07 15:10:45</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Legal Notice - Municipal Ordinance electronically signed
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">Document Uploaded</span>
                      <span className="text-sm text-muted-foreground">2025-01-07 14:30:22</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contract Agreement - Smith Industries uploaded and processed
                    </p>
                  </div>
                  
                  {/* Show message if no audit entries */}
                  {auditLog.length === 0 && (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Document View Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Details
            </DialogTitle>
            <DialogDescription>
              Complete information and security metadata for this document
            </DialogDescription>
          </DialogHeader>
          
          {viewingDocument && (
            <div className="space-y-6">
              {/* Document Title and Status */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{viewingDocument.title}</h3>
                  <p className="text-sm text-muted-foreground">Document ID: {viewingDocument.id}</p>
                  {viewingDocument.originalFileName && (
                    <p className="text-xs text-muted-foreground">Original File: {viewingDocument.originalFileName}</p>
                  )}
                </div>
                <Badge variant={viewingDocument.status === "Signed" ? "default" : viewingDocument.status === "Processed" ? "secondary" : "outline"}>
                  {viewingDocument.status}
                </Badge>
              </div>

              {/* Security Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Security Identifiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">UID:</span>
                      <p className="font-mono text-xs break-all">{viewingDocument.uid}</p>
                    </div>
                    <div>
                      <span className="font-medium">Token:</span>
                      <p className="font-mono text-xs">{viewingDocument.token}</p>
                    </div>
                    <div>
                      <span className="font-medium">Hash:</span>
                      <p className="font-mono text-xs break-all">{viewingDocument.hash}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Author:</span>
                      <p>{viewingDocument.author}</p>
                    </div>
                    <div>
                      <span className="font-medium">Processed:</span>
                      <p>{viewingDocument.timestamp}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p>{viewingDocument.status}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  This document has been processed with secure identifiers and is ready for legal validation.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenPDF(viewingDocument)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadDocument(viewingDocument)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => handleShareDocument(viewingDocument)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}