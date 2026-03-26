# SYSTEM ARCHITECTURE - DETAILED DIAGRAMS & SPECIFICATIONS

---

## 1. SYSTEM ARCHITECTURE DIAGRAM (TEXT-BASED)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                          END USERS (Web Browser)                          │
│                                                                            │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
           ┌────────▼────────┐              ┌────────▼────────┐
           │ React Frontend  │              │ Mobile App      │
           │ (Web Interface) │              │ (React Native)  │
           └────────┬────────┘              └────────┬────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   API Gateway / Load Balancer   │
                    │   (nginx / API Gateway)         │
                    └────────────────┬────────────────┘
                                     │
        ┌────────────────────────────┴────────────────────────────┐
        │                                                          │
        │           MICROSERVICES / API LAYER (Node.js/Express)   │
        │                                                          │
        ├──────────────────┬──────────────────┬──────────────────┤
        │                  │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
   │ Material  │      │Production│      │ Utility  │      │ Employee │
   │ Service   │      │ Service  │      │ Service  │      │ Service  │
   └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
        │                  │                  │                  │
        ├──────────────────┬──────────────────┬──────────────────┤
        │                  │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐      ┌────▼──────────┐
   │ Inventory│      │ Sales &  │      │Financial │      │Auth & Admin   │
   │ Service  │      │Purchase  │      │Service   │      │Service        │
   └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬──────────┘
        │                  │                  │                  │
        └──────────────────┼──────────────────┼──────────────────┘
                           │                  │
                    ┌──────▼──────────────────▼──────┐
                    │   JWT Authentication Middleware│
                    │   Logging & Error Handling     │
                    │   Rate Limiting & Caching      │
                    └──────┬──────────────────┬──────┘
                           │                  │
                    ┌──────▼──────────────────▼──────┐
                    │      DATABASE LAYER            │
                    │   (PostgreSQL / MySQL)         │
                    └──────┬──────────────────┬──────┘
                           │                  │
        ┌──────────────────┼──────────────────┼──────────────────┐
        │                  │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
   │ Users DB │      │Products  │      │Employees │      │Inventory │
   │          │      │Materials │      │Payroll   │      │Sales/Purch
   └──────────┘      │Utilities │      │Utilities │      │Production│
                     └──────────┘      └──────────┘      └──────────┘
        
                           │
                    ┌──────▼──────────┐
                    │  Backup System  │
                    │  (Daily/Weekly) │
                    └─────────────────┘
```

---

## 2. DATA FLOW DIAGRAM

### A. Material Purchase Flow

```
Supplier Contact
      │
      ▼
Material Purchase Form
      │
      ├─ Quantity
      ├─ Cost per Unit
      ├─ Total Cost
      └─ Supplier Name
      │
      ▼
Material Service API
      │
      ├─ Validate Input
      ├─ Check Inventory Levels
      └─ Create Record
      │
      ▼
Database (Materials Table)
      │
      ▼
Update Material Balance
      │
      ▼
Trigger Notification:
  └─ If Stock > Reorder Level: OK
  └─ If Stock < Reorder Level: ALERT
```

### B. Production Flow

```
Production Schedule
      │
      ├─ Machine ID
      ├─ Product Type
      ├─ Quantity Target
      └─ Operator
      │
      ▼
Production Management Form
      │
      ▼
Production Service API
      │
      ├─ Log Production Run
      ├─ Record Output
      ├─ Track Quality
      └─ Calculate Efficiency
      │
      ▼
Update Tables:
  ├─ Production_Records
  ├─ Inventory (Add Finished Goods)
  └─ Material Usage (Deduct Raw Materials)
      │
      ▼
Generate Production Report
```

### C. Sales Transaction Flow

```
Customer Order
      │
      ├─ Product
      ├─ Quantity
      ├─ Unit Price
      └─ Customer Name
      │
      ▼
Sales Module Form
      │
      ▼
Validation:
  ├─ Check Inventory Availability
  ├─ Verify Customer Details
  └─ Confirm Pricing
      │
      ▼
Sales Service API
      │
      ├─ Create Sales Record
      ├─ Generate Invoice
      ├─ Update Inventory (Deduct)
      └─ Record Payment
      │
      ▼
Update Tables:
  ├─ Sales_Transactions
  ├─ Inventory
  └─ Financial_Records
      │
      ▼
