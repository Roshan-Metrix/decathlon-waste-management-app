# Daily Transaction Report Feature

This document provides comprehensive information about the automated daily transaction report generation and email delivery system.

## Overview

The feature automatically generates PDF reports of daily transactions for each store and emails them to respective vendors. Reports include:
- Material-wise transaction details
- Weight and amount summaries
- Professional PDF formatting
- Email notifications with PDF attachments

## Features

 **Automated Daily Reports** - Runs every day at 8 PM IST automatically
 **PDF Generation** - Professional, well-structured PDF reports using pdfkit
 **Email Integration** - Sends reports via configured email service
 **Multi-vendor/Store Support** - Handles multiple vendors and multiple stores per vendor
 **Error Handling** - Robust error handling with detailed logging
 **Timezone Support** - Uses Asia/Kolkata (IST) timezone
 **Clean Architecture** - Separated concerns: services, controllers, utilities
 **Manual Generation** - API endpoint for on-demand report generation

## Project Structure

```
backend/
├── config/
│   ├── emailTemplates.js (HTML email templates including DAILY_REPORT_EMAIL_TEMPLATE)
│   ├── mongodb.js
│   └── nodemailer.js
├── controllers/
│   └── vendorController.js (added generateDailyReportManual)
├── services/ (NEW)
│   ├── transactionService.js (Fetch transaction data)
│   ├── pdfService.js (PDF generation)
│   ├── emailService.js (Email sending)
│   └── cronScheduler.js (Cron job setup)
├── utils/
│   └── reportUtils.js (Helper utilities)
├── routes/
│   └── vendorRoutes.js (added daily report endpoint)
├── models/
│   └── transactionModel.js (existing)
├── server.js (updated to initialize cron)
└── temp/ (auto-created, stores temporary PDFs)
```

## Installation & Setup

### 1. Install Required Dependencies

```bash
npm install pdfkit node-cron
```

### 2. Verify Environment Configuration

Ensure your `.env` file contains:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SENDER_EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NODE_ENV=development
FRONTEND_URI=http://localhost:3000
```

### 3. Email Configuration (Gmail)

For Gmail SMTP:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use App Password as EMAIL_PASSWORD in .env

**Example .env for Gmail:**
```env
SENDER_EMAIL=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### 4. Start the Server

```bash
npm start
```

You should see in console:
```
✓ Daily Report Cron Scheduler initialized successfully
✓ Schedule: Every day at 8:00 PM IST (Asia/Kolkata timezone)
```

## File Descriptions

### transactionService.js
**Purpose:** Data fetching service for transaction data

**Functions:**
- `fetchTransactionsByDateRange(storeId, fromDate, toDate)` - Fetch transactions within date range
- `fetchAllStoresForVendor(vendorName)` - Get all stores for a vendor
- `fetchAllVendors()` - Get all unique vendors

### pdfService.js
**Purpose:** PDF report generation

**Functions:**
- `generatePDF(reportData, fileName)` - Generate PDF file
- `deletePDF(filePath)` - Delete temporary PDF file

**Output:** Professional PDF with:
- Header and metadata
- Store information
- Material-wise transaction details table
- Summary statistics
- Footer notes

### emailService.js
**Purpose:** Email delivery service

**Functions:**
- `sendDailyReportEmail(vendorEmail, vendorName, reportData, pdfFilePath)` - Send single email
- `sendBulkDailyReports(emailList)` - Send multiple emails

**Email Template:** Uses DAILY_REPORT_EMAIL_TEMPLATE from emailTemplates.js

### cronScheduler.js
**Purpose:** Automated scheduling service

**Functions:**
- `generateAndSendDailyReports()` - Main report generation function
- `initializeCronScheduler()` - Initialize cron job
- `stopCronScheduler(task)` - Stop cron job

**Schedule:** 
- Time: 8:00 PM daily
- Timezone: Asia/Kolkata (IST)
- Cron Expression: `0 20 * * *`

### reportUtils.js
**Purpose:** Helper utilities

**Functions:**
- `formatDate(date)` - Format date (YYYY-MM-DD)
- `formatReadableDate(date)` - Human-readable date
- `formatDateTime(date)` - Date with time in IST
- `roundToDecimals(value, decimals)` - Round numbers
- `formatCurrency(amount)` - Format as Indian Rupees
- `isValidEmail(email)` - Validate email
- Additional utilities: slug generation, retry logic, array chunking

## API Endpoints

### Generate Daily Report (Manual)

**Endpoint:** `POST /api/v1/vendor/generate-daily-report`

**Authentication:** Admin only (adminMiddleware)

**Request Body:**
```json
{
  "storeId": "ST-001",
  "from": "2026-03-27",
  "to": "2026-03-27",
  "sendEmail": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportDate": "2026-03-27",
    "vendorName": "Vendor Name",
    "storeName": "Store Name",
    "storeLocation": "Store Location",
    "totalTransactions": 5,
    "totalItems": 15,
    "totalWeight": 45.50,
    "totalAmount": 1234.50,
    "items": [
      {
        "materialType": "Plastic",
        "totalItems": 5,
        "weight": 10.50,
        "rate": 50.00,
        "totalAmount": 525.00
      }
    ],
    "emailSent": true,
    "generatedAt": "27/03/2026, 15:30:45"
  }
}
```

## How It Works

### Automated Daily Process (Every 8 PM IST)

1. **Initialize** - Cron job triggers at scheduled time
2. **Fetch Vendors** - Get all unique vendors from transactions
3. **Loop Vendors** - For each vendor:
   - Get vendor email from database
   - Fetch all stores for the vendor
   - For each store:
     - Fetch transactions for the current date
     - Skip if no transactions
     - Generate PDF report
     - Send email with PDF attachment
     - Delete temporary PDF file
