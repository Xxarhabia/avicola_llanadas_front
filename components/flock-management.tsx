"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type FlockStatus = "active" | "closed"

type Flock = {
  id: string
  birdType: string
  startDate: string
  initialQuantity: number
  currentQuantity: number
  status: FlockStatus
  closedDate?: string
}

const birdTypes = ["Pollo de engorde", "Ponedora", "Pavo", "Pato", "Codorniz"]

export function FlockManagement() {
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchId, setSearchId] = useState("")
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    birdType: "",
    quantity: "",
    startDate: "",
  })

  useEffect(() => {
    const fetchFlocks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/bird-lot/report");
        if (!response.ok) {
          throw new Error("Error al obtener los lotes");
        }
        const data = await response.json();

        const mapped = data.map((lot: any) => ({
          id: lot.lotId,
          startDate: lot.dateEntry,
          closedDate: lot.closingDate,
          status: lot.status === 1 ? "active" : "closed",
          birdType: lot.bird_type,
          initialQuantity: lot.initial_quantity,
          currentQuantity: lot.current_quantity
        }));

        setFlocks(mapped)
      } catch (error) {
        console.error("Error cargando lotes: ", error)
      }
    };

    fetchFlocks();
  }, []);


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || !formData.birdType || !formData.startDate) {
      toast({
        title: "Error en la validación",
        description: "Por favor completa los campos",
        variant: "destructive"
      });
      return;
    }

    try { 
      const response = await fetch("http://localhost:8080/api/bird-lot/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birdType: formData.birdType,
          initialQuantity: parseInt(formData.quantity),
          currentQuantity: parseInt(formData.quantity),
          startDate: formData.startDate,
          status: "active"
        })
      });

      if (!response.ok) {
        throw new Error("Error al crear el lote")
      }

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.rsp_msg || "Error en la respuesta del servidor");
      }

      const newFlock = result.rsp_data
      setFlocks([...flocks, {
        id: newFlock.lotId,
        startDate: newFlock.dateEntry,
        closedDate: newFlock.closingDate,
        status: newFlock.status === 1 ? "active" : "closed",
        birdType: newFlock.bird_type,
        initialQuantity: newFlock.initial_quantity,
        currentQuantity: newFlock.current_quantity
      }])

      toast({
        title: "Éxito",
        description: "Lote creado correctamente",
      });

      setShowForm(false);
      setFormData({quantity: "", birdType: "", startDate: ""})

    }catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo crear el lote. Verifica el servidor.",
        variant: "destructive",
      });
    }
  }

  const closeFlock = (id: string) => {
    setFlocks(
      flocks.map((flock) =>
        flock.id === id
          ? { ...flock, status: "closed" as FlockStatus, closedDate: new Date().toISOString().split("T")[0] }
          : flock,
      ),
    )
    toast({
      title: "Flock Closed",
      description: `Flock ${id} has been closed`,
    })
  }

  const filteredFlocks = searchId ? flocks.filter((f) => f.id.toLowerCase().includes(searchId.toLowerCase())) : flocks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manejo de Lotes</h1>
          <p className="text-muted-foreground">Crea, gestiona y realiza un seguimiento de tus lotes de aves</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? (
            <>
              <X className="h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Nuevo Lote
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Lote</CardTitle>
            <CardDescription>Introduzca los detalles del nuevo lote de aves</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="500"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birdType">Tipo de Ave *</Label>
                  <Select
                    value={formData.birdType}
                    onValueChange={(value) => setFormData({ ...formData, birdType: value })}
                  >
                    <SelectTrigger id="birdType">
                      <SelectValue placeholder="Seleccione un tipo de ave" />
                    </SelectTrigger>
                    <SelectContent>
                      {birdTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Crear Lote
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lotes Activos</CardTitle>
              <CardDescription>Visualizar y administrar todos los lotes de aves</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote ID</TableHead>
                  <TableHead>Tipo de Ave</TableHead>
                  <TableHead>Cantidad Inicial</TableHead>
                  <TableHead>Cantidad actual</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de cierre</TableHead>
                  <TableHead className="text-center">Opciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay lotes registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlocks.map((flock) => (
                    <TableRow key={flock.id}>
                      <TableCell className="font-medium">{flock.id}</TableCell>
                      <TableCell>{flock.birdType}</TableCell>
                      <TableCell>{flock.initialQuantity.toLocaleString()}</TableCell>
                      <TableCell>{flock.initialQuantity.toLocaleString()}</TableCell>
                      <TableCell>{new Date(flock.startDate).toLocaleDateString("es-CO", {timeZone: "UTC"})}</TableCell>
                      <TableCell>
                        <Badge variant={flock.status === "active" ? "default" : "secondary"}>{flock.status}</Badge>
                      </TableCell>
                      <TableCell>{flock.closedDate ? new Date(flock.closedDate).toLocaleDateString("es-CO", {timeZone: "UTC"}) : "-"}</TableCell>
                      <TableCell className="text-right justify-around flex">
                        {flock.status === "active" && (
                          <Button variant="outline" size="sm" onClick={() => closeFlock(flock.id)}>
                            Cerrar Lote
                          </Button>
                        )}
                        {flock.status === "active" && (
                          <Button variant="outline" size="sm" onClick={() => alert("editando")}>
                            Editar
                          </Button>
                        )}
                      </TableCell>
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
