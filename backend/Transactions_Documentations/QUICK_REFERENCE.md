# Quick Reference - Daily Transaction Report

## Main Flow

```text
Generate report
  ->
Fetch transactions
  ->
Read storeState
  ->
Resolve recipients from reportRecipientsByState.js
  ->
Generate PDF
  ->
Send email
  ->
Delete temp PDF
```

## Key Files

- `backend/controllers/vendorController.js`
  - `generateDailyReportManual()`

- `backend/services/transactionService.js`
  - `fetchTransactionsByDateRange()`
  - `fetchAllStoresForVendor()`
  - `fetchAllVendors()`

- `backend/services/pdfService.js`
  - `generatePDF()`
  - `deletePDF()`

- `backend/services/emailService.js`
  - `sendDailyReportEmail()`
  - `sendBulkDailyReports()`

- `backend/services/cronScheduler.js`
  - `generateAndSendDailyReports()`

- `backend/config/reportRecipientsByState.js`
  - `REPORT_RECIPIENTS_BY_STATE`
  - `GLOBAL_REPORT_RECIPIENTS`
  - `getReportRecipientsByState()`

## Function Dependencies

### `vendorController.generateDailyReportManual()`

Calls:
- `transactionService.fetchTransactionsByDateRange()`
- `pdfService.generatePDF()`
- `emailService.sendDailyReportEmail()`
- `pdfService.deletePDF()`
- `reportUtils.formatDateTime()`
- `getReportRecipientsByState()`

### `cronScheduler.generateAndSendDailyReports()`

Calls:
- `transactionService.fetchAllVendors()`
- `transactionService.fetchAllStoresForVendor()`
- `transactionService.fetchTransactionsByDateRange()`
- `pdfService.generatePDF()`
- `emailService.sendDailyReportEmail()`
- `pdfService.deletePDF()`
- `getReportRecipientsByState()`

## Recipient Rules

- recipient lookup uses `transaction.store.storeState`
- matching state emails come from `REPORT_RECIPIENTS_BY_STATE`
- all emails in `GLOBAL_REPORT_RECIPIENTS` receive every report
- invalid emails are skipped
- duplicate emails are removed

## Important Report Data

```json
{
  "vendorName": "Vendor A",
  "storeName": "Store Name",
  "storeLocation": "Store Location",
  "storeState": "Tamilnadu",
  "totalTransactions": 12,
  "totalItems": 45,
  "totalWeight": 125.5,
  "totalAmount": 6275,
  "items": []
}
```

## Manual API

Endpoint:

```http
POST /api/v1/vendor/generate-daily-report
```

Request:

```json
{
  "storeId": "ST-001",
  "from": "2026-03-27",
  "to": "2026-03-27",
  "sendEmail": true
}
```

Response includes:
- `storeState`
- `emailSent`
- `recipientEmails`

## Email Service Signature

```js
sendDailyReportEmail(recipientEmails, recipientLabel, reportData, pdfFilePath)
```

## Cron Schedule

- time: `8:00 PM IST`
- timezone: `Asia/Kolkata`
- cron: `0 20 * * *`

## Fast Troubleshooting

### No email received

Check:
- `.env` mail credentials
- state exists in `reportRecipientsByState.js`
- `storeState` exists in transaction
- email format is valid

### Manual API returns recipient error

Means:
- no recipients are configured for that state

### Vendor email not receiving report

Expected with current setup unless that email is also added to:
- the matching state in `REPORT_RECIPIENTS_BY_STATE`
- or `GLOBAL_REPORT_RECIPIENTS`
