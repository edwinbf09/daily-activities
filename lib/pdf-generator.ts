"use client"

import jsPDF from "jspdf"
import "jspdf-autotable"
import type { ActivityData } from "./types"

// Extender el tipo jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

const categories = [
  { id: "salud", name: "Salud", color: "#ef4444" },
  { id: "finanzas", name: "Finanzas", color: "#22c55e" },
  { id: "viajes", name: "Viajes", color: "#3b82f6" },
  { id: "ocio", name: "Ocio", color: "#a855f7" },
  { id: "familia", name: "Familia", color: "#f97316" },
]

export class PDFReportGenerator {
  private getCategoryInfo(categoryId: string) {
    return categories.find((cat) => cat.id === categoryId) || categories[0]
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  generateCategoryReport(categoryId: string, activities: ActivityData[]): void {
    const categoryInfo = this.getCategoryInfo(categoryId)
    const categoryActivities = activities.filter((activity) => activity.category === categoryId)

    if (categoryActivities.length === 0) {
      alert("No hay actividades en esta categoría para generar el reporte")
      return
    }

    const doc = new jsPDF()

    // Configurar fuente
    doc.setFont("helvetica")

    // Header del reporte
    this.addHeader(doc, categoryInfo)

    // Resumen estadístico
    this.addSummary(doc, categoryActivities)

    // Tabla de actividades
    this.addActivitiesTable(doc, categoryActivities)

    // Footer
    this.addFooter(doc)

    // Descargar el PDF
    const fileName = `reporte-${categoryInfo.name.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  generateCompleteReport(activities: ActivityData[]): void {
    if (activities.length === 0) {
      alert("No hay actividades para generar el reporte")
      return
    }

    const doc = new jsPDF()
    doc.setFont("helvetica")

    // Header del reporte completo
    this.addCompleteHeader(doc)

    // Resumen general
    this.addGeneralSummary(doc, activities)

    // Resumen por categorías
    this.addCategorySummary(doc, activities)

    // Nueva página para actividades detalladas
    doc.addPage()

    // Tabla de todas las actividades
    this.addCompleteActivitiesTable(doc, activities)

    // Footer
    this.addFooter(doc)

    // Descargar el PDF
    const fileName = `reporte-completo-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  private addHeader(doc: jsPDF, categoryInfo: any): void {
    // Título principal
    doc.setFontSize(24)
    doc.setTextColor(40, 40, 40)
    doc.text("NUESTRA AGENDA", 105, 25, { align: "center" })

    // Subtítulo de categoría
    doc.setFontSize(18)
    doc.setTextColor(categoryInfo.color)
    doc.text(`Reporte de ${categoryInfo.name}`, 105, 40, { align: "center" })

    // Fecha del reporte
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generado el: ${this.formatDate(new Date().toISOString())}`, 105, 50, { align: "center" })

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 60, 190, 60)
  }

  private addCompleteHeader(doc: jsPDF): void {
    // Título principal
    doc.setFontSize(24)
    doc.setTextColor(40, 40, 40)
    doc.text("NUESTRA AGENDA", 105, 25, { align: "center" })

    // Subtítulo
    doc.setFontSize(18)
    doc.setTextColor(59, 130, 246) // Azul
    doc.text("Reporte Completo de Actividades", 105, 40, { align: "center" })

    // Fecha del reporte
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generado el: ${this.formatDate(new Date().toISOString())}`, 105, 50, { align: "center" })

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 60, 190, 60)
  }

