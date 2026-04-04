# Daily Transaction Report Feature

This document describes the current daily transaction report setup in `backend/`.

## Overview

The system generates PDF reports for store transactions and sends them by email.

Recipient routing is now:
- based on the transaction store state: `transaction.store.storeState`
- resolved from `backend/config/reportRecipientsByState.js`
- combined with `GLOBAL_REPORT_RECIPIENTS` so shared recipients receive every report

The report content can still include `vendorName`, but vendor email is no longer used for report delivery.

## Current Flow

### Manual API flow

1. `POST /api/v1/vendor/generate-daily-report`
2. `vendorController.generateDailyReportManual()` validates `storeId`, `from`, `to`
3. `transactionService.fetchTransactionsByDateRange()` fetches report data
4. `reportData.storeState` is read from transaction data
5. `getReportRecipientsByState(reportData.storeState)` resolves recipients
6. `pdfService.generatePDF()` creates the PDF
7. `emailService.sendDailyReportEmail()` sends to all resolved recipients
8. `pdfService.deletePDF()` removes the temp file

### Cron flow

1. `cronScheduler.generateAndSendDailyReports()` runs every day at `8:00 PM IST`
2. It loops through vendors and their stores
3. For each store, it fetches transactions for the day
4. It resolves recipients from `storeState`
5. It generates the PDF
6. It emails the report to state recipients plus global recipients
7. It deletes the temp PDF

## Recipient Configuration

Recipient config is stored in:

- `backend/config/reportRecipientsByState.js`

Example:

```js
const REPORT_RECIPIENTS_BY_STATE = {
  Tamilnadu: {
    email1: "abc@gmail.com",
    email2: "fig@wisebin.com",
  },
  Karnataka: {
    email1: "one@example.com",
    email2: "two@example.com",
  },
};

const GLOBAL_REPORT_RECIPIENTS = [
  "roshan@gmail.com",
];
```

Rules:
- state match is case-insensitive after normalization
- both object format and array format are supported
- invalid emails are skipped
- duplicate emails are removed
- if no matching state recipients exist, sending fails for that report
- global recipients are appended to every report

## Files Involved

### `backend/config/reportRecipientsByState.js`

Contains:
- `REPORT_RECIPIENTS_BY_STATE`
- `GLOBAL_REPORT_RECIPIENTS`
- `getReportRecipientsByState(state)`

### `backend/services/transactionService.js`

Provides:
- `fetchTransactionsByDateRange(storeId, fromDate, toDate, vendorName?)`
- `fetchAllStoresForVendor(vendorName)`
- `fetchAllVendors()`

Important return fields:
- `vendorName`
- `storeName`
- `storeLocation`
- `storeState`
- `totalTransactions`
- `totalItems`
- `totalWeight`
- `totalAmount`
- `items`

### `backend/services/emailService.js`

Provides:
- `sendDailyReportEmail(recipientEmails, recipientLabel, reportData, pdfFilePath)`
- `sendBulkDailyReports(emailList)`

`sendDailyReportEmail()` now accepts:
- one email or multiple emails
- a recipient label for logs, usually the state name

### `backend/services/cronScheduler.js`

Responsible for:
- daily scheduled execution
- store-level report generation
- state recipient resolution
- logging success/failure

### `backend/controllers/vendorController.js`

Manual endpoint:
- `generateDailyReportManual()`

## API Request

Endpoint:

```http
POST /api/v1/vendor/generate-daily-report
```

Body:

```json
{
  "storeId": "ST-001",
  "from": "2026-03-27",
  "to": "2026-03-27",
  "sendEmail": true
}
```

Optional:
- `vendorName`

Use `vendorName` only if multiple vendors exist for the same store/date range and you want a vendor-specific report body.

## API Success Response

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportDate": "2026-03-27",
    "vendorName": "Vendor Name",
    "storeName": "Store Name",
    "storeLocation": "Store Location",
    "storeState": "Tamilnadu",
    "totalTransactions": 5,
    "totalItems": 15,
    "totalWeight": 45.5,
    "totalAmount": 1234.5,
    "items": [
      {
        "materialType": "Plastic",
        "totalItems": 5,
        "weight": 10.5,
        "rate": 50,
        "totalAmount": 525
      }
    ],
    "emailSent": true,
    "recipientEmails": [
      "abc@gmail.com",
      "fig@wisebin.com",
      "roshan@gmail.com"
    ],
    "generatedAt": "27/03/2026, 15:30:45"
  }
}
```

## Error Cases

### Missing required fields

```json
{
  "success": false,
  "message": "storeId, from, and to (date in YYYY-MM-DD format) are required."
}
```

### No transactions

```json
{
  "success": false,
  "message": "No transactions found for the specified date range and store"
}
```

### No state recipients configured

```json
{
  "success": false,
  "message": "No report recipient emails configured for state \"Tamilnadu\""
}
```

## Data Model Notes

### Transaction store shape

```js
store: {
  storeId: String,
  storeName: String,
  storeLocation: String,
  storeState: String
}
```

`storeState` is the field used to resolve recipients.

## Logging Example

```text
===== Daily Report Generation Started =====
Processing reports for date: 2026-03-27
Found 2 vendors

Processing vendor: Vendor A
  Found 3 stores for vendor
  Processing store: Store 1
    Generating PDF: daily-report-ST-001-2026-03-27.pdf
    PDF generated successfully
    Sending email to abc@gmail.com, fig@wisebin.com, roshan@gmail.com
    Email sent successfully
    PDF file deleted
```

## Troubleshooting

### Email not sent

Check:
1. `SENDER_EMAIL` and `EMAIL_PASSWORD` in `.env`
2. recipient config in `backend/config/reportRecipientsByState.js`
3. transaction contains correct `store.storeState`
4. configured email addresses are valid
5. spam/junk folder

### Report generated but not mailed

Possible reasons:
- `sendEmail` was `false`
- no state recipients configured
- SMTP failure
- invalid configured email addresses

### Cron sends fail for one store only

Usually means:
- missing recipient config for that state
- malformed email in that state's config
- store transactions missing `storeState`

## Summary

Current behavior:
- report content is generated from transactions
- report recipients come from state config
- global recipients receive every report
- vendor email is not used for report sending
