import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Alert from "../../Components/Alert";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

// Converts ISO string to IST formatted date and time for file content.
const formatISTDateTime = (isoString) => {
  try {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const time = dateObj.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch (e) {
    return { date: "N/A", time: "N/A" };
  }
};

const generateCSV = (data) => {
  if (!data) {
    return {
      data: "",
      fileName: "Export.csv",
      mimeType: "text/csv",
    };
  }

  // Helper to safely escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  let csvString = "";

  // Detailed Items Section
  csvString += "Detailed Transaction Items\n";

  const detailHeaders = [
    "SN",
    "Transaction ID",
    "Store Name",
    "Vendor",
    "Material Type",
    "Weight (kg)",
    "Weight Source",
    "Date (IST)",
    "Time (IST)",
  ];

  csvString += detailHeaders.join(",") + "\n";

  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach((item, index) => {
      const { date, time } = formatISTDateTime(item?.createdAt);

      const row = [
        escapeCSV(item?.sn ?? index + 1),
        escapeCSV(data?.transactionId),
        escapeCSV(data?.storeName),
        escapeCSV(data?.vendorName),
        escapeCSV(item?.materialType),
        escapeCSV(parseFloat(item?.weight) || 0),
        escapeCSV(item?.weightSource === "system" ? "System" : "Manual"),
        escapeCSV(date),
        escapeCSV(time),
      ];

      csvString += row.join(",") + "\n";
    });
  }

  // Material Summary Section

  csvString += "\nMaterial Type Summary\n";

  const summaryHeaders = [
    "No.",
    "Material Type",
    "Item Count",
    "Total Weight (kg)",
    "Rate (Rs/kg)",
    "Total Amount (Rs)",
  ];

  csvString += summaryHeaders.join(",") + "\n";

  if (Array.isArray(data.itemSummary) && data.itemSummary.length > 0) {
    data.itemSummary.forEach((summary, index) => {
      const weight = parseFloat(summary?.totalWeight) || 0;
      const rate = parseFloat(summary?.rate) || 0;
      const totalAmount = weight * rate;

      const summaryRow = [
        escapeCSV(index + 1),
        escapeCSV(summary?.materialType),
        escapeCSV(summary?.itemCount || 0),
        escapeCSV(weight),
        escapeCSV(rate),
        escapeCSV(totalAmount.toFixed(2)),
      ];

      csvString += summaryRow.join(",") + "\n";
    });
  }

  csvString += "\n";
  csvString +=
    "Grand Total Weight (kg)," +
    escapeCSV(parseFloat(data?.grandTotalWeight) || 0) +
    "\n";

  const grandTotalAmount = Array.isArray(data.itemSummary)
    ? data.itemSummary.reduce((total, summary) => {
        const weight = parseFloat(summary?.totalWeight) || 0;
        const rate = parseFloat(summary?.rate) || 0;
        return total + weight * rate;
      }, 0)
    : 0;

  csvString +=
    "Grand Total Amount (Rs)," + escapeCSV(grandTotalAmount.toFixed(2)) + "\n";

  const safeTransactionId = String(data?.transactionId || "Transaction")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  return {
    data: csvString,
    fileName: `${safeTransactionId}_Data.csv`,
    mimeType: "text/csv",
  };
};

