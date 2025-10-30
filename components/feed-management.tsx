"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type FeedInventory = {
  id: string
  feedType: string
  availableQuantity: number
  unit: string
  dateAdded: string
}

type FeedConsumption = {
  id: string
  flockId: string
  feedType: string
  quantity: number
  unit: string
  date: string
}

const feedTypes = ["Alimento de inicio", "Alimento de crecimiento", "Alimento de finalización", "Alimento para ponedoras", "Suplemento"]
const units = ["kg", "lbs", "g"]

export function FeedManagement() {
  const [inventory, setInventory] = useState<FeedInventory[]>([])

  const [consumption, setConsumption] = useState<FeedConsumption[]>([])

  const [showAddFeed, setShowAddFeed] = useState(false)
  const [showRecordConsumption, setShowRecordConsumption] = useState(false)
  const { toast } = useToast()

  // Add feed form state
  const [addFeedForm, setAddFeedForm] = useState({
    availableQuantity: "",
    foodType: "",
    unit: "kg",
    dateInsert: "",
  })

  // Consumption form state
  const [consumptionForm, setConsumptionForm] = useState({
    flockId: "",
    feedType: "",
    quantity: "",
    unit: "kg",
    date: "",
  })

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/food/report");
        if (!response.ok) {
          throw new Error("Error al obtener los alimentos");
        }
        const data = await response.json();

        const mapped = data.map((food: any) => ({
          id: food.foodId,
          feedType: food.type,
          availableQuantity: food.availableQuantity,
          unit: food.unitMeasurement,
          dateAdded: food.dateInsert,
        }));

        setInventory(mapped);
      } catch (error) {
        console.error("Error cargando inventario: ", error)
      }
    };

    fetchFood();
  }, [])

  useEffect(() => {
    const fetchConsumption = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/food/report-consumption");
        if (!response.ok) {
          throw new Error("Error al obtener los alimentos");
        }
        const data = await response.json();

        const mapped = data.map((consum: any) => ({
          id: consum.id,
          flockId: consum.birdLot.lotId,
          feedType: consum.food.foodId,
          quantity: consum.quantityUsed,
          unit: consum.unit,
          date: consum.date,
        }));

        setConsumption(mapped);
      } catch (error) {
        console.error("Error cargando consumos", error);
      }
    };

    fetchConsumption();
  }, [])

  const handleAddFeed = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!addFeedForm.availableQuantity || !addFeedForm.foodType || !addFeedForm.dateInsert){
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/food/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableQuantity: parseFloat(addFeedForm.availableQuantity),
          foodType: addFeedForm.foodType,
          unit: addFeedForm.unit,
          dateInsert: addFeedForm.dateInsert
        })
      });
      
      if (!response.ok) {
        throw new Error("Error al cargar el alimento")
      }

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.rsp_msg || "Error en la respuesta del servidor");
      }

      const newFood = result.rsp_data;
      setInventory([...inventory, {
        id: newFood.foodId,
        feedType: newFood.type,
        availableQuantity: newFood.availableQuantity,
        unit: newFood.unitMeasurement,
        dateAdded: newFood.dateInsert 
      }])

      toast({
        title: "Éxito",
        description: "Alimento agregado correctamente",
      });

      setAddFeedForm({foodType: "", availableQuantity: "", unit: "kg", dateInsert: "" })
      setShowAddFeed(false);
      toast({
        title: "Success",
        description: "Feed added to inventory",
      })
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo agregar el alimento. Verifica el servidor.",
        variant: "destructive",
      });
    }
  }

  const handleRecordConsumption = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consumptionForm.flockId || !consumptionForm.feedType || !consumptionForm.quantity || !consumptionForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return;
    }

    const consumedQty = Number.parseFloat(consumptionForm.quantity);

    const feedItem = inventory.find((item) => item.feedType === consumptionForm.feedType);
    if (!feedItem) {
      toast({
        title: "Error",
        description: "El tipo de alimento no existe en el inventario",
        variant: "destructive",
      });
      return;
    }

    if (feedItem.availableQuantity < consumedQty) {
      toast({
        title: "Error",
        description: "Cantidad insuficiente de alimento en el inventario",
        variant: "destructive"
      })
    }

    try {

      const response = await fetch("http://localhost:8080/api/food/consumption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          birdLotId: consumptionForm.flockId,
          typeFood: consumptionForm.feedType,
          quantityUsed: consumptionForm.quantity,
          unit: consumptionForm.unit,
          dateInsert: consumptionForm.date,
        }),
      });

      if (!response.ok) { 
        throw new Error("Error al registrar el consumo de alimento");
      }

      const result = await response.json();
      if (!result.status) {
        throw new Error(result.rsp_msg || "Error en la respuesta del servidor")
      }

      const newConsumption = result.rsp_data;

      setInventory(
        inventory.map((item) =>
          item.feedType === consumptionForm.feedType
            ? { ...item, availableQuantity: item.availableQuantity - consumedQty}
            : item
        )
      );

      setConsumption([
        ...consumption,
        {
          id: newConsumption.id,
          date: newConsumption.date,
          quantity: newConsumption.quantityUsed,
          flockId: newConsumption.birdLot.lotId,
          feedType: newConsumption.food.type,
          unit: newConsumption.food.unitMeasurement,
        },
      ]);

      setConsumptionForm({ flockId: "", feedType: "", quantity: "", unit: "KG", date: "" });
      setShowRecordConsumption(false);
      toast({
        title: "Exito",
        description: "Consumo de alimento registrado",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.availableQuantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Alimento</h1>
          <p className="text-muted-foreground">Seguimiento del inventario y consumo de alimentos</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventario Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">{inventory.length} tipos de alimento en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumido</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumption.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground">{consumption.length} registros de consumo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Alimento</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Diferentes tipos de alimentos disponibles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="consumption">Historial de Consumo</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddFeed(!showAddFeed)} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Alimento
            </Button>
          </div>

          {showAddFeed && (
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Alimento</CardTitle>
                <CardDescription>Registrar nuevo alimento añadido al inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFeed} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="feedType">Tipo de Alimento *</Label>
                      <Select
                        value={addFeedForm.foodType}
                        onValueChange={(value) => setAddFeedForm({ ...addFeedForm, foodType: value })}
                      >
                        <SelectTrigger id="feedType">
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feedTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        placeholder="500"
                        value={addFeedForm.availableQuantity}
                        onChange={(e) => setAddFeedForm({ ...addFeedForm, availableQuantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidad de Medida *</Label>
                      <Select
                        value={addFeedForm.unit}
                        onValueChange={(value) => setAddFeedForm({ ...addFeedForm, unit: value })}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateAdded">Fecha de Adición *</Label>
                      <Input
                        id="dateAdded"
                        type="date"
                        value={addFeedForm.dateInsert}
                        onChange={(e) => setAddFeedForm({ ...addFeedForm, dateInsert: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit">Añadir al Inventario</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Inventario de Alimento</CardTitle>
              <CardDescription>Alimento disponible en stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alimento ID</TableHead>
                      <TableHead>Typo de Alimento</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad de Medida</TableHead>
                      <TableHead>Fecha de Adición</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No alimentos en inventario
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.feedType}</TableCell>
                          {/* <TableCell>{item.availableQuantity.toLocaleString()}</TableCell> */}
                          <TableCell>{item.availableQuantity?.toLocaleString?.() ?? 0}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{new Date(item.dateAdded).toLocaleDateString("es-CO", {timeZone: "UTC"})}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRecordConsumption(!showRecordConsumption)} className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Consumo
            </Button>
          </div>

          {showRecordConsumption && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Consumo de Alimento</CardTitle>
                <CardDescription>Seguimiento de alimentos consumidos por el lote</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordConsumption} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="flockId">Lote ID *</Label>
                      <Input
                        id="flockId"
                        placeholder="FL001"
                        value={consumptionForm.flockId}
                        onChange={(e) => setConsumptionForm({ ...consumptionForm, flockId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumptionFeedType">Tipo de Alimento *</Label>
                      <Select
                        value={consumptionForm.feedType}
                        onValueChange={(value) => setConsumptionForm({ ...consumptionForm, feedType: value })}
                      >
                        <SelectTrigger id="consumptionFeedType">
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory.map((item) => (
                            <SelectItem key={item.id} value={item.feedType}>
                              {item.feedType} ({item.availableQuantity} {item.unit} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumptionQuantity">Cantidad *</Label>
                      <Input
                        id="consumptionQuantity"
                        type="number"
                        step="0.01"
                        placeholder="50"
                        value={consumptionForm.quantity}
                        onChange={(e) => setConsumptionForm({ ...consumptionForm, quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumptionUnit">Unidad de Medida *</Label>
                      <Select
                        value={consumptionForm.unit}
                        onValueChange={(value) => setConsumptionForm({ ...consumptionForm, unit: value })}
                      >
                        <SelectTrigger id="consumptionUnit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumptionDate">Fecha *</Label>
                      <Input
                        id="consumptionDate"
                        type="date"
                        value={consumptionForm.date}
                        onChange={(e) => setConsumptionForm({ ...consumptionForm, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit">Registrar Consumo</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Historial de Consumo</CardTitle>
              <CardDescription>Alimentos consumidos por lote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registro ID</TableHead>
                      <TableHead>Lote ID</TableHead>
                      <TableHead>Tipo de Alimento</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad de Medida</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumption.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No registro de consumo
                        </TableCell>
                      </TableRow>
                    ) : (
                      consumption.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>{record.flockId}</TableCell>
                          <TableCell>{record.feedType}</TableCell>
                          <TableCell>{record.quantity.toLocaleString()}</TableCell>
                          <TableCell>{record.unit}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
