import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCLP, formatDateTime } from "@/lib/utils"

interface ReceiptProduct {
  product: { code: string; name: string }
  quantity: number
  price: number
  subtotal: number
}

interface ReceiptSale {
  number: number
  createdAt: Date | string
  total: number
  client: { name: string; rut: string | null } | null
  user: { name: string }
  details: ReceiptProduct[]
}

export function generateReceipt(sale: ReceiptSale): void {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14

  // Logo / Header
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("LUBRITOTAL CUVERTINO", pageWidth / 2, 22, { align: "center" })

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Yungay 70, Lanco", pageWidth / 2, 29, { align: "center" })
  doc.text("Fono: +56 9 XXXX XXXX", pageWidth / 2, 35, { align: "center" })

  // Separator
  doc.setDrawColor(200)
  doc.line(margin, 40, pageWidth - margin, 40)

  // Title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("COMPROBANTE DE VENTA", pageWidth / 2, 50, { align: "center" })

  // Sale info
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  let y = 60
  doc.text(`N° Venta: ${sale.number}`, margin, y)
  y += 6
  doc.text(`Fecha: ${formatDateTime(sale.createdAt)}`, margin, y)
  y += 6
  doc.text(`Vendedor: ${sale.user.name}`, margin, y)
  y += 6

  if (sale.client) {
    doc.text(`Cliente: ${sale.client.name}`, margin, y)
    y += 6
    if (sale.client.rut) {
      doc.text(`RUT: ${sale.client.rut}`, margin, y)
      y += 6
    }
  }

  // Products table
  const tableBody = sale.details.map((d) => [
    d.product.code,
    d.product.name,
    d.quantity.toString(),
    formatCLP(Number(d.price)),
    formatCLP(Number(d.subtotal)),
  ])

  autoTable(doc, {
    startY: y + 4,
    head: [["Código", "Producto", "Cantidad", "Precio", "Subtotal"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 60 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  })

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 8
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`Total: ${formatCLP(Number(sale.total))}`, pageWidth - margin, finalY, { align: "right" })

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(200)
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Gracias por su compra", pageWidth / 2, footerY + 4, { align: "center" })

  doc.autoPrint()
  window.open(doc.output("bloburl"))
}

