# Dealbuzz API Documentation

Base URL: `/api`
All routes (except `/auth/*`) require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

## Auth Module
- **POST** `/auth/register`
  - Body: `{ tenantName, userName, email, password }`
  - Registers a new Tenant and its Super Admin user.
- **POST** `/auth/login`
  - Body: `{ email, password }`
  - Returns JWT `token` and `user` data.
- **GET** `/auth/me`
  - Returns authenticated user details.

## Products Module
- **GET** `/products`
  - Query options: `page`, `limit`, `search` (Search by product name)
- **POST** `/products`
  - Body: `{ name, sku, category, price, description? }`
- **PUT** `/products/:id`
  - Update product details correctly scoped to tenant.
- **DELETE** `/products/:id`
  - Soft deletes a product for a tenant.

## Services Module
- **CRUD Operations**: Handled symmetrically to products at `/services`.

## Invoices Module
- **GET** `/invoices`
  - List all invoices for the tenant.
- **POST** `/invoices`
  - Body: `{ customerId, invoiceNumber, items: [], subtotal, tax, total, dueDate }`
- **PUT** `/invoices/:id`
  - Update invoice details.

## Inventory Module
- **GET** `/inventory`
  - Retrieves all inventory transactions.
- **POST** `/inventory`
  - Logs a new inventory transaction.
  - Body: `{ productId, type: "IN" | "OUT", quantity, unitCost, costingMethod: "FIFO" | "LIFO" | "AVERAGE" }`
  - **Effect**: Automatically recalculates and updates the stock count for the associated product.

## Audit Logs Module
- **GET** `/audit-logs`
  - Query options: `page`, `limit`
  - Retrieves history of all `CREATE`, `UPDATE`, `DELETE`, and `LOGIN` events scoped to the requesting tenant.

## System Responses
All responses follow a standard JSON envelope:
- **Success (List):** `{ "data": [...], "total": 100, "page": 1, "limit": 10 }`
- **Success (Single):** `{ ...object }`
- **Error:** `{ "error": "Clear error message" }`
