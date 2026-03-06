import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CartItem } from "@/types/pos";

export function generateReceipt(items: CartItem[], total: number) {
  const doc = new jsPDF({ unit: "mm", format: [80, 200] });
  const w = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Tief POS", w / 2, 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("--- SALES RECEIPT ---", w / 2, 16, { align: "center" });
  doc.text(new Date().toLocaleString(), w / 2, 20, { align: "center" });

  const rows = items.map((item) => [
    item.product.name,
    String(item.quantity),
    `$${item.product.price.toFixed(2)}`,
    `$${(item.product.price * item.quantity).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 24,
    margin: { left: 3, right: 3 },
    head: [["Item", "Qty", "Price", "Total"]],
    body: rows,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`TOTAL: $${total.toFixed(2)}`, w / 2, finalY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Thank you for your purchase!", w / 2, finalY + 6, { align: "center" });

  doc.save(`receipt-${Date.now()}.pdf`);
}
