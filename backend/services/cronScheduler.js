import cron from "node-cron";
import {
  fetchTransactionsByDateRange,
  fetchAllStoresForVendor,
  fetchAllVendors,
} from "./transactionService.js";
import { generatePDF, deletePDF } from "./pdfService.js";
import { sendDailyReportEmail } from "./emailService.js";
import { getReportRecipientsByState } from "../config/reportRecipientsByState.js";

/**
 * Get current date in IST timezone as string format (YYYY-MM-DD)
 * @returns {string} Current date in IST
 */
const getCurrentDateInIST = () => {
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-CA", options);
  return formatter.format(new Date());
};

/**
 * Get date range for report (00:00 to 23:59 in IST)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Object} Object with fromDate and toDate
 */
const getDateRange = (dateStr) => {
  // Create date in IST
  const [year, month, day] = dateStr.split("-");

  // Create date at 00:00:00 IST
  const fromDate = new Date(`${year}-${month}-${day}T00:00:00+05:30`);

  // Create date at 23:59:59 IST
  const toDate = new Date(`${year}-${month}-${day}T23:59:59+05:30`);

  return { fromDate, toDate };
};

/**
 * Generate and send daily reports for all vendors and their stores
 * Main function called by cron job
 */
export const generateAndSendDailyReports = async () => {
  const startTime = new Date();
  console.log("\n===== Daily Report Generation Started =====");
  console.log(`Time: ${startTime.toISOString()}`);

  try {
    const reportDate = getCurrentDateInIST();
    const { fromDate, toDate } = getDateRange(reportDate);

    console.log(`Processing reports for date: ${reportDate}`);
    console.log(`Date range: ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    // Fetch all vendors
    const vendors = await fetchAllVendors();
    console.log(`Found ${vendors.length} vendors`);

    if (vendors.length === 0) {
      console.log("No vendors found. Exiting.");
      return;
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    const failedReports = [];

    // Process each vendor
    for (const vendorName of vendors) {
      try {
        console.log(`\nProcessing vendor: ${vendorName}`);

        // Fetch all stores for this vendor
        const stores = await fetchAllStoresForVendor(vendorName);
        console.log(`  Found ${stores.length} stores for vendor`);

        // Process each store
        for (const store of stores) {
          try {
            console.log(`  Processing store: ${store.storeName}`);

            // Fetch transactions for the store
            const reportData = await fetchTransactionsByDateRange(
              store.storeId,
              fromDate,
              toDate,
              vendorName
            );

            // If no transactions, skip
            if (reportData.items.length === 0) {
              console.log(`    No transactions found for ${store.storeName}. Skipping.`);
              continue;
            }

            // Add additional data to report
            reportData.reportDate = reportDate;
            reportData.storeId = store.storeId;

            const recipientEmails = getReportRecipientsByState(
              reportData.storeState || store.storeState
            );

            if (recipientEmails.length === 0) {
              throw new Error(
                `No report recipient emails configured for state "${reportData.storeState || store.storeState}"`
              );
            }

            // Generate PDF
            const pdfFileName = `daily-report-${store.storeId}-${reportDate}.pdf`;
            console.log(`    Generating PDF: ${pdfFileName}`);

            const pdfFilePath = await generatePDF(reportData, pdfFileName);
            console.log(`    PDF generated successfully`);

            // Send email with PDF attachment
            console.log(`    Sending email to ${recipientEmails.join(", ")}`);

            await sendDailyReportEmail(
              recipientEmails,
              reportData.storeState || store.storeState,
              reportData,
              pdfFilePath
            );

            console.log(`    Email sent successfully`);
            emailsSent++;

            // Delete PDF file after sending
            deletePDF(pdfFilePath);
            console.log(`    PDF file deleted`);
          } catch (storeError) {
            console.error(`    Error processing store ${store.storeName}:`, storeError.message);
            emailsFailed++;
            failedReports.push({
              vendor: vendorName,
              store: store.storeName,
              error: storeError.message,
            });
          }
        }
      } catch (vendorError) {
        console.error(`Error processing vendor ${vendorName}:`, vendorError.message);
        emailsFailed++;
        failedReports.push({
          vendor: vendorName,
          error: vendorError.message,
        });
      }
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log("\n===== Daily Report Generation Completed =====");
    console.log(`Total Time: ${duration.toFixed(2)} seconds`);
    console.log(`Emails Sent: ${emailsSent}`);
    console.log(`Emails Failed: ${emailsFailed}`);

    if (failedReports.length > 0) {
      console.log("\nFailed Reports:");
      console.log(JSON.stringify(failedReports, null, 2));
    }

    return {
      success: true,
      emailsSent,
      emailsFailed,
      failedReports,
      duration: duration.toFixed(2),
    };
  } catch (error) {
    console.error("Fatal error in generateAndSendDailyReports:", error);
    console.error("===== Daily Report Generation Failed =====\n");

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Initialize cron job for daily report generation
 * Runs every day at 8 PM IST (20:00)
 * Format: minute hour day month day-of-week
 * 0 20 * * * = 8 PM every day
 */
export const initializeCronScheduler = () => {
  try {
    console.log("Initializing Daily Report Cron Scheduler...");

    // Schedule job - runs every day at 8 PM IST
    const task = cron.schedule(
      "0 20 * * *",
      async () => {
        console.log("\n[CRON] Cron job triggered at:", new Date().toISOString());
        await generateAndSendDailyReports();
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    console.log("✓ Daily Report Cron Scheduler initialized successfully");
    console.log("✓ Schedule: Every day at 8:00 PM IST (Asia/Kolkata timezone)");

    return task;
  } catch (error) {
    console.error("Error initializing cron scheduler:", error);
    throw error;
  }
};

/**
 * Stop the cron job
 * @param {Object} task - Cron task object returned from initializeCronScheduler
 */
export const stopCronScheduler = (task) => {
  try {
    if (task) {
      task.stop();
      console.log("Cron scheduler stopped");
    }
  } catch (error) {
    console.error("Error stopping cron scheduler:", error);
  }
};
