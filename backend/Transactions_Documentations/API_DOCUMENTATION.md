# Daily Transaction Report API Documentation

## Overview

This document describes the API endpoints for the daily transaction report feature.

## Base URL

```
http://localhost:3000/api/v1/vendor
```

## Authentication

All endpoints require specific middleware:
- `adminMiddleware` - Requires admin authorization

Headers Required:
```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

---

## Endpoints

### 1. Generate Daily Report (Manual)

Generate and send daily transaction report for a specific store.

**Endpoint:** `POST /generate-daily-report`

**Authentication:** Admin Only

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "storeId": "ST-001",
  "from": "2026-03-27",
  "to": "2026-03-27",
  "sendEmail": true
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| storeId | String | Yes | Unique store identifier |
| from | String | Yes | Start date in YYYY-MM-DD format |
| to | String | Yes | End date in YYYY-MM-DD format |
| sendEmail | Boolean | No | Send email with report (default: true) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportDate": "2026-03-27",
    "vendorName": "ABC Waste Management",
    "storeName": "Delhi Central Store",
    "storeLocation": "New Delhi, Delhi",
    "totalTransactions": 12,
    "totalItems": 45,
    "totalWeight": 125.50,
    "totalAmount": 6275.00,
    "items": [
      {
        "materialType": "Plastic",
        "totalItems": 15,
        "weight": 45.50,
        "rate": 50.00,
        "totalAmount": 2275.00
      },
      {
        "materialType": "Paper",
        "totalItems": 18,
        "weight": 60.00,
        "rate": 35.00,
        "totalAmount": 2100.00
      },
      {
        "materialType": "Metal",
        "totalItems": 12,
        "weight": 20.00,
        "rate": 100.00,
        "totalAmount": 2000.00
      }
    ],
    "emailSent": true,
    "generatedAt": "27/03/2026, 15:30:45"
  }
}
```

**Error Responses:**

**400 - Bad Request (Missing Fields):**
```json
{
  "success": false,
  "message": "storeId, from and to (date in YYYY-MM-DD format) are required."
}
```

**400 - Bad Request (No Transactions):**
```json
{
  "success": false,
  "message": "No transactions found for the specified date range and store"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. Admin authorization required."
}
```

**500 - Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details here"
}
```

---

## Examples

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/vendor/generate-daily-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "storeId": "ST-001",
    "from": "2026-03-27",
    "to": "2026-03-27",
    "sendEmail": true
  }'
```

### JavaScript/Fetch Example

```javascript
async function generateDailyReport() {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(
    'http://localhost:3000/api/v1/vendor/generate-daily-report',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        storeId: 'ST-001',
        from: '2026-03-27',
        to: '2026-03-27',
        sendEmail: true
      })
    }
  );
  
  const data = await response.json();
  console.log(data);
  return data;
}
```

### Axios Example

```javascript
import axios from 'axios';

const generateDailyReport = async (storeId, from, to) => {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await axios.post(
      'http://localhost:3000/api/v1/vendor/generate-daily-report',
      {
        storeId,
        from,
        to,
        sendEmail: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Report generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Python Example

```python
import requests
from datetime import datetime