Generate Report & Invoice
```

### D. Payroll Processing Flow

```
Monthly/Bi-weekly Trigger
      │
      ├─ Employee List
      ├─ Attendance Records
      └─ Salary Rates
      │
      ▼
Retrieve Data:
  ├─ Employee Records
  ├─ Attendance Tracking
  ├─ Deductions
  └─ Bonuses
      │
      ▼
Payroll Service API
      │
      ├─ Calculate Base Salary
      ├─ Apply Deductions
      ├─ Add Bonuses
      ├─ Calculate Tax
      └─ Generate Net Amount
      │
      ▼
Generate Salary Slip
      │
      ├─ Display to Employee
      └─ Save in Database
      │
      ▼
Payment Processing
      │
      └─ Mark as Paid
```

---

## 3. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────┐
│   USERS     │
├─────────────┤         ┌──────────────┐
│ user_id (PK)├─────────┤ Logs         │
│ username    │ 1    *  ├──────────────┤
│ password    │         │ log_id (PK)  │
│ full_name   │         │ user_id (FK) │
│ role        │         │ action       │
│ created_at  │         │ timestamp    │
└─────────────┘         └──────────────┘

┌─────────────────┐
│   PRODUCTS      │
├─────────────────┤         ┌──────────────────┐
│ product_id (PK) ├─────────┤ PRODUCTION_      │
│ product_name    │ 1    *  │ RECORDS          │
│ bike_model      │         ├──────────────────┤
│ unit_price      │         │ record_id (PK)   │
│ description     │         │ machine_id       │
│ material_cost   │         │ product_id (FK)  │
└─────────────────┘         │ quantity_produced│
                            │ production_date  │
                            │ operator_id (FK) │
                            │ duration         │
                            │ defects          │
                            └──────────────────┘

┌────────────────┐
│ MATERIALS      │
├────────────────┤         ┌──────────────┐
│ material_id(PK)├─────────┤ MATERIAL_    │
│ supplier_id(FK)│ 1    *  │ USAGE        │
│ material_type  │         ├──────────────┤
│ quantity       │         │ usage_id(PK) │
│ cost_per_unit  │         │ mat_id  (FK) │
│ purchase_date  │         │ prod_id (FK) │
│ last_updated   │         │ qty_used     │
└────────────────┘         │ usage_date   │
                           └──────────────┘

┌────────────────┐
│ SUPPLIERS      │
├────────────────┤
│ supplier_id(PK)│
│ supplier_name  │
│ contact_person │
│ phone          │
│ email          │
│ address        │
│ payment_terms  │
└────────────────┘

┌──────────────────┐
│ UTILITIES        │
├──────────────────┤
│ utility_id (PK)  │
│ meter_reading    │
│ reading_date     │
│ units_consumed   │
│ cost             │
│ billing_date     │
│ payment_status   │
└──────────────────┘

┌──────────────────┐
│ EMPLOYEES        │
├──────────────────┤         ┌──────────────────┐
│ employee_id (PK) ├─────────┤ PAYROLL          │
│ name             │ 1    *  ├──────────────────┤
│ position         │         │ payroll_id (PK)  │
│ hire_date        │         │ emp_id (FK)      │
│ salary_rate      │         │ payment_period   │
│ contact          │         │ base_salary      │
│ status           │         │ deductions       │
│ department       │         │ bonuses          │
└──────────────────┘         │ net_salary       │
                             │ payment_date     │
                             └──────────────────┘

┌─────────────────────┐
│ ATTENDANCE          │
├─────────────────────┤
│ attendance_id (PK)  │
│ employee_id (FK)    │
│ date                │
│ check_in_time       │
│ check_out_time      │
│ total_hours         │
│ overtime_hours      │
│ status              │
└─────────────────────┘

┌─────────────────────┐
│ INVENTORY           │
├─────────────────────┤
│ inventory_id (PK)   │
│ product_id (FK)     │
│ quantity_in_stock   │
│ reorder_level       │
│ max_level           │
│ min_level           │
│ last_updated        │
│ warehouse_location  │
└─────────────────────┘

┌──────────────────────┐
│ INVENTORY_MOVEMENTS  │
├──────────────────────┤
│ movement_id (PK)     │
│ inventory_id (FK)    │
│ product_id (FK)      │
│ quantity             │
│ type (IN/OUT)        │
│ movement_date        │
│ reference (Order/Prod)
│ notes                │
└──────────────────────┘

┌──────────────────────┐
│ SALES_TRANSACTIONS   │
├──────────────────────┤
│ transaction_id (PK)  │
│ product_id (FK)      │
│ customer_name        │
│ quantity             │
│ unit_price           │
│ total_amount         │
│ sale_date            │
│ payment_status       │
│ invoice_id           │
│ notes                │
└──────────────────────┘

┌──────────────────────┐
│ PURCHASE_ORDERS      │
├──────────────────────┤
│ order_id (PK)        │
│ supplier_id (FK)     │
│ material_id (FK)     │
│ quantity             │
│ order_date           │
│ expected_delivery    │
│ actual_delivery      │
│ total_cost           │
│ payment_status       │
│ payment_date         │
└──────────────────────┘

┌──────────────────────┐
│ INVOICES             │
├──────────────────────┤
│ invoice_id (PK)      │
│ transaction_id (FK)  │
│ invoice_date         │
│ invoice_number       │
│ subtotal             │
│ tax                  │
│ total_amount         │
│ due_date             │
│ payment_received     │
│ notes                │
└──────────────────────┘

┌──────────────────────┐
│ FINANCIAL_SUMMARY    │
├──────────────────────┤
│ summary_id (PK)      │
│ period_start         │
│ period_end           │
│ total_sales_revenue  │
│ total_expenses       │
│ material_costs       │
│ labor_costs          │
│ electricity_costs    │
│ other_costs          │
│ gross_profit         │
│ net_profit           │
│ profit_margin %      │
└──────────────────────┘
```

