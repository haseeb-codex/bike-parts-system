# BIKE SPARE PARTS BUSINESS MANAGEMENT SYSTEM
## Technical Document & System Architecture

**Version:** 1.0  
**Date:** March 2026  
**Status:** Initial Release

---

## TABLE OF CONTENTS

1. Executive Summary
2. Business Overview
3. System Requirements
4. System Architecture
5. Module Descriptions
6. Database Schema
7. User Interface Design
8. Implementation Plan
9. Security Considerations
10. Deployment & Maintenance

---

## 1. EXECUTIVE SUMMARY

This document outlines a comprehensive business management system designed specifically for a small-scale bike spare parts manufacturing business. The system will manage production through injection molding machines, handle supply chain operations, track financial metrics, and manage human resources.

### Key Objectives:

- Automate raw material (plastic pellets/granules) purchase tracking
- Monitor production output (mud flaps, footrests, headlight mirrors)
- Track electricity consumption and billing
- Manage employee salary records and payroll
- Maintain inventory of finished products and raw materials
- Track sales, purchases, and profitability analysis

---

## 2. BUSINESS OVERVIEW

### 2.1 Current Operations

The business operates with the following structure:

| Component | Details |
|-----------|---------|
| Production Machines | 2 Injection molding machines |
| Raw Materials | Plastic pellets/granules (polymers) |
| Products | Mud flaps, footrests, headlight mirrors |
| Bike Models | Honda CD70, CD125, Honda 125 |

### 2.2 Products Overview

- **Mud Flaps:** Protective covers for CD70, CD125
- **Footrests:** Driver and passenger foot support
- **Headlight Mirrors:** Reflectors for CD70

---

## 3. SYSTEM REQUIREMENTS

### 3.1 Functional Requirements

#### 3.1.1 Material Management Module
- Record purchase of plastic pellets/granules (quantity, cost, supplier, date)
- Track material inventory levels
- Set reorder alerts when stock falls below threshold
- Calculate material cost per unit of finished product

#### 3.1.2 Production Management Module
- Log daily production runs per machine
- Record production output by product type and bike model
- Track machine maintenance schedules
- Calculate production efficiency metrics

#### 3.1.3 Utility Management Module
- Record electricity meter readings (date, units consumed)
- Track electricity bills and payments
- Calculate cost per unit of production
- Generate electricity expense reports

#### 3.1.4 Employee Management Module
- Maintain employee records (name, contact, position)
- Manage salary structures and rates
- Track attendance and working hours
- Calculate salary slips and payroll
- Manage deductions and bonuses

#### 3.1.5 Inventory Management Module
- Track finished product inventory by SKU
- Record stock movements (in/out)
- Generate inventory reports and analysis
- Set minimum and maximum stock levels

#### 3.1.6 Sales & Purchase Module
- Record sales transactions (date, product, quantity, customer, price)
- Manage purchase orders from suppliers
- Track payment status
- Generate sales invoices

#### 3.1.7 Profitability & Loss Analysis Module
- Calculate profit/loss by product
- Generate cost analysis (material, electricity, labor)
- Track gross and net profit
- Provide financial dashboard and reports

### 3.2 Non-Functional Requirements

- **Performance:** Response time < 2 seconds for all operations
- **Scalability:** Support up to 1000 daily transactions
- **Reliability:** 99% uptime, automatic backups
- **Usability:** Simple UI for non-technical users
- **Security:** User authentication, data encryption

---

## 4. SYSTEM ARCHITECTURE

### 4.1 Architecture Overview

The system follows a three-tier architecture model:

