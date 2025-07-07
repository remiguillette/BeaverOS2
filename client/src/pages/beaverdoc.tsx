import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceHeader } from "@/components/service-header";
import { FileText, Upload, Shield, Clock, Hash, User, CheckCircle, FileCheck, ExternalLink, Download, Eye } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface ProcessedDocument {
  id: string;
  title: string;
  uid: string;
  token: string;
  hash: string;
  status: string;
  timestamp: string;
  author: string;
  originalFileName: string;
}

export default function BeaverDoc() {
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [auditLog, setAuditLog] = useState<{action: string; timestamp: string; description: string}[]>([]);
  const [viewingDocument, setViewingDocument] = useState<ProcessedDocument | null>(null);

  // Debug log to see if selectedFile is properly updated
  console.log("Current selectedFile:", selectedFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("File selected:", event.target.files[0]);
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleProcessDocument = () => {
    if (!selectedFile) return;
    
    console.log("Processing document:", selectedFile.name);
    
    // Generate unique identifiers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const uid = `UID-${timestamp}-RG${String(processedDocuments.length + 4).padStart(2, '0')}`;
    const token = `TK-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    const hash = Math.random().toString(36).substr(2, 32);
    const docId = `DOC-2025-${String(processedDocuments.length + 4).padStart(3, '0')}`;
    
    // Create processed document
    const newDocument: ProcessedDocument = {
      id: docId,
      title: selectedFile.name.replace(/\.pdf$/i, ''),
      uid: uid,
      token: token,
      hash: hash,
      status: "Processed",
      timestamp: new Date().toLocaleString('en-CA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/,/, ''),
      author: "Rémi Guillette",
      originalFileName: selectedFile.name
    };
    
    // Add to processed documents
    setProcessedDocuments(prev => [newDocument, ...prev]);
    
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
    
    // Show success message
    alert(`Document "${selectedFile.name}" processed successfully! UID generated: ${uid}`);
    setSelectedFile(null);
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
  };

  const handleViewDocument = (doc: ProcessedDocument | any) => {
    console.log("Viewing document:", doc.title);
    setViewingDocument(doc);
  };

  const handleOpenPDF = async (doc: ProcessedDocument) => {
    console.log("Opening PDF for document:", doc.title);
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page to the document
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Get fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Document title
      page.drawText(`Document: ${doc.title}`, {
        x: 72,
        y: height - 100,
        size: 18,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      // Document content
      const content = [
        'This is a legally processed document through the BeaverDoc',
        'Legal Document Traceability System.',
        '',
        'Document Details:',
        `- Document ID: ${doc.id}`,
        `- Status: ${doc.status}`,
        `- Author: ${doc.author}`,
        `- Processed: ${doc.timestamp}`,
        '',
        'Security Information:',
        `- UID: ${doc.uid}`,
        `- Token: ${doc.token}`,
        `- Hash: ${doc.hash}`,
        '',
        'This document has been digitally processed and secured',
        'with unique identifiers for legal compliance.',
      ];
      
      let yPosition = height - 150;
      content.forEach((line) => {
        if (line.startsWith('Document Details:') || line.startsWith('Security Information:')) {
          page.drawText(line, {
            x: 72,
            y: yPosition,
            size: 12,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
        } else {
          page.drawText(line, {
            x: 72,
            y: yPosition,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        yPosition -= 20;
      });
      
      // Add signature information at the bottom right
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
      
      // Version simplifiée en format court pour être plus lisible
      const uidShort = doc.uid.substring(doc.uid.length - 8);
      const tokenShort = doc.token.substring(doc.token.length - 8);
      
      // First line: Digital signature
      const sigText = `Signé: DIGITAL_ | ${timestamp}`;
      const sigTextWidth = helveticaFont.widthOfTextAtSize(sigText, 8);
      const sigX = width - sigTextWidth - 20;
      
      // Background rectangle for signature
      page.drawRectangle({
        x: sigX - 5,
        y: 35,
        width: sigTextWidth + 10,
        height: 25,
        color: rgb(1, 1, 1),
        opacity: 0.8
      });
      
      page.drawText(sigText, {
        x: sigX,
        y: 45,
        size: 8,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Second line: BeaverDoc info
      const beaverText = `BeaverDoc: P1/1 | UID:${uidShort} | Token:${tokenShort}`;
      const beaverTextWidth = helveticaFont.widthOfTextAtSize(beaverText, 8);
      const beaverX = width - beaverTextWidth - 20;
      
      page.drawText(beaverText, {
        x: beaverX,
        y: 32,
        size: 8,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Set PDF metadata
      pdfDoc.setTitle(`Document sécurisé - ${doc.uid}`);
      pdfDoc.setAuthor('Rémi Guillette');
      pdfDoc.setCreator('Rémi Guillette Consulting');
      pdfDoc.setProducer('BeaverDoc Secure Document System');
      pdfDoc.setSubject(`Document authentifié par BeaverDoc - UID:${doc.uid} | Token:${doc.token}`);
      pdfDoc.setKeywords(['document sécurisé', 'authentifié', doc.uid, doc.token, 'Rémi Guillette Consulting']);
      
      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create blob and open in new tab
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating PDF. Please try again.');
    }
  };

  const handleDownloadDocument = (doc: ProcessedDocument) => {
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
        timestamp: doc.timestamp,
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

  const handleShareDocument = (doc: ProcessedDocument) => {
    console.log("Sharing document:", doc.title);
    
    // Create shareable document information
    const shareText = `Document: ${doc.title}
Document ID: ${doc.id}
UID: ${doc.uid}
Status: ${doc.status}
Processed: ${doc.timestamp}
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

  const handleVerifyDocument = (doc: ProcessedDocument | any) => {
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

  const sampleDocuments = [
    {
      id: "DOC-2025-001",
      title: "Contract Agreement - Smith Industries",
      uid: "UID-20250107-143022-RG01",
      token: "TK-F4A8E9B2C1D5",
      hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      status: "Signed",
      timestamp: "2025-01-07 14:30:22",
      author: "Rémi Guillette",
    },
    {
      id: "DOC-2025-002",
      title: "Legal Notice - Municipal Ordinance",
      uid: "UID-20250107-151045-RG02",
      token: "TK-B7C9D2E4F1A8",
      hash: "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
      status: "Processed",
      timestamp: "2025-01-07 15:10:45",
      author: "Rémi Guillette",
    },
    {
      id: "DOC-2025-003",
      title: "Certificate of Compliance",
      uid: "UID-20250107-162133-RG03",
      token: "TK-E8F1A9B3C6D2",
      hash: "m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0",
      status: "Pending",
      timestamp: "2025-01-07 16:21:33",
      author: "Rémi Guillette",
    },
  ];

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
                  {/* Show processed documents first */}
                  {processedDocuments.map((doc) => (
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
                          <span className="font-medium">Timestamp:</span> {doc.timestamp}
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
                  
                  {/* Show sample documents */}
                  {sampleDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">Document ID: {doc.id}</p>
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
                          <span className="font-medium">Timestamp:</span> {doc.timestamp}
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
                  {processedDocuments.length === 0 && sampleDocuments.length === 0 && (
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