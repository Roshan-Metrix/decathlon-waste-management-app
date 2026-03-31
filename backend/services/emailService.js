import transporter from "../config/nodemailer.js";
import { DAILY_REPORT_EMAIL_TEMPLATE } from "../config/emailTemplates.js";

const EMAIL_SEND_TIMEOUT_MS = 30000;

const fillTemplate = (template, replacements) => {
  let output = template;

  for (const [key, value] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${key}}}`, String(value));
  }

  return output;
};

/**
 * Generate HTML email content with material table
 * @param {Object} reportData - Transaction report data
 * @returns {string} HTML formatted email content
 */
const generateEmailHTML = (reportData) => {
  // Generate material table HTML
  let materialTableHTML = `
    <table class="data-table" width="100%" cellspacing="0" cellpadding="0" border="0">
      <thead>
        <tr>
          <th>Material Type</th>
          <th>Total Items</th>
          <th>Weight (kg)</th>
          <th>Rate (₹/kg)</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
  `;

  reportData.items.forEach((item) => {
    materialTableHTML += `
      <tr>
        <td>${item.materialType}</td>
        <td>${item.totalItems}</td>
        <td>${item.weight.toFixed(2)}</td>
        <td>${item.rate.toFixed(2)}</td>
        <td>${item.totalAmount.toFixed(2)}</td>
      </tr>
    `;
  });

  materialTableHTML += `
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="1">TOTAL</td>
          <td>${reportData.totalItems}</td>
          <td>${reportData.totalWeight.toFixed(2)}</td>
          <td>-</td>
          <td>${reportData.totalAmount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  // Replace placeholders in email template
  let emailHTML = fillTemplate(DAILY_REPORT_EMAIL_TEMPLATE, {
    reportDate: reportData.reportDate,
    vendorName: reportData.vendorName,
    storeName: reportData.storeName,
    storeLocation: reportData.storeLocation,
    totalTransactions: reportData.totalTransactions,
    materialTable: materialTableHTML,
    totalItems: reportData.totalItems,
    totalWeight: reportData.totalWeight.toFixed(2),
    totalAmount: reportData.totalAmount.toFixed(2),
  });

  return emailHTML;
};

/**
 * Send daily transaction report email with PDF attachment
 * @param {string} vendorEmail - Email address of vendor
 * @param {string} vendorName - Name of vendor
 * @param {Object} reportData - Transaction report data
 * @param {string} pdfFilePath - Path to PDF file attachment
 * @returns {Promise<Object>} Email sending result
 */
export const sendDailyReportEmail = async (
  vendorEmail,
  vendorName,
  reportData,
  pdfFilePath
) => {
  try {
    // Generate email HTML content
    const emailHTML = generateEmailHTML(reportData);

    // Prepare mail options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: vendorEmail,
      subject: `Daily Transaction Report - ${reportData.storeName} - ${reportData.reportDate}`,
      html: emailHTML,
      attachments: [
        {
          filename: `daily-report-${reportData.storeId}-${reportData.reportDate}.pdf`,
          path: pdfFilePath,
          contentType: "application/pdf",
        },
      ],
    };

    console.log(
      `Attempting daily report email to ${vendorEmail} for store ${reportData.storeName}`
    );

    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Email sending timed out after ${EMAIL_SEND_TIMEOUT_MS / 1000} seconds`
              )
            ),
          EMAIL_SEND_TIMEOUT_MS
        )
      ),
    ]);

    console.log(
      `Daily report email sent to ${vendorEmail} for store ${reportData.storeName}`
    );

    return {
      success: true,
      message: "Email sent successfully",
      response: result.response,
    };
  } catch (error) {
    console.error("Error in sendDailyReportEmail:", error);
    throw new Error(error.message || "Failed to send daily report email");
  }
};

/**
 * Send multiple emails to different vendors/stores
 * @param {Array} emailList - Array of email configurations
 * @returns {Promise<Object>} Results of all email sending attempts
 */
export const sendBulkDailyReports = async (emailList) => {
  const results = {
    success: [],
    failed: [],
  };

  for (const emailConfig of emailList) {
    try {
      const result = await sendDailyReportEmail(
        emailConfig.vendorEmail,
        emailConfig.vendorName,
        emailConfig.reportData,
        emailConfig.pdfFilePath
      );

      results.success.push({
        vendor: emailConfig.vendorName,
        store: emailConfig.reportData.storeName,
        email: emailConfig.vendorEmail,
      });
    } catch (error) {
      console.error(
        `Failed to send email to ${emailConfig.vendorEmail}:`,
        error.message
      );

      results.failed.push({
        vendor: emailConfig.vendorName,
        store: emailConfig.reportData.storeName,
        email: emailConfig.vendorEmail,
        error: error.message,
      });
    }
  }

  return results;
};
