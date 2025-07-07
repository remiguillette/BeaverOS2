import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ServiceHeader } from "@/components/service-header";
import { FileText, Upload, Shield, Clock, Hash, User, CheckCircle, FileCheck } from "lucide-react";

export default function BeaverDoc() {
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Debug log to see if selectedFile is properly updated
  console.log("Current selectedFile:", selectedFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("File selected:", event.target.files[0]);
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleProcessDocument = () => {
    console.log("Processing document:", selectedFile?.name);
    // Here you would typically upload the file to the server
    // For now, we'll just show a success message
    alert(`Document "${selectedFile?.name}" processed successfully! UID generated: UID-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}-RG`);
    setSelectedFile(null);
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
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
                        <Button size="sm" variant="outline">
                          <FileCheck className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}