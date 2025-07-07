import { useState } from "react";
import { CreditCard, DollarSign, Receipt, ShoppingCart, Plus, Search, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ServiceHeader } from "@/components/service-header";
import { insertInvoiceSchema, insertPaymentSchema, insertPosTransactionSchema } from "@shared/schema";
import type { Invoice, Payment, PosTransaction } from "@shared/schema";

type InvoiceFormData = z.infer<typeof insertInvoiceSchema>;
type PaymentFormData = z.infer<typeof insertPaymentSchema>;
type PosTransactionFormData = z.infer<typeof insertPosTransactionSchema>;

export default function BeaverPay() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPosDialogOpen, setIsPosDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch data using React Query
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: posTransactions = [], isLoading: posLoading } = useQuery({
    queryKey: ['/api/pos-transactions'],
  });

  const queryClient = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      return apiRequest('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Success", description: "Invoice created successfully" });
      setIsInvoiceDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    },
  });

  const createPosTransactionMutation = useMutation({
    mutationFn: async (data: PosTransactionFormData) => {
      return apiRequest('/api/pos-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos-transactions'] });
      toast({ title: "Success", description: "POS transaction recorded successfully" });
      setIsPosDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record POS transaction", variant: "destructive" });
    },
  });

  // Filtered data based on search
  const filteredInvoices = invoices.filter((invoice: Invoice) =>
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosTransactions = posTransactions.filter((transaction: PosTransaction) =>
    transaction.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
      case "sent":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      {/* Service Header */}
      <ServiceHeader
        serviceName="BeaverPay"
        serviceIcon={CreditCard}
        userName={user?.name}
        actionButton={
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="bg-beaver-surface border-beaver-surface-light text-white hover:bg-beaver-orange hover:text-black"
          >
            ← Back to Dashboard
          </Button>
        }
      />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
          <p className="text-gray-400">
            Manage invoices, payments, and POS transactions with PayPal and Google Pay integration
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <DollarSign className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Receipt className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="pos" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <ShoppingCart className="w-4 h-4 mr-2" />
              POS Sales
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Statistics Cards */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Invoices</p>
                      <p className="text-2xl font-bold text-white">{invoices.length}</p>
                    </div>
                    <Receipt className="h-8 w-8 text-beaver-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Payments</p>
                      <p className="text-2xl font-bold text-white">{payments.length}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-beaver-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">POS Sales</p>
                      <p className="text-2xl font-bold text-white">{posTransactions.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-beaver-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(
                          [...payments, ...posTransactions].reduce((sum, item) => sum + item.amount, 0)
                        )}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-beaver-orange" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...payments, ...posTransactions]
                    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-beaver-dark rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-beaver-orange rounded-full flex items-center justify-center">
                            {'paymentId' in item ? <CreditCard className="w-4 h-4 text-black" /> : <ShoppingCart className="w-4 h-4 text-black" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {'paymentId' in item ? `Payment ${item.paymentId}` : `POS Sale ${item.transactionId}`}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {item.customerName} • {formatCurrency(item.amount)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.paymentStatus || 'completed')}>
                          {item.paymentStatus || 'completed'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white w-80"
                  />
                </div>
              </div>
              <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange text-black hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-beaver-surface border-beaver-surface-light">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Invoice</DialogTitle>
                  </DialogHeader>
                  <InvoiceForm onClose={() => setIsInvoiceDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-beaver-surface-light">
                      <TableHead className="text-gray-300">Invoice #</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Due Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice: Invoice) => (
                        <TableRow key={invoice.id} className="border-beaver-surface-light">
                          <TableCell className="text-white font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell className="text-white">{invoice.customerName}</TableCell>
                          <TableCell className="text-white">{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white w-80"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PayPal Integration */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-beaver-orange" />
                    PayPal Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-beaver-dark rounded-lg">
                    <p className="text-gray-300 text-sm mb-4">
                      Process payments securely with PayPal. Enter payment details below:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Amount (USD)</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-beaver-surface border-beaver-surface-light text-white"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <Input
                          placeholder="Payment description"
                          className="bg-beaver-surface border-beaver-surface-light text-white"
                        />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Process PayPal Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Pay Integration */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-beaver-orange" />
                    Google Pay Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-beaver-dark rounded-lg">
                    <p className="text-gray-300 text-sm mb-4">
                      Accept payments through Google Pay. Quick and secure transactions:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Amount (USD)</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-beaver-surface border-beaver-surface-light text-white"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <Input
                          placeholder="Payment description"
                          className="bg-beaver-surface border-beaver-surface-light text-white"
                        />
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Process Google Pay Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-white">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-beaver-surface-light">
                      <TableHead className="text-gray-300">Payment ID</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Method</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          Loading payments...
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment: Payment) => (
                        <TableRow key={payment.id} className="border-beaver-surface-light">
                          <TableCell className="text-white font-medium">{payment.paymentId}</TableCell>
                          <TableCell className="text-white">{payment.customerName}</TableCell>
                          <TableCell className="text-white">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell className="text-white capitalize">{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.paymentStatus)}>
                              {payment.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(payment.createdAt!).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POS Sales Tab */}
          <TabsContent value="pos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search POS transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white w-80"
                  />
                </div>
              </div>
              <Dialog open={isPosDialogOpen} onOpenChange={setIsPosDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange text-black hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Sale
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-beaver-surface border-beaver-surface-light">
                  <DialogHeader>
                    <DialogTitle className="text-white">New POS Sale</DialogTitle>
                  </DialogHeader>
                  <PosTransactionForm onClose={() => setIsPosDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-beaver-surface-light">
                      <TableHead className="text-gray-300">Transaction ID</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Payment Method</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Receipt</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          Loading POS transactions...
                        </TableCell>
                      </TableRow>
                    ) : filteredPosTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          No POS transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPosTransactions.map((transaction: PosTransaction) => (
                        <TableRow key={transaction.id} className="border-beaver-surface-light">
                          <TableCell className="text-white font-medium">{transaction.transactionId}</TableCell>
                          <TableCell className="text-white">{transaction.customerName || 'Walk-in'}</TableCell>
                          <TableCell className="text-white">{formatCurrency(transaction.totalAmount)}</TableCell>
                          <TableCell className="text-white capitalize">{transaction.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.paymentStatus)}>
                              {transaction.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{transaction.receiptNumber}</TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.createdAt!).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function InvoiceForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      amount: 0,
      currency: "USD",
      status: "draft",
      description: "",
      items: "",
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      return apiRequest('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Success", description: "Invoice created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    const totalAmount = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0);
    createInvoiceMutation.mutate({ ...data, totalAmount });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-dark border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Customer Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-beaver-dark border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Customer Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Amount</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-beaver-dark border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Tax Amount</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Discount Amount</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-beaver-surface-light text-white hover:bg-beaver-surface"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createInvoiceMutation.isPending}
            className="bg-beaver-orange text-black hover:bg-orange-600"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PosTransactionForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PosTransactionFormData>({
    resolver: zodResolver(insertPosTransactionSchema),
    defaultValues: {
      transactionId: `POS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      type: "sale",
      amount: 0,
      currency: "USD",
      paymentMethod: "paypal",
      customerName: "",
      customerEmail: "",
      items: "",
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentStatus: "pending",
      employeeId: "EMP-001",
    },
  });

  const createPosTransactionMutation = useMutation({
    mutationFn: async (data: PosTransactionFormData) => {
      return apiRequest('/api/pos-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos-transactions'] });
      toast({ title: "Success", description: "POS transaction recorded successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record POS transaction", variant: "destructive" });
    },
  });

  const onSubmit = (data: PosTransactionFormData) => {
    const totalAmount = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0);
    createPosTransactionMutation.mutate({ ...data, totalAmount });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Transaction ID</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-dark border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="googlepay">Google Pay</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Customer Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Customer Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Amount</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Items (JSON format)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder='[{"name": "Item", "quantity": 1, "price": 10.00, "total": 10.00}]'
                  className="bg-beaver-dark border-beaver-surface-light text-white" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Tax Amount</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Discount Amount</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" className="bg-beaver-dark border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-beaver-surface-light text-white hover:bg-beaver-surface"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPosTransactionMutation.isPending}
            className="bg-beaver-orange text-black hover:bg-orange-600"
          >
            {createPosTransactionMutation.isPending ? "Processing..." : "Record Sale"}
          </Button>
        </div>
      </form>
    </Form>
  );
}