  private addSummary(doc: jsPDF, activities: ActivityData[]): void {
    const totalActivities = activities.length
    const paidActivities = activities.filter((a) => a.is_paid).length
    const pendingActivities = totalActivities - paidActivities
    const totalAmount = activities.reduce((sum, a) => sum + a.amount, 0)
    const paidAmount = activities.filter((a) => a.is_paid).reduce((sum, a) => sum + a.amount, 0)
    const pendingAmount = totalAmount - paidAmount

    let yPosition = 75

    // Título de resumen
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Resumen Estadístico", 20, yPosition)
    yPosition += 15

    // Crear tabla de resumen
    const summaryData = [
      ["Total de Actividades", totalActivities.toString()],
      ["Actividades Pagadas", paidActivities.toString()],
      ["Actividades Pendientes", pendingActivities.toString()],
      ["Monto Total", this.formatCurrency(totalAmount)],
      ["Monto Pagado", this.formatCurrency(paidAmount)],
      ["Monto Pendiente", this.formatCurrency(pendingAmount)],
    ]

    doc.autoTable({
      startY: yPosition,
      head: [["Concepto", "Valor"]],
      body: summaryData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 60, halign: "center" },
      },
      margin: { left: 20, right: 20 },
    })
  }

  private addGeneralSummary(doc: jsPDF, activities: ActivityData[]): void {
    const totalActivities = activities.length
    const paidActivities = activities.filter((a) => a.is_paid).length
    const totalAmount = activities.reduce((sum, a) => sum + a.amount, 0)
    const paidAmount = activities.filter((a) => a.is_paid).reduce((sum, a) => sum + a.amount, 0)

    let yPosition = 75

    // Título de resumen
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Resumen General", 20, yPosition)
    yPosition += 15

    const summaryData = [
      ["Total de Actividades", totalActivities.toString()],
      ["Actividades Pagadas", paidActivities.toString()],
      ["Actividades Pendientes", (totalActivities - paidActivities).toString()],
      ["Monto Total", this.formatCurrency(totalAmount)],
      ["Monto Pagado", this.formatCurrency(paidAmount)],
      ["Monto Pendiente", this.formatCurrency(totalAmount - paidAmount)],
    ]

    doc.autoTable({
      startY: yPosition,
      head: [["Concepto", "Valor"]],
      body: summaryData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 60, halign: "center" },
      },
      margin: { left: 20, right: 20 },
    })
  }

  private addCategorySummary(doc: jsPDF, activities: ActivityData[]): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20

    // Título
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Resumen por Categorías", 20, yPosition)
    yPosition += 15

    const categoryData = categories.map((category) => {
      const categoryActivities = activities.filter((a) => a.category === category.id)
      const totalAmount = categoryActivities.reduce((sum, a) => sum + a.amount, 0)
      const paidAmount = categoryActivities.filter((a) => a.is_paid).reduce((sum, a) => sum + a.amount, 0)

      return [
        category.name,
        categoryActivities.length.toString(),
        this.formatCurrency(totalAmount),
        this.formatCurrency(paidAmount),
      ]
    })

    doc.autoTable({
      startY: yPosition,
      head: [["Categoría", "Actividades", "Total", "Pagado"]],
      body: categoryData,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    })
  }

  private addActivitiesTable(doc: jsPDF, activities: ActivityData[]): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20

    // Título de la tabla
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Detalle de Actividades", 20, yPosition)
    yPosition += 15

    // Preparar datos para la tabla
    const tableData = activities.map((activity) => [
      this.formatDate(activity.date),
      activity.name,
      activity.description || "-",
      this.formatCurrency(activity.amount),
      activity.is_paid ? "Sí" : "No",
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Fecha", "Actividad", "Descripción", "Monto", "Pagado"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })
  }

  private addCompleteActivitiesTable(doc: jsPDF, activities: ActivityData[]): void {
    // Título de la tabla
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Todas las Actividades", 20, 30)

    // Preparar datos para la tabla
    const tableData = activities.map((activity) => {
      const categoryInfo = this.getCategoryInfo(activity.category)
      return [
        this.formatDate(activity.date),
        activity.name,
        categoryInfo.name,
        this.formatCurrency(activity.amount),
        activity.is_paid ? "Sí" : "No",
      ]
    })

    doc.autoTable({
      startY: 45,
      head: [["Fecha", "Actividad", "Categoría", "Monto", "Pagado"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 25, halign: "center" },
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })
  }

  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages()
    const pageHeight = doc.internal.pageSize.height

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(20, pageHeight - 20, 190, pageHeight - 20)

      // Texto del footer
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text("Generado por Nuestra Agenda", 20, pageHeight - 10)
      doc.text(`Página ${i} de ${pageCount}`, 190, pageHeight - 10, { align: "right" })
    }
  }
}

export const pdfGenerator = new PDFReportGenerator()
