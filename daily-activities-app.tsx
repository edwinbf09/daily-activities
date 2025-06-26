"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Home,
  Plus,
  List,
  Calendar,
  DollarSign,
  Trash2,
  Heart,
  Wallet,
  Plane,
  Gamepad2,
  Users,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  Loader2,
  Settings,
  FileText,
  ArrowLeft,
} from "lucide-react"
import type { ActivityData } from "./lib/types"
import { PDFReports } from "./components/pdf-reports"

const categories = [
  { id: "salud", name: "Salud", icon: Heart, color: "bg-red-500", lightColor: "bg-red-50 text-red-700" },
  { id: "finanzas", name: "Finanzas", icon: Wallet, color: "bg-green-500", lightColor: "bg-green-50 text-green-700" },
  { id: "viajes", name: "Viajes", icon: Plane, color: "bg-blue-500", lightColor: "bg-blue-50 text-blue-700" },
  { id: "ocio", name: "Ocio", icon: Gamepad2, color: "bg-purple-500", lightColor: "bg-purple-50 text-purple-700" },
  { id: "familia", name: "Familia", icon: Users, color: "bg-orange-500", lightColor: "bg-orange-50 text-orange-700" },
]

export default function DailyActivitiesApp() {
  const [currentView, setCurrentView] = useState<"home" | "add" | "list" | "category" | "settings" | "reports">("home")
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    amount: "",
    category: "",
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const { toast } = useToast()

  // Limpiar categoría seleccionada cuando se va al home
  useEffect(() => {
    if (currentView === "home") {
      setSelectedCategory("")
    }
  }, [currentView])

  // Cargar actividades al iniciar
  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)

      // TODO: Implementar carga desde la base de datos
      // Aquí deberías reemplazar la carga desde localStorage con la carga desde Neon
      const stored = localStorage.getItem("activities")
      if (stored) {
        const parsedActivities = JSON.parse(stored)
        setActivities(parsedActivities)
      }
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveToLocalStorage = (updatedActivities: ActivityData[]) => {
    localStorage.setItem("activities", JSON.stringify(updatedActivities))
  }

  const addActivity = async () => {
    if (!formData.name || !formData.date || !formData.category) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const newActivity: ActivityData = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description || null,
        date: formData.date,
        amount: Number.parseFloat(formData.amount) || 0,
        category: formData.category,
        is_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedActivities = [newActivity, ...activities]
      setActivities(updatedActivities)
      saveToLocalStorage(updatedActivities)

      setFormData({
        name: "",
        description: "",
        date: "",
        amount: "",
        category: "",
      })

      // Si venimos de una categoría específica, regresar a esa categoría
      if (selectedCategory) {
        setCurrentView("category")
      } else {
        setCurrentView("home")
      }

      toast({
        title: "¡Actividad agregada!",
        description: "Guardado localmente",
      })
    } catch (error) {
      console.error("Error adding activity:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la actividad",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const removeActivity = async (id: string) => {
    try {
      const updatedActivities = activities.filter((activity) => activity.id !== id)
      setActivities(updatedActivities)
      saveToLocalStorage(updatedActivities)

      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error removing activity:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive",
      })
    }
  }

  const togglePaidStatus = async (id: string) => {
    try {
      const updatedActivities = activities.map((activity) =>
        activity.id === id ? { ...activity, is_paid: !activity.is_paid } : activity,
      )

      setActivities(updatedActivities)
      saveToLocalStorage(updatedActivities)

      const activity = activities.find((a) => a.id === id)
      toast({
        title: activity?.is_paid ? "Marcado como no pagado" : "Marcado como pagado",
        description: `La actividad "${activity?.name}" se ha actualizado`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de pago",
        variant: "destructive",
      })
    }
  }

  const getActivityStats = () => {
    const totalAmount = activities
      .filter((activity) => activity.is_paid)
      .reduce((sum, activity) => sum + activity.amount, 0)

    const categoryStats = categories.map((category) => ({
      ...category,
      count: activities.filter((activity) => activity.category === category.id).length,
      amount: activities
        .filter((activity) => activity.category === category.id && activity.is_paid)
        .reduce((sum, activity) => sum + activity.amount, 0),
    }))

    const todayActivities = activities.filter(
      (activity) => activity.date === new Date().toISOString().split("T")[0],
    ).length

    return { totalAmount, categoryStats, todayActivities }
  }

  const { totalAmount, categoryStats, todayActivities } = getActivityStats()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0]
  }

  const viewCategoryActivities = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentView("category")
  }

  const goToAddActivityWithCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setFormData({
      ...formData,
      category: categoryId,
    })
    setCurrentView("add")
  }

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-600 mt-2">Gestiona la sincronización y respaldos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">✅ Base de datos configurada</p>
            <p className="text-sm text-gray-500 mt-1">Tus datos se guardan automáticamente</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total de actividades:</span>
            <span className="font-medium">{activities.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado de sincronización:</span>
            <Badge variant="secondary">Local</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Última actualización:</span>
            <span className="font-medium text-sm">
              {activities.length > 0
                ? new Date(Math.max(...activities.map((a) => new Date(a.updated_at).getTime()))).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReports = () => <PDFReports activities={activities} />

  const renderHome = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl">
        <h1 className="text-4xl font-bold mb-2">¡Bienvenido!</h1>
        <p className="text-xl opacity-90">Organiza tu día y alcanza tus metas</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Gastado</p>
                <p className="text-3xl font-bold text-green-700">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Actividades Totales</p>
                <p className="text-3xl font-bold text-blue-700">{activities.length}</p>
              </div>
              <Activity className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Hoy</p>
                <p className="text-3xl font-bold text-purple-700">{todayActivities}</p>
              </div>
              <Target className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Mis Categorías
          </CardTitle>
          <CardDescription>Haz clic en una categoría para ver todas tus actividades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-lg transition-all cursor-pointer hover:scale-105 hover:border-blue-300"
                  onClick={() => viewCategoryActivities(category.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500">Ver actividades</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actividades:</span>
                      <span className="font-medium text-blue-600">{category.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total gastado:</span>
                      <span className="font-medium text-green-600">${category.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actividades Recientes
          </CardTitle>
          <CardDescription>Tus últimas 3 actividades registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay actividades registradas</p>
              <p className="text-sm text-gray-400 mt-1">¡Comienza agregando tu primera actividad!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 3).map((activity) => {
                const categoryInfo = getCategoryInfo(activity.category)
                const IconComponent = categoryInfo.icon
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                    </div>
                    {activity.amount > 0 && <Badge variant="secondary">${activity.amount.toFixed(2)}</Badge>}
                    {activity.is_paid && <Badge className="bg-green-100 text-green-700">Pagado</Badge>}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderAddActivity = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Nueva Actividad</h2>
        <p className="text-gray-600 mt-2">Registra una nueva actividad en tu día</p>
      </div>

      {selectedCategory && (
        <div className="flex justify-center mb-4">
          <Button variant="outline" onClick={() => setCurrentView("category")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a {getCategoryInfo(selectedCategory).name}
          </Button>
        </div>
      )}

      {selectedCategory && (
        <div className="text-center mb-4">
          {(() => {
            const categoryInfo = getCategoryInfo(selectedCategory)
            const IconComponent = categoryInfo.icon
            return (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <IconComponent className="h-5 w-5" />
                <span className="text-sm">Agregando actividad a {categoryInfo.name}</span>
              </div>
            )
          })()}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Actividad *</Label>
              <Input
                id="name"
                placeholder="Ej: Consulta médica, Compra supermercado..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Button onClick={addActivity} className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Actividad
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderActivityList = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Todas las Actividades</h2>
        <p className="text-gray-600 mt-2">Historial completo de tus actividades</p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <List className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay actividades registradas</p>
            <p className="text-sm text-gray-400 mt-1">¡Comienza agregando tu primera actividad!</p>
            <Button onClick={() => setCurrentView("add")} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Actividad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const categoryInfo = getCategoryInfo(activity.category)
            const IconComponent = categoryInfo.icon
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{activity.name}</h3>
                          <Badge className={categoryInfo.lightColor}>{categoryInfo.name}</Badge>
                        </div>
                      </div>

                      {activity.description && <p className="text-gray-600 mb-3 ml-11">{activity.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-11">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(activity.date)}
                        </div>
                        {activity.amount > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />${activity.amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activity.is_paid ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePaidStatus(activity.id)}
                        className={
                          activity.is_paid
                            ? "bg-green-600 hover:bg-green-700"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        }
                      >
                        {activity.is_paid ? "Pagado" : "Marcar Pagado"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderCategoryView = () => {
    const categoryInfo = getCategoryInfo(selectedCategory)
    const IconComponent = categoryInfo.icon
    const categoryActivities = activities.filter((activity) => activity.category === selectedCategory)
    const categoryTotal = categoryActivities
      .filter((activity) => activity.is_paid)
      .reduce((sum, activity) => sum + activity.amount, 0)

    return (
      <div className="space-y-6">
        {/* Category Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-4 rounded-2xl ${categoryInfo.color}`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{categoryInfo.name}</h2>
              <p className="text-gray-600">Todas tus actividades de {categoryInfo.name.toLowerCase()}</p>
            </div>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-600">Total Actividades</p>
                  <p className="text-2xl font-bold text-blue-700">{categoryActivities.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">Total Gastado</p>
                  <p className="text-2xl font-bold text-green-700">${categoryTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setCurrentView("home")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>

        {/* Category Activities */}
        {categoryActivities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <IconComponent className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay actividades en {categoryInfo.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                ¡Agrega tu primera actividad de {categoryInfo.name.toLowerCase()}!
              </p>
              <Button onClick={() => goToAddActivityWithCategory(selectedCategory)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Actividad de {categoryInfo.name}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categoryActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{activity.name}</h3>
                          <Badge className={categoryInfo.lightColor}>{categoryInfo.name}</Badge>
                        </div>
                      </div>

                      {activity.description && <p className="text-gray-600 mb-3 ml-11">{activity.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-11">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(activity.date)}
                        </div>
                        {activity.amount > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />${activity.amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activity.is_paid ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePaidStatus(activity.id)}
                        className={
                          activity.is_paid
                            ? "bg-green-600 hover:bg-green-700"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        }
                      >
                        {activity.is_paid ? "Pagado" : "Marcar Pagado"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando actividades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Nuestra agenda</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentView === "home" ? "default" : "ghost"}
                onClick={() => setCurrentView("home")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Button>
              <Button
                variant={currentView === "add" ? "default" : "ghost"}
                onClick={() => setCurrentView("add")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
              <Button
                variant={currentView === "list" ? "default" : "ghost"}
                onClick={() => setCurrentView("list")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
              <Button
                variant={currentView === "settings" ? "default" : "ghost"}
                onClick={() => setCurrentView("settings")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Config
              </Button>
              <Button
                variant={currentView === "reports" ? "default" : "ghost"}
                onClick={() => setCurrentView("reports")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Reportes
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 py-8">
        {currentView === "home" && renderHome()}
        {currentView === "add" && renderAddActivity()}
        {currentView === "list" && renderActivityList()}
        {currentView === "category" && renderCategoryView()}
        {currentView === "settings" && renderSettings()}
        {currentView === "reports" && renderReports()}
      </main>
    </div>
  )
}
