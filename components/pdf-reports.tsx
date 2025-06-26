"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  Heart,
  Wallet,
  Plane,
  Gamepad2,
  Users,
} from "lucide-react"
import type { ActivityData } from "../lib/types"
import { pdfGenerator } from "../lib/pdf-generator"

const categories = [
  { id: "salud", name: "Salud", icon: Heart, color: "bg-red-500" },
  { id: "finanzas", name: "Finanzas", icon: Wallet, color: "bg-green-500" },
  { id: "viajes", name: "Viajes", icon: Plane, color: "bg-blue-500" },
  { id: "ocio", name: "Ocio", icon: Gamepad2, color: "bg-purple-500" },
  { id: "familia", name: "Familia", icon: Users, color: "bg-orange-500" },
]

interface PDFReportsProps {
  activities: ActivityData[]
}

export function PDFReports({ activities }: PDFReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateCategoryReport = async () => {
    if (!selectedCategory) {
      toast({
        title: "Selecciona una categoría",
        description: "Por favor selecciona una categoría para generar el reporte",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      pdfGenerator.generateCategoryReport(selectedCategory, activities)
      toast({
        title: "¡Reporte generado!",
        description: "El reporte PDF se ha descargado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCompleteReport = async () => {
    if (activities.length === 0) {
      toast({
        title: "No hay actividades",
        description: "No hay actividades para generar el reporte",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      pdfGenerator.generateCompleteReport(activities)
      toast({
        title: "¡Reporte completo generado!",
        description: "El reporte PDF completo se ha descargado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryActivities = activities.filter((activity) => activity.category === categoryId)
    const totalAmount = categoryActivities.reduce((sum, activity) => sum + activity.amount, 0)
    const paidAmount = categoryActivities
      .filter((activity) => activity.is_paid)
      .reduce((sum, activity) => sum + activity.amount, 0)

    return {
      count: categoryActivities.length,
      totalAmount,
      paidAmount,
    }
  }

  const getGeneralStats = () => {
    const totalActivities = activities.length
    const paidActivities = activities.filter((a) => a.is_paid).length
    const totalAmount = activities.reduce((sum, a) => sum + a.amount, 0)
    const paidAmount = activities.filter((a) => a.is_paid).reduce((sum, a) => sum + a.amount, 0)

    return {
      totalActivities,
      paidActivities,
      pendingActivities: totalActivities - paidActivities,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    }
  }

  const generalStats = getGeneralStats()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Reportes PDF</h2>
        <p className="text-gray-600 mt-2">Genera reportes profesionales de tus actividades</p>
      </div>

      {/* Estadísticas Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{generalStats.totalActivities}</p>
              <p className="text-sm text-blue-600">Total Actividades</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">${generalStats.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-green-600">Monto Total</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{generalStats.paidActivities}</p>
              <p className="text-sm text-purple-600">Pagadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporte Completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reporte Completo
          </CardTitle>
          <CardDescription>Genera un reporte PDF con todas las actividades y estadísticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">El reporte incluye:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Resumen estadístico general</li>
                <li>• Análisis por categorías</li>
                <li>• Lista detallada de todas las actividades</li>
                <li>• Montos totales y pagados</li>
                <li>• Fecha de generación</li>
              </ul>
            </div>
            <Button onClick={generateCompleteReport} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                "Generando..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Reporte Completo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reportes por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes por Categoría
          </CardTitle>
          <CardDescription>Genera reportes específicos para cada categoría de actividades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Categoría</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una categoría para el reporte" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = category.icon
                  const stats = getCategoryStats(category.id)
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {stats.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Vista previa de la categoría seleccionada */}
          {selectedCategory && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                {(() => {
                  const category = categories.find((c) => c.id === selectedCategory)
                  const IconComponent = category?.icon || Activity
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${category?.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category?.name}</h4>
                        <p className="text-sm text-gray-600">Vista previa del reporte</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {(() => {
                const stats = getCategoryStats(selectedCategory)
                return (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-700">{stats.count}</p>
                      <p className="text-xs text-blue-600">Actividades</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-700">${stats.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-green-600">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-700">${stats.paidAmount.toFixed(2)}</p>
                      <p className="text-xs text-purple-600">Pagado</p>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <Button
            onClick={generateCategoryReport}
            disabled={!selectedCategory || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              "Generando..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte de Categoría
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Vista rápida de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Rápida por Categorías</CardTitle>
          <CardDescription>Estadísticas de cada categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              const stats = getCategoryStats(category.id)
              return (
                <div
                  key={category.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-gray-500">{stats.count} actividades</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">${stats.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-medium text-green-600">${stats.paidAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