4. **Log Results** - Log success count, failures, and duration

### Logging Output

```
===== Daily Report Generation Started =====
Time: 2026-03-27T20:00:00.000Z
Processing reports for date: 2026-03-27
Found 2 vendors

Processing vendor: Vendor A (vendor-a@example.com)
  Found 3 stores for vendor
  Processing store: Store 1
    Generating PDF: daily-report-ST-001-2026-03-27.pdf
    PDF generated successfully
    Sending email to vendor-a@example.com
    Email sent successfully
    PDF file deleted
  ...

===== Daily Report Generation Completed =====
Total Time: 12.34 seconds
Emails Sent: 6
Emails Failed: 0
```

## Error Handling

### Scenarios Handled

1. **No Transactions** - Skipped without error
2. **Vendor Not Found** - Logged and continued to next vendor
3. **PDF Generation Failure** - Caught and reported
4. **Email Sending Failure** - Logged but doesn't crash server
5. **Database Connection Issues** - Connection errors are caught
6. **Invalid Email** - Validation before sending

### Error Logs Example

```
Error in fetchTransactionsByDateRange: <error details>
Error processing store Store Name: <error message>
Failed to send email to vendor@example.com: <error message>
```

## Database Models Used

### TransactionModel
```javascript
{
  transactionId: String,
  vendorName: String,
  store: {
    storeId: String,
    storeName: String,
    storeLocation: String
  },
  items: [{
    itemNo: Number,
    materialType: String,
    weight: Number,
    materialRate: Number,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### VendorModel
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  vendorLocation: String,
  contactNumber: String,
  role: String,
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Manual Report Generation via API

```bash
curl -X POST http://localhost:3000/api/v1/vendor/generate-daily-report \
  -H "Content-Type: application/json" \
  -H "Authorization: <admin-token>" \
  -d '{
    "storeId": "ST-001",
    "from": "2026-03-27",
    "to": "2026-03-27",
    "sendEmail": true
  }'
```

### Testing Email (from Node terminal)

```javascript
import { generateAndSendDailyReports } from './services/cronScheduler.js';

// Run manually
await generateAndSendDailyReports();
```

## Performance Optimization

### Current Optimizations

1. **Aggregation Pipeline** - MongoDB aggregation for data filtering
2. **Selective Queries** - Only fetch needed fields (`select("-password")`)
3. **Chunking Support** - Helper for processing large datasets in chunks
4. **Async Processing** - Non-blocking email sending
5. **PDF Cleanup** - Temporary files deleted after sending
6. **Retry Logic** - Exponential backoff for failed operations

### For Large Scale

```javascript
// Use chunkArray for processing thousands of stores
import { chunkArray } from '../utils/reportUtils.js';

const stores = await fetchAllStoresForVendor(vendorName);
const chunks = chunkArray(stores, 50); // Process 50 at a time

for (const chunk of chunks) {
  // Process chunk
}
```

## Monitoring & Logging

### Log Files Location
- Console logs from cron scheduler
- Application server logs
- Database query logs (if enabled)

### Monitoring Best Practices

1. **Set Up Log Aggregation** - Use services like Loggly or CloudWatch
2. **Email Alerts** - Notify on failures
3. **Dashboard** - Track report generation metrics
4. **Database Indexing** - Index commonly searched fields

### Recommended Indexes

```javascript
// Add to MongoDB
db.transactions.createIndex({ "store.storeId": 1, createdAt: 1 });
db.transactions.createIndex({ vendorName: 1 });
db.vendors.createIndex({ email: 1 });
```

## Troubleshooting

### Cron Job Not Running

```javascript
// Check if scheduled with correct timezone
// Verify in server console:
✓ Daily Report Cron Scheduler initialized successfully
✓ Schedule: Every day at 8:00 PM IST (Asia/Kolkata timezone)
```

### PDF Generation Failed

1. Check temp folder exists: `backend/temp/`
2. Verify pdfkit is installed: `npm list pdfkit`
3. Check disk space available
4. Review error logs for details

### Email Not Sending

1. Verify .env variables are set correctly
2. Test email configuration separately
3. Check spam/junk folders
4. Verify vendor email exists in database
5. Check email service logs

### Timezone Issues

```javascript
// Current setup uses IST timezone
// Cron runs at 20:00 IST daily

// To change timezone, modify cronScheduler.js:
// timezone: "Your/Timezone" (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
```

## Future Enhancements

1. **Custom Schedule** - Allow admins to configure report timing
2. **Report Templates** - Multiple PDF templates
3. **Historical Reports** - Archive generated reports
4. **Dashboard Charts** - Interactive report visualization
5. **Batch Email** - Send combined reports for multiple stores
6. **Report Filters** - Filter transactions by material type, date range
7. **Excel Export** - Add Excel as report format option
8. **SMS Notifications** - Send SMS alerts alongside emails
9. **Report Scheduling** - Allow vendors to schedule custom reports
10. **Analytics Dashboard** - Weekly/monthly analytics views

## Support & Contact

For issues or feature requests:
- Review error logs in console
- Check MongoDB connections
- Verify email configuration
- Ensure all dependencies are installed

---

## Summary

This feature provides a **production-ready, automated daily transaction reporting system** with:

 Clean, maintainable code architecture  
 Comprehensive error handling  
 Professional PDF generation  
 Email delivery system  
 Scheduled automation with timezone support  
 Manual API for on-demand reports  
 Multi-vendor/store support  
 Detailed logging and monitoring  

The system is ready for deployment and can handle large-scale transaction data efficiently.
