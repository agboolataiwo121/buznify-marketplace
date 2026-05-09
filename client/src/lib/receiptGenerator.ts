import jsPDF from "jspdf";

export interface ReceiptData {
  orderId: number;
  orderDate: Date | string;
  deliveredAt?: Date | string | null;
  status: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  discountAmount: string;
  notes?: string | null;
  product: {
    id: number;
    title: string;
    category: string;
    platform?: string | null;
  } | null;
  buyer: {
    name: string;
    email: string;
  };
}

export function generateReceiptPdf(data: ReceiptData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(15, 15, 30);
  doc.rect(0, 0, pageW, 40, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("BUZNIFY", margin, 18);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 180);
  doc.text("Digital Marketplace — Purchase Receipt", margin, 26);

  // Receipt label (right-aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(130, 100, 255);
  doc.text("RECEIPT", pageW - margin, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 220);
  doc.text(`#${String(data.orderId).padStart(6, "0")}`, pageW - margin, 26, { align: "right" });

  y = 52;

  // ── Order meta ────────────────────────────────────────────────────────────
  const orderDate = new Date(data.orderDate).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const deliveredDate = data.deliveredAt
    ? new Date(data.deliveredAt).toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  const metaRows: [string, string][] = [
    ["Order Date", orderDate],
    ["Delivered", deliveredDate],
    ["Status", data.status.charAt(0).toUpperCase() + data.status.slice(1)],
    ["Buyer", data.buyer.name],
    ["Email", data.buyer.email || "—"],
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 60);
  doc.text("ORDER DETAILS", margin, y);
  y += 6;

  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  for (const [label, value] of metaRows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 120);
    doc.text(label + ":", margin, y);
    doc.setTextColor(30, 30, 50);
    doc.text(value, margin + 40, y);
    y += 7;
  }

  y += 4;

  // ── Product table ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 60);
  doc.text("ITEMS", margin, y);
  y += 6;

  // Table header
  doc.setFillColor(240, 240, 250);
  doc.rect(margin, y - 4, contentW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 80);
  doc.text("Description", margin + 2, y + 0.5);
  doc.text("Qty", margin + contentW * 0.65, y + 0.5);
  doc.text("Unit Price", margin + contentW * 0.75, y + 0.5);
  doc.text("Total", margin + contentW * 0.88, y + 0.5);
  y += 10;

  // Table row
  const productTitle = data.product?.title ?? "Digital Product";
  const platform = data.product?.platform ? ` (${data.product.platform})` : "";
  const category = data.product?.category
    ? data.product.category.replace(/_/g, " ").replace(/\w/g, (c) => c.toUpperCase())
    : "";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 50);
  doc.text(productTitle + platform, margin + 2, y);
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 140);
  doc.text(category, margin + 2, y + 5);

  doc.setFontSize(9);
  doc.setTextColor(30, 30, 50);
  doc.text(String(data.quantity), margin + contentW * 0.65, y);
  doc.text(`$${parseFloat(data.unitPrice).toFixed(2)}`, margin + contentW * 0.75, y);
  doc.text(`$${parseFloat(data.unitPrice).toFixed(2)}`, margin + contentW * 0.88, y);
  y += 14;

  doc.setDrawColor(200, 200, 220);
  doc.line(margin, y - 2, pageW - margin, y - 2);
  y += 4;

  // ── Totals ────────────────────────────────────────────────────────────────
  const discount = parseFloat(data.discountAmount ?? "0");
  const total = parseFloat(data.totalAmount);

  const totalsX = margin + contentW * 0.6;
  const valX = pageW - margin;

  const totalsRows: [string, string, boolean][] = [
    ["Subtotal", `$${(total + discount).toFixed(2)}`, false],
    ...(discount > 0 ? [["Discount", `-$${discount.toFixed(2)}`, false] as [string, string, boolean]] : []),
    ["Total Paid", `$${total.toFixed(2)}`, true],
  ];

  for (const [label, value, isBold] of totalsRows) {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 11 : 9);
    doc.setTextColor(isBold ? 30 : 100, isBold ? 30 : 100, isBold ? 50 : 120);
    doc.text(label, totalsX, y);
    doc.setTextColor(isBold ? 80 : 30, isBold ? 40 : 30, isBold ? 200 : 50);
    doc.text(value, valX, y, { align: "right" });
    y += isBold ? 8 : 7;
  }

  y += 10;

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 60);
    doc.text("Notes:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 100);
    const noteLines = doc.splitTextToSize(data.notes, contentW);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5 + 6;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setFillColor(245, 245, 252);
  doc.rect(0, footerY - 4, pageW, 22, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 140);
  doc.text("Thank you for your purchase! For support, visit buznify-mktp-kunzevat.manus.space", pageW / 2, footerY + 4, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageW / 2, footerY + 10, { align: "center" });

  doc.save(`buznify-receipt-${String(data.orderId).padStart(6, "0")}.pdf`);
}
