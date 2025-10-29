"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type SaleType = "aves" | "alimento"

type Sale = {
  id: string
  type: SaleType
  itemDescription: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customer: string
  date: string
}

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: "SL001",
      type: "aves",
      itemDescription: "Broiler Chickens",
      quantity: 100,
      unitPrice: 8.5,
      totalAmount: 850,
      customer: "ABC Restaurant",
      date: "2025-01-25",
    },
    {
      id: "SL002",
      type: "alimento",
      itemDescription: "Starter Feed",
      quantity: 50,
      unitPrice: 2.5,
      totalAmount: 125,
      customer: "Local Farm Co-op",
      date: "2025-01-26",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    type: "birds" as SaleType,
    itemDescription: "",
    quantity: "",
    unitPrice: "",
    customer: "",
    date: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !formData.itemDescription ||
      !formData.quantity ||
      !formData.unitPrice ||
      !formData.customer ||
      !formData.date
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const quantity = Number.parseFloat(formData.quantity)
    const unitPrice = Number.parseFloat(formData.unitPrice)
    const totalAmount = quantity * unitPrice

    const newSale: Sale = {
      id: `SL${String(sales.length + 1).padStart(3, "0")}`,
      type: formData.type,
      itemDescription: formData.itemDescription,
      quantity,
      unitPrice,
      totalAmount,
      customer: formData.customer,
      date: formData.date,
    }

    setSales([...sales, newSale])
    setFormData({
      type: "aves",
      itemDescription: "",
      quantity: "",
      unitPrice: "",
      customer: "",
      date: "",
    })
    setShowForm(false)
    toast({
      title: "Success",
      description: `Sale ${newSale.id} recorded successfully`,
    })
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const birdSales = sales.filter((s) => s.type === "aves")
  const feedSales = sales.filter((s) => s.type === "alimento")
  const birdRevenue = birdSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const feedRevenue = feedSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de ventas</h1>
          <p className="text-muted-foreground">Registrar y realizar un seguimiento de las ventas de aves y alimentos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva venta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{sales.length} Ventas Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Aves</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${birdRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{birdSales.length} ventas de aves</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Alimentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${feedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{feedSales.length} ventas de alimentos</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Venta</CardTitle>
            <CardDescription>Introduzca los detalles de la transacción de venta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Venta *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: SaleType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aves">Aves</SelectItem>
                      <SelectItem value="alimento">Alimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Descripción *</Label>
                  <Input
                    id="itemDescription"
                    placeholder="e.g., Broiler Chickens, Starter Feed"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Precio Unitario ($) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="8.50"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente *</Label>
                  <Input
                    id="customer"
                    placeholder="Nombre del cliente"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de Venta *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              {formData.quantity && formData.unitPrice && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">
                    Total Amount: $
                    {(Number.parseFloat(formData.quantity) * Number.parseFloat(formData.unitPrice)).toFixed(2)}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full sm:w-auto">
                Registrar Venta
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>Todos los registros de las transacciones de venta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venta ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Monto Total</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No ventas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>
                        <Badge variant={sale.type === "aves" ? "default" : "secondary"}>
                          {sale.type === "aves" ? "Aves" : "Alimento"}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.itemDescription}</TableCell>
                      <TableCell>{sale.quantity.toLocaleString()}</TableCell>
                      <TableCell>${sale.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${sale.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
