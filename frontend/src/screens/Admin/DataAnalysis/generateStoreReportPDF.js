import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import api from "../../../api/api";

export const exportStoreReportPDF = async (storeId, fromDate, toDate) => {
  try {
    const { data } = await api.get(
      `/transaction/get-store-filter-transactions/${storeId}/${fromDate}/${toDate}`
    );

    if (!data?.success || !Array.isArray(data?.items)) {
      alert("No data found");
      return;
    }

    const items = data.items;

    const grandTotalWeight = items.reduce(
      (sum, item) => sum + Number(item.weight || 0),
      0
    );

    const grandTotalAmount = items.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );

    const rows = items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.materialType || "-"}</td>
          <td style="text-align:center">${item.totalItems || 0}</td>
          <td style="text-align:center">${Number(item.weight || 0).toFixed(
            2
          )}</td>
          <td style="text-align:center">${Number(item.rate || 0).toFixed(
            2
          )}</td>
          <td style="text-align:right">${Number(item.totalAmount || 0).toFixed(
            2
          )}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
          }

          .header {
            text-align:center;
            margin-bottom:20px;
            border-bottom:2px solid #ccc;
            padding-bottom:10px;
          }

          .store {
            font-size:20px;
            font-weight:bold;
            color:#1e40af;
          }

          .info {
            font-size:12px;
            margin-top:4px;
          }

          table {
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }

          th, td {
            border:1px solid #ddd;
            padding:6px;
            font-size:11px;
          }

          th {
            background:#eef2ff;
            color:#1e40af;
          }

          .total-row {
            font-weight:bold;
            background:#f1f5f9;
          }
        </style>
      </head>

      <body>

        <div class="header">
          <div class="store">${data.storeName}</div>
          <div class="info">${data.storeLocation}</div>
          <div class="info">Vendor: ${data.vendorName}</div>
          <div class="info">Date: ${fromDate} to ${toDate}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Material</th>
              <th>Items</th>
              <th>Weight (kg)</th>
              <th>Rate (Rs.)</th>
              <th>Amount (Rs.)</th>
            </tr>
          </thead>

          <tbody>

            ${rows}

            <tr class="total-row">
              <td colspan="3" style="text-align:right">
                Grand Total : 
              </td>

              <td style="text-align:center">
                ${grandTotalWeight.toFixed(2)} kg
              </td>

              <td></td>

              <td style="text-align:right">
                Rs. ${grandTotalAmount.toFixed(2)}
              </td>
            </tr>

          </tbody>
        </table>

      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    const fileUri =
      FileSystem.documentDirectory +
      `${data.storeName.replace(/\s/g, "_")}_${fromDate}_${toDate}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });

    if (await Sharing.isAvailableAsync()) {
      await Print.printAsync({ uri: fileUri });
    } else {
      await Sharing.shareAsync(fileUri);
    }
  } catch (error) {
    console.log("PDF export error:", error);
    alert("Failed to export PDF");
  }
};