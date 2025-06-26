"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calendar, Clock, DollarSign } from "lucide-react"

interface Activity {
  id: string
  name: string
  description: string
  date: string
  time: string
  amount: number
  category: string
}

export default function Component() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    amount: "",
    category: "",
  })

  const addActivity = () => {
    if (!formData.name || !formData.date || !formData.time) {
      return
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      amount: Number.parseFloat(formData.amount) || 0,
      category: formData.category || "General",
    }

    setActivities([newActivity, ...activities])
    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      amount: "",
      category: "",
    })
  }

  const removeActivity = (id: string) => {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  const totalAmount = activities.reduce((sum, activity) => sum + activity.amount, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Actividades</h1>
          <p className="text-gray-600 mt-2">Lleva el control de tus actividades diarias</p>
        </div>

        {/* Add Activity Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nueva Actividad
            </CardTitle>
            <CardDescription>Registra una nueva actividad con todos los detalles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Actividad *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Almuerzo, Transporte, Reunión..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  placeholder="Ej: Comida, Transporte, Trabajo..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales sobre la actividad..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={addActivity} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Actividad
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        {activities.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total de Actividades</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No hay actividades registradas aún</p>
                <p className="text-sm text-gray-400 mt-1">Agrega tu primera actividad usando el formulario de arriba</p>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{activity.name}</h3>
                        <Badge variant="secondary">{activity.category}</Badge>
                      </div>

                      {activity.description && <p className="text-gray-600 mb-3">{activity.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(activity.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(activity.time)}
                        </div>
                        {activity.amount > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />${activity.amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(activity.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
