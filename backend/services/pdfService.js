import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF report for daily transactions
 * @param {Object} reportData - Transaction report data
 * @param {string} fileName - Output PDF file name
 * @returns {Promise<string>} Path to generated PDF file
 */
export const generatePDF = async (reportData, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filePath = path.join(tempDir, fileName);
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const stream = fs.createWriteStream(filePath);
      let settled = false;

      const resolveOnce = () => {
        if (!settled) {
          settled = true;
          resolve(filePath);
        }
      };

      const rejectOnce = (err) => {
        if (!settled) {
          settled = true;
          reject(err);
        }
      };

      doc.on("error", (err) => {
        console.error("PDF generation error:", err);
        rejectOnce(err);
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        rejectOnce(err);
      });

      // Resolve only after the PDF has been fully flushed to disk.
      stream.on("finish", resolveOnce);
      stream.on("close", resolveOnce);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text("Daily Transaction Report", {
        align: "center",
      });

      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text("Decathlon Waste Management System", {
        align: "center",
        color: "#666",
      });

      doc.moveDown(1);

      // Report Info
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Report Date: ${reportData.reportDate}`, { lineBreak: true });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Generated: ${new Date().toLocaleString("en-IN")}`, {
          lineBreak: true,
        });

      doc.moveDown(1);

      // Store Information
      doc.fontSize(12).font("Helvetica-Bold").text("Store Information", {
        underline: true,
      });

      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Store Name: ${reportData.storeName}`);
      doc.text(`Location: ${reportData.storeLocation}`);
      doc.text(`Vendor: ${reportData.vendorName}`);
      doc.text(`Total Transactions: ${reportData.totalTransactions}`);

      doc.moveDown(1);

      // Material Type Table
      doc.fontSize(12).font("Helvetica-Bold").text("Material Details", {
        underline: true,
      });

      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 250;
      const col4 = 350;
      const col5 = 450;

      doc.fontSize(9).font("Helvetica-Bold").fillColor("#2563eb");

      doc.text("Material Type", col1, tableTop);
      doc.text("Items", col2, tableTop);
      doc.text("Weight (kg)", col3, tableTop);
      doc.text("Rate (₹/kg)", col4, tableTop);
      doc.text("Amount (₹)", col5, tableTop);

      // Separator line
      doc.moveTo(col1 - 10, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.fillColor("#000");
      let currentY = tableTop + 25;

      // Table rows
      reportData.items.forEach((item) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;

          // Repeat header on new page
          doc.fontSize(9).font("Helvetica-Bold").fillColor("#2563eb");
          doc.text("Material Type", col1, currentY);
          doc.text("Items", col2, currentY);
          doc.text("Weight (kg)", col3, currentY);
          doc.text("Rate (₹/kg)", col4, currentY);
          doc.text("Amount (₹)", col5, currentY);
          doc.moveTo(col1 - 10, currentY + 15).lineTo(550, currentY + 15).stroke();
          currentY += 25;
          doc.fillColor("#000");
        }

        doc.fontSize(9).font("Helvetica");
        doc.text(item.materialType, col1, currentY);
        doc.text(item.totalItems.toString(), col2, currentY);
        doc.text(item.weight.toString(), col3, currentY);
        doc.text(item.rate.toString(), col4, currentY);
        doc.text(item.totalAmount.toString(), col5, currentY);

        currentY += 15;
      });

      // Total separator
      doc.moveTo(col1 - 10, currentY).lineTo(550, currentY).stroke();

      currentY += 10;

      // Total row
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#2563eb");
      doc.text("TOTAL", col1, currentY);
      doc.text(reportData.totalItems.toString(), col2, currentY);
      doc.text(reportData.totalWeight.toString(), col3, currentY);
      doc.text("-", col4, currentY);
      doc.text(reportData.totalAmount.toString(), col5, currentY);

      doc.moveDown(2);

      // Summary Box
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#000").text("Summary", {
        underline: true,
      });

      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");
      doc.fillColor("#000");

      const summaryData = [
        ["Total Items", reportData.totalItems.toString()],
        ["Total Weight", `${reportData.totalWeight} kg`],
        ["Total Amount", `₹ ${reportData.totalAmount.toFixed(2)}`],
      ];

      summaryData.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`);
        doc.moveDown(0.3);
      });

      doc.moveDown(1);

      // Footer Note
      doc.fontSize(9).fillColor("#666").text(
        "This is an automatically generated report. For any discrepancies, please contact the administrator.",
        {
          align: "center",
          italic: true,
        }
      );

      doc.fontSize(8).fillColor("#999").text(
        `© 2026 Decathlon Waste Management. All rights reserved.`,
        {
          align: "center",
        }
      );

      // Page numbers
      const pages = doc.bufferedPageRange().count;
      for (let i = 0; i < pages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#999").text(`Page ${i + 1} of ${pages}`, {
          align: "right",
          y: doc.page.height - 30,
        });
      }

      doc.end();
    } catch (error) {
      console.error("Error in generatePDF:", error);
      reject(error);
    }
  });
};

/**
 * Delete PDF file after sending email
 * @param {string} filePath - Path to PDF file to delete
 */
export const deletePDF = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`PDF deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting PDF at ${filePath}:`, error);
  }
};
