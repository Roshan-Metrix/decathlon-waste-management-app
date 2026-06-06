API Documentation - Backend
==========================

Base URL
--------
- Base path for API endpoints shown below: /api/v1
- Common headers:
  - Content-Type: application/json
  - For file uploads (OCR): multipart/form-data
  - Authentication: endpoints protected by authMiddleware/adminMiddleware/vendorMiddleware expect the requester to be authenticated (token via cookie or Authorization header depending on app setup).

Notes on auth
-------------
- authMiddleware: requires a logged-in user (role checks may be enforced downstream).
- adminMiddleware: admin-only actions.
- vendorMiddleware / managerMiddleware: vendor/manager-specific access.

Routes overview
---------------
1) Auth endpoints (/api/v1/auth)

- GET /api/v1/auth/
  - Purpose: health check for auth routes.
  - Auth: none

- POST /api/v1/auth/login
  - Purpose: login user (admin/manager/store/vendor depending on credentials)
  - Body (JSON): { "email" | "phone": string, "password": string }
  - Auth: none

- POST /api/v1/auth/logout
  - Purpose: logout current session (clear cookie/session)
  - Auth: none (controller handles clearing tokens/cookies)

- POST /api/v1/auth/send-reset-otp
  - Purpose: send OTP to user for password reset
  - Body (JSON): { "email" | "phone": string }

- POST /api/v1/auth/reset-password
  - Purpose: reset password using OTP
  - Body (JSON): { "identifier": string, "otp": string, "newPassword": string }

- GET /api/v1/auth/profile
  - Purpose: get logged-in user details
  - Auth: authMiddleware

- PUT /api/v1/auth/change-password
  - Purpose: change password for logged-in user
  - Auth: authMiddleware
  - Body (JSON): { "oldPassword": string, "newPassword": string }

Admin-specific
- POST /api/v1/auth/admin/registerAdmin
  - Purpose: create a new admin
  - Auth: adminMiddleware
  - Body: admin details (name, email, password, etc.)

- POST /api/v1/auth/admin/registerStore
  - Purpose: create/register a new store
  - Auth: adminMiddleware
  - Body: store details (name, address, region, managerId, etc.)

- GET /api/v1/auth/admin/get-all-stores
  - Purpose: list all stores
  - Auth: adminMiddleware

- GET /api/v1/auth/admin/get-all-admins
  - Purpose: list admins
  - Auth: authMiddleware (endpoint currently guarded by authMiddleware in routes)

- DELETE /api/v1/auth/admin/delete-store/:storeId
  - Path params: storeId
  - Auth: adminMiddleware

- DELETE /api/v1/auth/admin/delete-manager/:managerId
  - Path params: managerId
  - Auth: adminMiddleware

- GET /api/v1/auth/get-all-managers
  - Purpose: list managers
  - Auth: adminMiddleware

- PATCH /api/v1/auth/admin/restrict-admin/:adminId
  - Path params: adminId
  - Purpose: restrict/unrestrict admin access
  - Auth: adminMiddleware

- PATCH /api/v1/auth/admin/edit-store/:storeId
  - Path params: storeId
  - Body: fields to update for store
  - Auth: adminMiddleware

Manager / Store
- POST /api/v1/auth/registerManager
  - Purpose: register a manager (route protected by authMiddleware)
  - Auth: authMiddleware
  - Body: manager details

- GET /api/v1/auth/manager/profile
  - Purpose: manager profile
  - Auth: authMiddleware + managerMiddleware

- GET /api/v1/auth/manager/get-store-managers/:storeId
  - Path params: storeId
  - Purpose: list managers for a particular store
  - Auth: authMiddleware

- GET /api/v1/auth/store/profile
  - Purpose: get store profile for logged-in store user
  - Auth: authMiddleware

Material types & regions
- POST /api/v1/auth/admin/add-materials
  - Purpose: add material types and rates
  - Auth: authMiddleware + adminMiddleware
  - Body: { materials: [ { type: string, rate: number, ... } ] }

- GET /api/v1/auth/get-regions
  - Purpose: list regions
  - Auth: authMiddleware

- GET /api/v1/auth/get-regional-materials/:region
  - Path params: region
  - Purpose: get materials & rates for region
  - Auth: authMiddleware

- DELETE /api/v1/auth/admin/delete-region/:region
  - Path params: region
  - Auth: authMiddleware + adminMiddleware