```
┌─────────────────────────────────────────────────────┐
│          PRESENTATION LAYER (Web/Mobile)            │
│  ├─ Dashboard                                       │
│  ├─ Forms & Data Entry                              │
│  ├─ Reports & Analytics                             │
│  └─ Mobile Interface                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           BUSINESS LOGIC LAYER (API)                │
│  ├─ Material Management                             │
│  ├─ Production Management                           │
│  ├─ Utility Management                              │
│  ├─ Employee Management                             │
│  ├─ Inventory Management                            │
│  ├─ Sales & Purchase                                │
│  └─ Financial Analysis                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            DATA LAYER (Database)                    │
│  ├─ Users Table                                     │
│  ├─ Materials Table                                 │
│  ├─ Production Records Table                        │
│  ├─ Utilities Table                                 │
│  ├─ Employees Table                                 │
│  ├─ Inventory Table                                 │
│  ├─ Transactions Table                              │
│  └─ Financial Records Table                         │
└─────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|----------------|
| Frontend | React.js / React Native | Modern, responsive UI |
| Backend | Node.js / Express.js | Scalable, easy to maintain |
| Database | PostgreSQL / MySQL | Relational, reliable |
| Hosting | AWS / DigitalOcean / Local Server | Flexible deployment options |

---

## 5. MODULE DESCRIPTIONS

### 5.1 Material Management Module

**Purpose:** Track raw material (plastic pellets/granules) purchases and inventory.

**Key Features:**
- Add new material suppliers
- Record material purchases (quantity in kg/tons, cost per unit, date)
- Track inventory balance in storage
- Material reorder alerts
- Cost analysis per batch
- Usage tracking during production

### 5.2 Production Management Module

**Purpose:** Manage daily production activities across injection molding machines.

**Key Features:**
- Log production runs (machine, date, operator, duration)
- Record output per product type and bike model
- Track quality/defects
- Machine maintenance scheduler
- Production efficiency dashboard

### 5.3 Utility Management Module

**Purpose:** Monitor electricity usage and costs.

**Key Features:**
- Record meter readings (date, units)
- Track electricity billing
- Calculate consumption per unit of production
- Monthly/yearly expense trends

### 5.4 Employee Management Module

**Purpose:** Manage employee records and payroll.

**Key Features:**
- Employee profiles (name, contact, position, hire date)
- Salary and wage management
- Attendance tracking
- Payroll generation
- Bonus and deduction management

### 5.5 Inventory Management Module

**Purpose:** Track finished products in stock.

**Key Features:**
- Product SKU management
- Stock level monitoring
- Inventory movement tracking
- Stock alerts and reordering
- Inventory reports

### 5.6 Sales & Purchase Module

**Purpose:** Manage sales transactions and purchase orders.

**Key Features:**
- Customer management
- Sales order creation and invoicing
- Purchase order management
- Payment tracking
- Sales reports

### 5.7 Financial Analysis Module

**Purpose:** Comprehensive profit/loss and cost analysis.

**Key Features:**
- Cost breakdown by product (material, labor, electricity)
- Profit/loss by product and period
- Financial dashboard
- Custom report generation
- Trend analysis

---

## 6. DATABASE SCHEMA

### 6.1 Core Tables

#### Users Table
Stores user login credentials and profile information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| user_id | INT | PK, Auto | Unique identifier |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Encrypted password |
| full_name | VARCHAR(150) | NOT NULL | Full name of user |
| role | VARCHAR(50) | NOT NULL | admin/manager/staff |

#### Products Table
Stores product information and SKUs.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| product_id | INT | PK, Auto | Product ID |
| product_name | VARCHAR(100) | NOT NULL | Product name |
| bike_model | VARCHAR(50) | NOT NULL | CD70, CD125, etc |
| unit_price | DECIMAL | NOT NULL | Selling price |

### 6.2 Additional Key Tables Summary

- **Materials:** material_id, supplier_name, material_type (e.g., ABS, PP, PE), quantity_in_kg, cost_per_kg, purchase_date, warehouse_location
- **Production_Records:** record_id, machine_id, product_id, quantity_produced, production_date, operator_id
- **Utilities:** utility_id, meter_reading, reading_date, units_consumed, cost, billing_date
- **Employees:** employee_id, name, position, hire_date, salary, status
- **Inventory:** inventory_id, product_id, quantity_in_stock, reorder_level, last_updated
- **Sales_Transactions:** transaction_id, product_id, quantity, customer_name, sale_date, amount
- **Purchase_Orders:** order_id, supplier_id, material_id, quantity, order_date, payment_status

---

## 7. USER INTERFACE DESIGN

### 7.1 Dashboard Layout

The main dashboard provides a quick overview of key metrics:

- **KPI Cards:** Daily revenue, total expenses, profit margin
- **Charts:** Production vs sales, monthly profit trend
- **Alerts:** Low stock items, overdue payments
- **Quick Actions:** Add new transaction, record production

### 7.2 Menu Structure

```
📊 Dashboard
📦 Materials
⚙️  Production
💡 Utilities
👥 Employees
📦 Inventory
💰 Sales & Purchase
📈 Financial Reports
⚙️  Settings & User Management
```

---

## 8. IMPLEMENTATION PLAN

### 8.1 Phase 1: Planning & Design (Week 1-2)
- Define detailed requirements and user flows
- Create UI mockups and wireframes
- Design database schema
- Set up development environment

### 8.2 Phase 2: Backend Development (Week 3-6)
- Implement database and ORM models
- Develop API endpoints for all modules
- Implement authentication and authorization
- Build business logic for calculations

### 8.3 Phase 3: Frontend Development (Week 7-10)
- Build React components for all modules
- Implement forms and data entry interfaces
- Create reports and analytics views
- Integrate with backend APIs

### 8.4 Phase 4: Testing & QA (Week 11-12)
- Unit testing for backend logic
- Integration testing
- User acceptance testing (UAT)
- Bug fixes and optimization

### 8.5 Phase 5: Deployment (Week 13)
- Set up production environment
- Deploy application
- Data migration and backup
- User training

### 8.6 Phase 6: Maintenance & Support (Ongoing)
- Monitor system performance
- Regular backups
- Bug fixes and updates
- User support

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Authentication & Authorization

- Implement JWT (JSON Web Tokens) for user sessions
- Role-based access control (RBAC)
- Two-factor authentication (2FA) for admin accounts
- Password hashing using bcrypt

### 9.2 Data Security

- SSL/TLS encryption for data in transit
- Encrypt sensitive data at rest
- Regular database backups
- SQL injection prevention (use parameterized queries)

### 9.3 Application Security

- Input validation and sanitization
- CSRF (Cross-Site Request Forgery) protection
- XSS (Cross-Site Scripting) prevention
- Rate limiting on API endpoints

### 9.4 Audit & Logging

- Log all user actions (audit trail)
- Monitor system errors and exceptions
- Regular security audits

---

## 10. DEPLOYMENT & MAINTENANCE

### 10.1 Deployment Options

**Option 1: Cloud Deployment (AWS/DigitalOcean)**
- Pros: Scalable, automatic backups, easy updates
- Cons: Monthly subscription cost

**Option 2: Local Server**
- Pros: No subscription, offline capability
- Cons: Requires manual maintenance

**Recommendation:** Start with cloud (easier maintenance), migrate to local later if needed.

### 10.2 Maintenance Tasks

- **Daily:** Monitor system health
- **Weekly:** Database backups
- **Monthly:** Security patches and updates
- **Quarterly:** Performance optimization

### 10.3 Backup Strategy

- Automatic daily backups
- Keep 30-day retention
- Test restore procedures monthly

---

## APPENDIX: API ENDPOINT SUMMARY

### Materials API
```
POST   /api/materials          - Add new material purchase
GET    /api/materials          - Get all materials
GET    /api/materials/:id      - Get material details
PUT    /api/materials/:id      - Update material
DELETE /api/materials/:id      - Delete material
```

### Production API
```
POST   /api/production         - Log production run
GET    /api/production         - Get production records
GET    /api/production/stats   - Get production statistics
```

### Utilities API
```
POST   /api/utilities          - Record meter reading
GET    /api/utilities          - Get utility records
GET    /api/utilities/cost     - Calculate cost analysis
```

### Employees API
```
POST   /api/employees          - Add new employee
GET    /api/employees          - Get all employees
PUT    /api/employees/:id      - Update employee
POST   /api/payroll            - Generate payroll
```

### Inventory API
```
POST   /api/inventory          - Record inventory movement
GET    /api/inventory          - Get inventory status
GET    /api/inventory/low      - Get low stock items
```

### Sales API
```
POST   /api/sales              - Record sales transaction
GET    /api/sales              - Get sales records
POST   /api/invoices           - Generate invoice
```

### Financial API
```
GET    /api/financial/summary  - Get financial summary
GET    /api/financial/profit   - Get profit/loss analysis
GET    /api/financial/costs    - Get cost breakdown
```

---

**Document End**