const generatePDF = (data) => {
  // Calculate Grand Total Amount
  const grandTotalAmount = data.itemSummary.reduce((total, summary) => {
    const rate = summary.rate || 0;
    const weight = parseFloat(summary.totalWeight) || 0;
    return total + weight * rate;
  }, 0);

  // Updated Material Summary HTML
  const summaryHtml =
    data.itemSummary.length > 0
      ? `
        <h3 style="font-size: 14px; margin-top: 25px; margin-bottom: 10px; color: #1e40af;">
            Material Type Summary
        </h3>
        <div style="border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
            ${data.itemSummary
              .map((summary, index) => {
                const rate = summary.rate || 0;
                const weight = parseFloat(summary.totalWeight) || 0;
                const totalAmount = weight * rate;

                return `
                  <div style="font-size: 12px; margin-bottom: 8px; line-height: 16px;">
                      <span style="font-weight: bold; margin-right: 5px;">
                        ${index + 1}. ${summary.materialType}:
                      </span>
                      <span style="color: #333;">
                        ${summary.itemCount} item${
                          summary.itemCount !== 1 ? "s" : ""
                        }
                      </span>
                      <span style="font-weight: bold; color: #b91c1c;">
                        (Weight: ${summary.totalWeight} kg)
                      </span>
                      <br/>
                      <span>Rate: Rs. ${rate}/kg</span>
                      <br/>
                      <span style="font-weight:bold;">
                        Amount: Rs. ${totalAmount.toFixed(2)}
                      </span>
                  </div>
                `;
              })
              .join("")}
              
              <p style="font-style: italic; color: #6b7280;font-size: 11px;">
              Calibration Error: ${data.calibrationError}
              </p>
              <div style="margin-top:10px; font-weight:bold; font-size:13px; color:#1e40af;">
                Grand Total Amount: Rs. ${grandTotalAmount.toFixed(2)}
              </div>
        </div>
      `
      : "";

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 15px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
          .store { font-size: 20px; font-weight: bold; color: #1e40af; }
          .info { font-size: 12px; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 10px; }
          th { background-color: #eef2ff; color: #1e40af; }
          .total-row { background-color: #e0f2fe; font-weight: bold; font-size: 12px; }
          .signature-area { width: 100%; margin-top: 40px; position: relative; right: 0; }
          .signature-box { text-align: center; width: 40%; }
          .sig-placeholder { height: 60px; border-bottom: 1px solid #aaa; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store">${data.storeName}</div>
          <div class="info">${data.storeLocation}</div>
          <div class="info">
            Transaction ID: ${data.transactionId} | Vendor: ${data.vendorName}
          </div>
        </div>
        
        <h3 style="font-size: 14px; margin-top: 20px; margin-bottom: 10px;">
          Detailed Transaction Items
        </h3>
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Material</th>
              <th style="text-align:center;">Weight (kg)</th>
              <th>Time & Source</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map((item) => {
                const { date, time } = formatISTDateTime(item.createdAt);
                const source =
                  item.weightSource === "system" ? "System" : "Manually";

                return `
                  <tr>
                    <td>${item.sn}</td>
                    <td>${item.materialType}</td>
                    <td style="text-align:center;">${item.weight}</td>
                    <td>
                      Date: ${date}<br/>
                      Time: ${time} (${source})
                    </td>
                  </tr>
                `;
              })
              .join("")}

            <tr class="total-row">
              <td colspan="2" style="text-align:right; padding-right:10px;">
                Grand Total Weight:
              </td>
              <td style="text-align:center;">
                ${data.grandTotalWeight}
              </td>
              <td></td>
            </tr>

            <tr class="total-row">
              <td colspan="2" style="text-align:right; padding-right:10px;">
                Grand Total Amount:
              </td>
              <td style="text-align:center;">
                Rs. ${grandTotalAmount.toFixed(2)}
              </td>
              <td></td>
            </tr>

          </tbody>
        </table>

        ${summaryHtml}

        <div class="signature-area">
          <div class="signature-box">
            <div class="sig-placeholder">
              ${
                data.managerSignature
                  ? '<img src="' +
                    data.managerSignature +
                    '" style="height:100%; width:100%; object-fit:contain;">'
                  : ""
              }
            </div>
            <div style="font-weight: bold;">Manager Signature</div>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    data: htmlContent,
    fileName: `${data.transactionId}_Bill.pdf`,
    mimeType: "application/pdf",
  };
};

export default function ExportDataScreen({ navigation, route }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const transactionData = route.params?.transactionData;

  const [isExporting, setIsExporting] = useState(false);

  if (!transactionData) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.noDataText}>
          No transaction data found for export.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#2563eb", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const grandTotalAmount = transactionData.itemSummary.reduce(
    (total, summary) => {
      return total + (parseFloat(summary.totalAmount) || 0);
    },
    0,
  );

  const handleExport = async (type) => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      let result;

      if (type === "PDF") {
        result = generatePDF(transactionData);
      } else if (type === "CSV" || type === "Excel") {
        result = generateCSV(transactionData);
      } else {
        setAlertMessage("Invalid export type selected!");
        setAlertVisible(true);
        return;
      }

      if (type === "PDF") {
        await Print.printAsync({
          html: result.data,
        });
      } else {
        const fileUri = FileSystem.cacheDirectory + result.fileName;

        await FileSystem.writeAsStringAsync(fileUri, result.data, {
          encoding: "utf8",
        });

        if (!(await Sharing.isAvailableAsync())) {
          setAlertMessage("Sharing is not available on this device!");
          setAlertVisible(true);
          return;
        }

        await Sharing.shareAsync(fileUri, {
          mimeType: result.mimeType,
          dialogTitle: `Share or Save ${type} Data`,
        });

        Alert.alert(
          "Success",
          `${type} data ready. Please select a destination to save or share.`,
        );
      }
    } catch (error) {
      console.error(`Export ${type} error:`, error);
      Alert.alert(
        "Export Failed ",
        `An error occurred during ${type} export. Ensure you have file permissions and the device supports printing/sharing.`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const ExportOption = ({
    type,
    title,
    desc,
    iconName,
    iconColor,
    borderColor,
  }) => (
    <TouchableOpacity
      style={[styles.exportBox, { borderLeftColor: borderColor }]}
      onPress={() => handleExport(type)}
      disabled={isExporting}
    >
      {isExporting ? (
        <View style={styles.iconContainer}>
          <ActivityIndicator size="small" color={iconColor} />
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <MaterialIcons name={iconName} size={34} color={iconColor} />
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.exportTitle}>{title}</Text>
        <Text style={styles.exportDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("UserScreen")}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Data</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Transaction Details (ID: {transactionData.transactionId})
        </Text>

        {/* Display Grouped Summary */}
        <View style={styles.summaryDisplayBox}>
          <Text style={styles.summaryTitle}>Material Totals:</Text>
          {transactionData.itemSummary.map((summary, index) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryNo}>{index + 1}.</Text>
              <Text style={styles.summaryMaterial}>
                {summary.materialType}:
              </Text>
              <Text style={styles.summaryWeight}>
                {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""} (
                {summary.totalWeight} kg)
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalText}>Grand Total Weight:</Text>
            <Text style={styles.summaryTotalValue}>
              {transactionData.grandTotalWeight} kg
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose Export Format</Text>

        <ExportOption
          type="PDF"
          title="Export as PDF"
          desc="Generate a well-formatted PDF report (visual bill) for printing or archival."
          iconName="picture-as-pdf"
          iconColor="#dc2626"
          borderColor="#dc2626"
        />
        <ExportOption
          type="CSV"
          title="Export as CSV"
          desc="Save raw data in comma-separated format. Best for spreadsheets and databases."
          iconName="table-view"
          iconColor="#22c55e"
          borderColor="#22c55e"
        />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            File generation uses client-side processing. You will need to
            confirm the save location or share the file using your device's
            native controls.
          </Text>
        </View>
      </ScrollView>
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

//  STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noDataText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 25,
    marginBottom: 15,
  },
  // --- New Summary Styles ---
  summaryDisplayBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  summaryNo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginRight: 5,
  },
  summaryMaterial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  summaryWeight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b91c1c",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#1e40af",
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e40af",
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#dc2626",
  },
  // --- End New Summary Styles ---
  exportBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  exportDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 19,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
