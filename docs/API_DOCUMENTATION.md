# API Documentation

Base URL: `/api`

Auth header for protected endpoints:
- `Authorization: Bearer <jwt-token>`

## Health
- `GET /health`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Materials
- `GET /materials`
- `GET /materials/:id`
- `POST /materials`
- `PUT /materials/:id`
- `DELETE /materials/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

## Production
- `GET /production`
- `GET /production/:id`
- `POST /production`
- `PUT /production/:id`
- `DELETE /production/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

## Inventory
- `GET /inventory`
- `GET /inventory/:id`
- `GET /inventory/:id/movements`
- `POST /inventory`
- `PUT /inventory/:id`
- `PATCH /inventory/:id/adjust`
- `DELETE /inventory/:id`

Access policy:
- Read: authenticated users
- Create/Update/Adjust: admin, manager
- Delete: admin

Notes:
- Adjust endpoint writes stock movement history.
- Product stock is synchronized with inventory adjustments.

## Utilities
- `GET /utilities`
- `GET /utilities/:id`
- `POST /utilities`
- `PUT /utilities/:id`
- `DELETE /utilities/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

Notes:
- `unitsConsumed` and `totalAmount` are computed from readings/cost when not provided.

## Employees
- `GET /employees`
- `GET /employees/:id`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

Notes:
- `employeeCode` and `email` are enforced as unique.

## Sales
- `GET /sales`
- `GET /sales/:id`
- `POST /sales`
- `PUT /sales/:id`
- `DELETE /sales/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

Notes:
- Create sale deducts stock from `Product.currentStock`.
- If inventory exists for product, it also deducts `Inventory.quantityAvailable` and writes `InventoryMovement`.
- Delete sale restores stock with rollback movement logging.

## Purchases
- `GET /purchases`
- `GET /purchases/:id`
- `POST /purchases`
- `PUT /purchases/:id`
- `DELETE /purchases/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

Notes:
- Create purchase increases `Material.quantityInStock`.
- Delete purchase rolls stock back with guard against invalid rollback.

## Financial
- `GET /financial/summary`
- `GET /financial`
- `GET /financial/:id`
- `POST /financial`
- `PUT /financial/:id`
- `DELETE /financial/:id`

Access policy:
- Read: authenticated users
- Create/Update: admin, manager
- Delete: admin

Notes:
- `GET /financial/summary` computes monthly totals from sales, purchases, and utilities.
- Snapshot records are stored in `FinancialSummary` with unique month/year.
