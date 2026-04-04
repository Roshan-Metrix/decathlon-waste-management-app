# Daily Transaction Report API Documentation

## Base URL

```text
http://localhost:3000/api/v1/vendor
```

## Authentication

All report endpoints require:
- `adminMiddleware`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <admin_token>
```

## Endpoint

### `POST /generate-daily-report`

Generates a report for a store and optionally emails it.

## Request Body

```json
{
  "storeId": "ST-001",
  "from": "2026-03-27",
  "to": "2026-03-27",
  "sendEmail": true
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `storeId` | `String` | Yes | Store identifier |
| `from` | `String` | Yes | `YYYY-MM-DD` |
| `to` | `String` | Yes | `YYYY-MM-DD` |
| `sendEmail` | `Boolean` | No | Default is `true` |
| `vendorName` | `String` | No | Needed only if multiple vendors exist for same store/date range |

## Email Recipient Behavior

When `sendEmail` is `true`:
- the system fetches transaction data
- reads `transaction.store.storeState`
- resolves recipients from `backend/config/reportRecipientsByState.js`
- appends `GLOBAL_REPORT_RECIPIENTS`
- sends the PDF to all resolved recipients

Vendor email is not used for report delivery in the current setup.

## Success Response

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportDate": "2026-03-27",
    "vendorName": "ABC Waste Management",
    "storeName": "Delhi Central Store",
    "storeLocation": "New Delhi, Delhi",
    "storeState": "Tamilnadu",
    "totalTransactions": 12,
    "totalItems": 45,
    "totalWeight": 125.5,
    "totalAmount": 6275,
    "items": [
      {
        "materialType": "Plastic",
        "totalItems": 15,
        "weight": 45.5,
        "rate": 50,
        "totalAmount": 2275
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

## Error Responses

### Missing required fields

```json
{
  "success": false,
  "message": "storeId, from, and to (date in YYYY-MM-DD format) are required."
}
```

### No transactions found

```json
{
  "success": false,
  "message": "No transactions found for the specified date range and store"
}
```

### Multiple vendors found without `vendorName`

```json
{
  "success": false,
  "message": "Multiple vendors were found for this store and date range. Please provide vendorName to generate a vendor-specific report.",
  "vendors": ["Vendor A", "Vendor B"]
}
```

### No recipients configured for state

```json
{
  "success": false,
  "message": "No report recipient emails configured for state \"Tamilnadu\""
}
```

### Server error

```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details here"
}
```

## Response Data Shape

```js
{
  reportDate: String,
  vendorName: String,
  storeName: String,
  storeLocation: String,
  storeState: String,
  totalTransactions: Number,
  totalItems: Number,
  totalWeight: Number,
  totalAmount: Number,
  items: Array,
  emailSent: Boolean,
  recipientEmails: String[],
  generatedAt: String
}
```

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/vendor/generate-daily-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "storeId": "ST-001",
    "from": "2026-03-27",
    "to": "2026-03-27",
    "sendEmail": true
  }'
```

### JavaScript

```js
const response = await fetch(
  "http://localhost:3000/api/v1/vendor/generate-daily-report",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      storeId: "ST-001",
      from: "2026-03-27",
      to: "2026-03-27",
      sendEmail: true,
    }),
  }
);

const data = await response.json();
```

## Cron Job

The automated scheduler sends reports daily at:

- `8:00 PM IST`
- timezone: `Asia/Kolkata`
- cron expression: `0 20 * * *`

## Troubleshooting

### Email not sent

Check:
1. `.env` mail credentials
2. `backend/config/reportRecipientsByState.js`
3. `transaction.store.storeState`
4. SMTP logs
5. spam/junk folder

### `recipientEmails` is empty

Likely causes:
- state not configured
- state name mismatch
- all configured emails are invalid

### Vendor email is not receiving reports

This is expected unless that email is added to:
- the matching state recipient list
- or `GLOBAL_REPORT_RECIPIENTS`