---

## 4. MODULE INTERACTION DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                      MATERIAL MODULE                             │
│  ┌─────────────────────────────────────────────────┐            │
│  │ Create Purchase → Update Inventory              │            │
│  │ ↓                                               │            │
│  │ Trigger: Check Reorder Level                    │            │
│  │ ├─ If LOW → Send Alert to Manager               │            │
│  │ └─ Update Inventory Status                      │            │
│  │                                                 │            │
│  │ Used by: Production Module (Material Usage)     │            │
│  └─────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
                             ▼
         ┌───────────────────────────────────────────┐
         │    PRODUCTION MODULE                      │
         │  ┌──────────────────────────────────────┐ │
         │  │ Log Production Run                   │ │
         │  │ ├─ Update Inventory (Add Finished)   │ │
         │  │ ├─ Deduct Materials Used             │ │
         │  │ ├─ Record Electricity Used           │ │
         │  │ └─ Generate Production Report        │ │
         │  │                                      │ │
         │  │ Interactions:                        │ │
         │  │ ├─ Material Module (Consume)         │ │
         │  │ ├─ Inventory Module (Add Stock)      │ │
         │  │ ├─ Utility Module (Track Usage)      │ │
         │  │ └─ Financial Module (Cost Tracking)  │ │
         │  └──────────────────────────────────────┘ │
         └───────────────────────────────────────────┘
                             ▼
    ┌────────────────────────────────────────────────┐
    │      SALES & INVENTORY MODULE                  │
    │  ┌──────────────────────────────────────────┐  │
    │  │ Create Sales Order                       │  │
    │  │ ├─ Check Inventory Availability          │  │
    │  │ ├─ Create Invoice                        │  │
    │  │ ├─ Update Inventory (Deduct)             │  │
    │  │ ├─ Record Payment                        │  │
    │  │ └─ Update Financial Summary              │  │
    │  │                                          │  │
    │  │ Interactions:                            │  │
    │  │ ├─ Inventory Module (Stock Check/Deduct)│  │
    │  │ ├─ Financial Module (Revenue Tracking)   │  │
    │  │ └─ Reports Module (Invoice Generation)   │  │
    │  └──────────────────────────────────────────┘  │
    └────────────────────────────────────────────────┘
                             ▼
    ┌────────────────────────────────────────────────┐
    │       UTILITY & EMPLOYEE MODULE                │
    │  ┌──────────────────────────────────────────┐  │
    │  │ Record Meter Reading / Payroll            │  │
    │  │ ├─ Calculate Costs/Salaries              │  │
    │  │ ├─ Generate Reports                      │  │
    │  │ └─ Update Financial Summary              │  │
    │  │                                          │  │
    │  │ Interactions:                            │  │
    │  │ └─ Financial Module (Cost Allocation)    │  │
    │  └──────────────────────────────────────────┘  │
    └────────────────────────────────────────────────┘
                             ▼
    ┌────────────────────────────────────────────────┐
    │       FINANCIAL MODULE (Core)                  │
    │  ┌──────────────────────────────────────────┐  │
    │  │ Aggregate All Costs & Revenues           │  │
    │  │ ├─ Calculate Profit/Loss per Product    │  │
    │  │ ├─ Generate Financial Dashboard         │  │
    │  │ ├─ Provide Cost Analysis                │  │
    │  │ └─ Generate Reports                     │  │
    │  │                                          │  │
    │  │ Data Sources:                            │  │
    │  │ ├─ Sales Revenue                        │  │
    │  │ ├─ Material Costs                       │  │
    │  │ ├─ Labor Costs                          │  │
    │  │ ├─ Utility Costs                        │  │
    │  │ └─ Other Expenses                       │  │
    │  └──────────────────────────────────────────┘  │
    └────────────────────────────────────────────────┘