2) Transaction endpoints (/api/v1/transaction)

- GET /api/v1/transaction/
  - Purpose: health check

- POST /api/v1/transaction/add-transaction
  - Purpose: create a transaction record (store/app)
  - Auth: authMiddleware
  - Body (JSON): transaction summary (storeId, vendorId?, totalAmount?, items[], date, etc.)

- POST /api/v1/transaction/transaction-items/:transactionId
  - Path params: transactionId
  - Purpose: add items to a transaction
  - Auth: authMiddleware
  - Body: { items: [ { materialType, weight, rate, amount, ... } ] }

- POST /api/v1/transaction/transaction-calibration/ocr
  - Purpose: OCR/image recognition using Gemini service
  - Auth: authMiddleware
  - Content-Type: multipart/form-data
  - Form field: image (file) — upload.single('image')

- POST /api/v1/transaction/transaction-calibration/:transactionId
  - Path params: transactionId
  - Purpose: run calibration or adjust transaction via provided calibration data
  - Auth: authMiddleware
  - Body: calibration payload

- GET /api/v1/transaction/todays-transactions/:transactionId
  - Path params: transactionId
  - Purpose: fetch today's transactions for given transactionId (likely store/session)
  - Auth: authMiddleware

- GET /api/v1/transaction/store-total-transactions/:storeId
  - Path params: storeId
  - Purpose: get total transactions for a store
  - Auth: authMiddleware

- GET /api/v1/transaction/selected-transactions-items/:transactionId
  - Path params: transactionId
  - Purpose: get selected items for a transaction
  - Auth: authMiddleware

- GET /api/v1/transaction/all-transactions
  - Purpose: list all transactions (likely paginated in implementation)
  - Auth: authMiddleware

- GET /api/v1/transaction/get-stores-total-transactions
  - Purpose: admin summary across stores
  - Auth: adminMiddleware

- GET /api/v1/transaction/get-store-filter-transactions/:storeId/:from/:to
  - Path params: storeId, from (date/string), to (date/string)
  - Purpose: filter transactions for a store between two dates
  - Auth: adminMiddleware

3) Vendor endpoints (/api/v1/vendor)

- GET /api/v1/vendor/
  - Purpose: health check

- POST /api/v1/vendor/register
  - Purpose: register vendor (admin-only)
  - Auth: adminMiddleware
  - Body: vendor details

- POST /api/v1/vendor/login
  - Purpose: vendor login
  - Body: { "email" | "phone": string, "password": string }

- POST /api/v1/vendor/logout
  - Purpose: vendor logout

- GET /api/v1/vendor/profile
  - Purpose: get logged-in vendor details
  - Auth: vendorMiddleware

- GET /api/v1/vendor/get-all-related-transactions
  - Purpose: get total transactions for all stores related to vendor
  - Auth: vendorMiddleware

- GET /api/v1/vendor/get-related-stores
  - Purpose: list stores related to vendor
  - Auth: vendorMiddleware

- GET /api/v1/vendor/get-all-vendors
  - Purpose: list all vendors (public)

- GET /api/v1/vendor/particular-transactions/:transactionId
  - Path params: transactionId
  - Purpose: vendor access to a particular transaction
  - Auth: vendorMiddleware

- GET /api/v1/vendor/transactions-particular-store/:storeId
  - Path params: storeId
  - Purpose: transactions of a particular store related to vendor
  - Auth: vendorMiddleware

- GET /api/v1/vendor/transactions-particular-store/:storeId/:from/:to
  - Path params: storeId, from, to (dates)
  - Purpose: filtered transactions for vendor for a specific store in date range
  - Auth: vendorMiddleware

- POST /api/v1/vendor/generate-daily-report
  - Purpose: manually trigger daily report generation (admin)
  - Auth: adminMiddleware

- DELETE /api/v1/vendor/delete-vendor/:vendorId
  - Path params: vendorId
  - Purpose: delete a vendor (admin only)
  - Auth: adminMiddleware

General examples
----------------
- File upload: use multipart/form-data and include file field named `image` for OCR route.
- Date filters: `from` and `to` are expected to be date strings (ISO preferred) — controller will parse/validate.
- Path parameters appear where noted (prefix with ":")

If more detailed request/response schemas are needed, open the specific controller files under backend/controllers to extract exact field names and response formats.

End of document
