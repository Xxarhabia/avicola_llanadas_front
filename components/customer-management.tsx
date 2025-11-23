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

type Customer = {
    id: string,
    fullName: string,
    address: string,
    phone: string,
    document: string
};

export function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [showForm, setShowForm] = useState(false)
    // const [searchId, setSearchId] = useState("")
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        fullName: "",
        address: "",
        phone: "",
        document: ""
    })

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.document) {
            toast({
                title: "Error en la validacion",
                description: "Por favor completa los campos",
                variant: "destructive"
            });
            return;
        }

        try { 
            const response = await fetch("http://localhost:8080/api/client/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    address: formData.address,
                    phone: formData.phone,
                    document: formData.document
                })
            });

            if(!response.ok) {
                throw new Error("Error al crear el usuario")
            }

            const result = await response.json();

            if (!result.status) {
                throw new Error(result.rsp_msg || "Error en la respuesta del servidor")
            }
            const newCustomer = result.rsp_data;
            setCustomers([...customers, {
                id: newCustomer.clientId,
                fullName: newCustomer.fullName,
                address: newCustomer.address,
                phone: newCustomer.phone,
                document: newCustomer.document
            }]);

            toast({
                title: "Exito",
                description: "Cliente creado correctamente",
            });

            setShowForm(false);
            setFormData({fullName: "", address: "", phone: "", document: ""});

        } catch(error) {
            console.log(error);
            toast({
                title: "Error",
                description: "No se pudo crear el cliente. Verifica el servidor",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/client/report")
                if (!response.ok) {
                    throw new Error("Error al obtener los clientes")
                }
                const data = await response.json();
                const customerList = data.rsp_data

                const mapped = customerList.map((cus: any) => ({
                    id: cus.clientId,
                    fullName: cus.fullName,
                    address: cus.address,
                    phone: cus.phone,
                    document: cus.document
                }));

                setCustomers(mapped)
            } catch (error) {
                console.error("Error cargando clientes: ", error)
            }
        };

        fetchCustomers();
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manejo de Clientes</h1>
                    <p className="text-muted-foreground">Gestionar el seguimiento a los clientes</p>
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
                            Nuevo Cliente
                        </>
                    )}
                </Button>
            </div>
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Nuevo Usuario</CardTitle>
                        <CardDescription>Introduzca los datos del nuevo usuario</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo *</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Jhon Doe"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <Input
                                        id="address"
                                        placeholder="Carrera x"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefono *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="xxxxxxxxxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="document">Documento *</Label>
                                    <Input
                                        id="document"
                                        placeholder="xxxxxxxxxx"
                                        value={formData.document}
                                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full sm:w-auto">
                                Registrar Cliente
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Clientes Registrados</CardTitle>
                    <CardDescription>Todos los clientes registrados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente ID</TableHead>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Telefono</TableHead>
                                    <TableHead>Dirección</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No hay clientes registrados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>{customer.id}</TableCell>
                                            <TableCell>{customer.fullName}</TableCell>
                                            <TableCell>{customer.document}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>{customer.address}</TableCell>
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