```

---

## 5. SYSTEM WORKFLOW EXAMPLES

### Workflow 1: Complete Daily Production Cycle

```
Start of Day
    │
    ├─→ Record Machine Status
    │   └─→ Production Module
    │
    ├─→ Log Production Run
    │   ├─→ Enter: Machine ID, Operator, Product Type, Quantity, Mold temp
    │   ├─→ System Checks: Plastic Pellet Availability & Quality
    │   └─→ Create Production Record
    │
    ├─→ Production Module Triggers:
    │   ├─→ Material Module: Deduct Used Plastic Pellets (in kg)
    │   ├─→ Inventory Module: Add Finished Goods
    │   ├─→ Utility Module: Record Electricity Usage (kWh)
    │   └─→ Financial Module: Calculate Production Cost
    │
    ├─→ End of Day
    │   ├─→ Generate Daily Production Report
    │   ├─→ Update Inventory Levels
    │   ├─→ Calculate Electricity Cost
    │   ├─→ Calculate Plastic Waste/Scrap
    │   └─→ Update Financial Summary
    │
    └─→ Analysis Dashboard
        └─→ Show KPIs for Today
```

### Workflow 2: Monthly Financial Close

```
Month End
    │
    ├─→ Utility Module
    │   ├─→ Record Final Meter Reading
    │   ├─→ Calculate Total Units Consumed
    │   └─→ Generate Electricity Bill
    │
    ├─→ Employee Module
    │   ├─→ Retrieve Attendance Records
    │   ├─→ Calculate Payroll
    │   ├─→ Generate Salary Slips
    │   └─→ Process Payments
    │
    ├─→ Inventory Module
    │   ├─→ Count Physical Stock
    │   ├─→ Reconcile with System
    │   └─→ Adjust for Discrepancies
    │
    ├─→ Sales & Purchase Module
    │   ├─→ Close All Open Invoices
    │   ├─→ Reconcile Payments
    │   └─→ Record Any Adjustments
    │
    ├─→ Financial Module
    │   ├─→ Aggregate All Data
    │   ├─→ Calculate:
    │   │   ├─ Total Revenue
    │   │   ├─ Material Costs
    │   │   ├─ Labor Costs
    │   │   ├─ Utility Costs
    │   │   ├─ Gross Profit
    │   │   ├─ Net Profit
    │   │   └─ Profit Margin
    │   │
    │   ├─→ Generate Reports:
    │   │   ├─ Monthly Profit & Loss Statement
    │   │   ├─ Cost Breakdown by Product
    │   │   ├─ Profitability Analysis
    │   │   └─ Cost Trends
    │   │
    │   └─→ Create Financial Dashboard
    │
    └─→ Archive & Close Month
        └─→ Lock Previous Month Data (Read-only)
```

---

## 6. SYSTEM SCALING CONSIDERATIONS

### For Small Business (Current Stage):
- Single Database Server
- Single Application Server
- Manual Backups
- Local Hosting Recommended

### For Medium Business (Growth Stage):
- Database Replication (Master-Slave)
- Load Balanced Application Servers
- Automated Backups with Cloud Storage
- Cloud Hosting (AWS, DigitalOcean)
- Caching Layer (Redis)

### For Large Business (Expansion Stage):
- Database Clustering (High Availability)
- Microservices Architecture
- Message Queue (RabbitMQ)
- CDN for Static Assets
- Advanced Analytics
- Multiple Data Centers

---

**End of Architecture Documentation**