def generate_daily_report(store_id, from_date, to_date, token):
    url = "http://localhost:3000/api/v1/vendor/generate-daily-report"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        "storeId": store_id,
        "from": from_date,
        "to": to_date,
        "sendEmail": True
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Usage
token = "your_admin_token"
result = generate_daily_report("ST-001", "2026-03-27", "2026-03-27", token)
print(result)
```

---

## Automated Cron Job

The system automatically generates and sends reports every day at **8:00 PM IST** (Asia/Kolkata timezone).

**Manual Trigger (for development):**

```bash
# Add this npm script to package.json
"report:test": "node -e \"import('./services/cronScheduler.js').then(m => m.generateAndSendDailyReports())\""
```

Then run:
```bash
npm run report:test
```

---

## Response Data Structure

### Report Data Object

```javascript
{
  reportDate: String,          // "2026-03-27"
  vendorName: String,          // "ABC Waste Management"
  storeName: String,           // "Delhi Store"
  storeLocation: String,       // "New Delhi, Delhi"
  totalTransactions: Number,   // 12
  totalItems: Number,          // 45
  totalWeight: Number,         // 125.50 kg
  totalAmount: Number,         // 6275.00 ₹
  items: Array<MaterialItem>,
  emailSent: Boolean,
  generatedAt: String          // "27/03/2026, 15:30:45"
}
```

### MaterialItem Object

```javascript
{
  materialType: String,    // "Plastic"
  totalItems: Number,      // 15
  weight: Number,          // 45.50 kg
  rate: Number,           // 50.00 ₹/kg
  totalAmount: Number     // 2275.00 ₹
}
```

---

## Date Format Requirements

- **Accepted Format:** `YYYY-MM-DD` (ISO 8601)
- **Examples:** 
  - `2026-03-27` ✓ Correct
  - `03/27/2026` ✗ Incorrect
  - `27-03-2026` ✗ Incorrect
  - `2026-3-27` ✗ Incorrect (month/day must be 2 digits)

**Note:** Date range is processed in IST timezone (00:00 to 23:59 IST)

---

## Email Behavior

### When sendEmail = true:
1. Report PDF is generated
2. Email is retrieved from vendor database
3. PDF is attached to HTML email
4. Email is sent via configured SMTP
5. Temporary PDF file is deleted

### When sendEmail = false:
1. Report PDF is generated
2. Report data is returned in response
3. PDF is deleted (not sent)
4. Useful for testing/preview

---

## Error Codes & Messages

| Status | Code | Message | Resolution |
|--------|------|---------|-----------|
| 400 | BAD_REQUEST | Missing required fields | Check all required fields are provided |
| 400 | NO_TRANSACTIONS | No transactions found | Verify store has transactions on specified date |
| 401 | UNAUTHORIZED | Admin authorization required | Use valid admin JWT token |
| 500 | SERVER_ERROR | Internal Server Error | Check server logs for details |
| 500 | PDF_ERROR | Failed to generate PDF | Check /temp folder exists and has write permissions |
| 500 | EMAIL_ERROR | Failed to send email | Check email configuration in .env |

---

## Performance Considerations

- **Report Generation Time:** 2-5 seconds (depending on transaction volume)
- **Email Sending Time:** 1-3 seconds per email
- **PDF File Size:** 50KB - 1MB (depending on content)
- **Concurrent Requests:** Safe to make multiple requests

---

## Rate Limiting

No rate limiting is currently implemented. Recommended configuration:

```javascript
// Add to server.js
import rateLimit from 'express-rate-limit';

const reportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,                   // 10 requests per minute
  message: 'Too many report requests'
});

vendorRouter.post('/generate-daily-report', reportLimiter, adminMiddleware, generateDailyReportManual);
```

---

## Testing Checklist

- [ ] API responds with 200 on valid request
- [ ] PDF is generated correctly
- [ ] Email is sent with PDF attachment
- [ ] Response includes all required fields
- [ ] Returns 400 for missing parameters
- [ ] Returns 401 for unauthorized access
- [ ] Handles stores with no transactions
- [ ] Works with multiple store IDs
- [ ] Works with date ranges (from different than to)
- [ ] Temporary files are cleaned up

---

## Monitoring & Logging

All API requests are logged with timestamps:

```
[2026-03-27 15:30:45] POST /api/v1/vendor/generate-daily-report
Status: 200
Response Time: 2.34s
Emails Sent: 1
```

---

## Webhook Integration (Future)

API can be extended to support webhooks:

```javascript
// Example webhook configuration
{
  url: "https://your-webhook.com/reports",
  events: ["report.generated", "report.failed"],
  retry: 3
}
```

---

## Related Endpoints

Existing endpoints that complement the report feature:

- `GET /api/v1/vendor/transactions-particular-store/:storeId/:from/:to` - Get raw transaction data
- `GET /api/v1/vendor/get-related-stores` - Get stores for logged-in vendor
- `GET /api/v1/vendor/get-all-related-transactions` - Get all vendor transactions

---

## Support & Troubleshooting

### API returns 401 Unauthorized
- Check JWT token is valid
- Verify token is not expired
- Ensure user has admin role

### API returns 400 No transactions
- Verify transaction date is correct
- Check store has activity on that date
- Use `/get-related-stores` to confirm store exists

### PDF not generated
- Check `/backend/temp` folder exists
- Verify disk space available
- Check server logs for errors

### Email not sent
- Verify SENDER_EMAIL in .env
- Check EMAIL_PASSWORD is correct
- Ensure vendor email is in database
- Check spam folder for emails

For more details, see [DAILY_REPORT_SETUP.md](./DAILY_REPORT_SETUP.md)
