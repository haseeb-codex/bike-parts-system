# PLASTIC PELLETS/GRANULES MATERIAL MANAGEMENT
## Detailed Specifications & Features

---

## 1. MATERIAL TYPES & SPECIFICATIONS

### Common Plastic Types for Injection Molding

| Material Type | Code | Properties | Common Uses | Density |
|--------------|------|-----------|-----------|---------|
| Polypropylene (PP) | PP | Light, durable, low cost | Footrests, handles | 0.9 g/cm³ |
| Acrylonitrile Butadiene Styrene | ABS | Strong, rigid, glossy | Mirrors, headlights | 1.04 g/cm³ |
| Polyethylene (PE) | PE | Flexible, tough | Mud flaps, covers | 0.92-0.97 g/cm³ |
| Polycarbonate (PC) | PC | Clear, strong, heat resistant | Reflectors, lenses | 1.2 g/cm³ |
| Polyoxymethylene (POM/Acetal) | POM | Rigid, smooth, low friction | Footrest hinges | 1.41 g/cm³ |

---

## 2. MATERIAL MANAGEMENT DATABASE SCHEMA

### Materials Table (Enhanced)

```sql
CREATE TABLE materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) NOT NULL,
    material_code VARCHAR(20) NOT NULL UNIQUE,
    material_type ENUM('PP', 'ABS', 'PE', 'PC', 'POM', 'OTHER') NOT NULL,
    color VARCHAR(50),
    density DECIMAL(5,3) COMMENT 'g/cm³',
    supplier_id INT NOT NULL,
    quantity_in_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    reorder_level_kg DECIMAL(10,2) NOT NULL,
    max_storage_kg DECIMAL(10,2),
    cost_per_kg DECIMAL(8,2) NOT NULL,
    last_purchase_date DATE,
    last_purchase_cost_per_kg DECIMAL(8,2),
    purchase_currency VARCHAR(3) DEFAULT 'PKR',
    storage_location VARCHAR(100),
    warehouse_temperature_optimal INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    INDEX (material_type),
    INDEX (quantity_in_kg)
);
```

### Material Purchases Table (Enhanced)

```sql
CREATE TABLE material_purchases (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    supplier_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    cost_per_kg DECIMAL(8,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Partially Paid') DEFAULT 'Pending',
    payment_date DATE,
    batch_number VARCHAR(50),
    invoice_number VARCHAR(50),
    quality_grade ENUM('A', 'B', 'C') DEFAULT 'A',
    receipt_date DATE,
    received_by INT,
    storage_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (received_by) REFERENCES employees(employee_id),
    INDEX (purchase_date),
    INDEX (payment_status)
);
```

### Material Usage Table (Production Tracking)

```sql
CREATE TABLE material_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    production_record_id INT NOT NULL,
    material_id INT NOT NULL,
    batch_number VARCHAR(50),
    quantity_used_kg DECIMAL(10,2) NOT NULL,
    waste_scrap_kg DECIMAL(10,2) DEFAULT 0,
    yield_percentage DECIMAL(5,2) COMMENT 'Percentage of material converted to finished product',
    usage_date DATE NOT NULL,
    usage_time TIME,
    machine_id INT NOT NULL,
    operator_id INT NOT NULL,
    mold_temperature INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (production_record_id) REFERENCES production_records(record_id),
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
    FOREIGN KEY (operator_id) REFERENCES employees(employee_id),
    INDEX (usage_date),
    INDEX (material_id)
);
```

### Material Inventory Movement Table

```sql
CREATE TABLE material_inventory_movements (
    movement_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    movement_type ENUM('Purchase', 'Usage', 'Waste', 'Adjustment', 'Return') NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    quantity_change_kg DECIMAL(10,2) COMMENT 'Positive for inflow, negative for outflow',
    previous_balance_kg DECIMAL(10,2),
    new_balance_kg DECIMAL(10,2),
    reference_id INT COMMENT 'Links to purchase_id or usage_id',
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT,
    notes TEXT,
    
    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id),
    INDEX (material_id),
    INDEX (movement_date)
);
```

### Supplier Information Table

```sql
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    payment_terms VARCHAR(100),
    lead_time_days INT COMMENT 'Days from order to delivery',
    quality_rating DECIMAL(3,2) COMMENT 'Average quality from 1-5',
    price_rating DECIMAL(3,2) COMMENT 'Competitiveness from 1-5',
    reliability_rating DECIMAL(3,2) COMMENT 'On-time delivery from 1-5',
    status ENUM('Active', 'Inactive', 'Blocked') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX (supplier_name),
    INDEX (status)
);
```

---

## 3. MATERIAL MANAGEMENT MODULE - DETAILED FEATURES

### 3.1 Purchase Management

#### Features:
- **Supplier Management**
  - Maintain supplier contact information
  - Track quality ratings and delivery performance
  - Compare prices from multiple suppliers
  - Calculate lead times

- **Purchase Order Creation**
  - Create PO with quantity and delivery date
  - Automatic cost calculation
  - Approval workflow (for orders above threshold)
  - Send PO to supplier (email integration)

- **Purchase Tracking**
  - Track order status (Pending, Shipped, Delivered)
  - Expected vs actual delivery dates
  - Quantity received vs ordered
  - Quality inspection upon receipt
  - Batch tracking with material traceability

- **Invoice & Payment Management**
  - Match invoice with PO
  - Track payment status
  - Payment scheduling
  - Late payment alerts

### 3.2 Inventory Tracking

#### Real-time Features:
- **Current Stock Levels**
  - Display available quantity in kg
  - Show stock as percentage of max capacity
  - Visual indicators (color-coded: Red<Low, Yellow<Normal, Green>Safe)

- **Inventory Alerts**
  - Stock below reorder level → Trigger alert
  - Stock above max storage → Warning
  - Material approaching expiry → Alert (if applicable)
  - Slow-moving inventory → Analysis

- **Storage Management**
  - Assign storage location (Bin A, B, C, etc.)
  - Temperature monitoring (for sensitive materials)
  - Humidity tracking
  - Physical location tracking

- **Batch Management**
  - Assign unique batch numbers
  - Track batch quality grade
  - FIFO (First In, First Out) enforcement
  - Batch expiry tracking

### 3.3 Material Usage Tracking

#### Production Integration:
- **Automatic Deduction**
  - When production run logged, automatically deduct used material
  - Track by batch number for traceability

- **Waste & Scrap Tracking**
  - Record scrap/waste percentage per production run
  - Calculate yield percentage
  - Identify high-waste products/processes
  - Track scrap disposal

- **Cost Per Unit Calculation**
  - Calculate material cost per finished unit
  - Formula: (Total Material Cost) / (Units Produced)
  - Track cost trends over time
  - Identify cost-saving opportunities

### 3.4 Reporting & Analysis

#### Reports Available:

1. **Material Consumption Report**
   ```
   Product: Mud Flap CD70
   Material: PP (Gray)
   Period: Jan 2024
   
   Total Units Produced: 5,000
   Total Material Used: 250 kg
   Cost Per Unit: PKR 15
   Waste/Scrap: 25 kg (10%)
   Yield: 90%
   ```

2. **Inventory Status Report**
   ```
   Material: ABS Black
   Current Stock: 500 kg
   Reorder Level: 200 kg
   Max Storage: 2,000 kg
   Status: SAFE
   Days of Stock: 20 days (at current usage)
   Last Purchase: 15 days ago @ PKR 450/kg
   ```

3. **Supplier Performance Report**
   ```
   Supplier: ABC Plastics Ltd
   Quality Rating: 4.5/5
   Price Competitiveness: 3.8/5
   Delivery Reliability: 4.2/5
   Average Lead Time: 7 days
   Last Purchase: 10 days ago (150 kg @ PKR 450/kg)
   ```

4. **Material Cost Analysis**
   ```
   Product: Footrest CD125
   Material Cost: PKR 25 per unit
   Trending: ↓ Down 5% from last month
   Cost Comparison with Competitors: Competitive
   Potential Savings: PKR 2 per unit (8%)
   ```

---

## 4. MATERIAL MANAGEMENT WORKFLOW

### Purchase Order Flow

```
1. Identify Need
   ↓
   - Check current inventory
   - Calculate required quantity
   - Consider lead time
   ↓
2. Create Purchase Order
   ↓
   - Select supplier
   - Enter quantity & delivery date
   - Set auto-approval for small orders
   ↓
3. Send to Supplier
   ↓
   - Generate PDF PO
   - Send via email
   - Track delivery confirmation
   ↓
4. Track Delivery
   ↓
   - Monitor expected delivery date
   - Update status when shipped
   - Prepare for receipt
   ↓
5. Receive & Inspect
   ↓
   - Check quantity (Should match order)
   - Inspect quality (Grade A/B/C)
   - Assign batch number
   - Scan invoice
   ↓
6. Store & Record
   ↓
   - Assign storage location
   - Update system inventory
   - Create material batch record
   ↓
7. Invoice & Payment
   ↓
   - Match invoice with PO
   - Schedule payment
   - Record payment date
   ↓
8. Complete
   └─ Purchase order closed
```

### Material Usage Flow (During Production)

```
Production Start
    ↓
1. Select Material for Production
   ├─ Choose material type (PP, ABS, etc.)
   ├─ Choose specific batch
   ├─ Verify material quality
   └─ Check stock availability
    ↓
2. Log Production Run
   ├─ Enter material quantity to be used
   ├─ Record starting material weight
   └─ Record batch number
    ↓
3. Production Process
   ├─ Monitor material flow
   ├─ Track waste/scrap during run
   └─ Record actual consumption
    ↓
4. Complete Production
   ├─ Record finishing material weight
   ├─ Calculate total material used
   ├─ Measure scrap/waste produced
   └─ Log production output
    ↓
5. Auto-Update Inventory
   ├─ Deduct used material from stock
   ├─ Update batch quantity
   ├─ Calculate yield percentage
   └─ Trigger alert if stock low
    ↓
6. Financial Tracking
   ├─ Calculate material cost for batch
   ├─ Calculate cost per unit
   └─ Update production cost record
    ↓
Production Complete
```

---

## 5. KEY CALCULATIONS & FORMULAS

### Material-Related Calculations

#### 1. Cost Per Unit Produced
```
Material Cost Per Unit = (Total Material Used in kg × Cost per kg) / Units Produced

Example:
Material Used: 250 kg PP @ PKR 400/kg = PKR 100,000
Units Produced: 5,000 mud flaps
Cost Per Unit = 100,000 / 5,000 = PKR 20 per unit
```

#### 2. Yield Percentage
```
Yield % = (Units Produced / (Total Material Used ÷ Material Per Unit)) × 100

Or simpler:
Yield % = ((Total Material - Scrap) / Total Material) × 100

Example:
Material Used: 250 kg
Scrap/Waste: 25 kg
Usable: 225 kg
Yield = (225 / 250) × 100 = 90%
```

#### 3. Days of Stock Remaining
```
Days Remaining = Current Stock (kg) / Average Daily Consumption (kg)

Example:
Current Stock: 500 kg
Average Daily Usage: 25 kg/day
Days Remaining = 500 / 25 = 20 days

Action: If 20 days > Reorder Lead Time (7 days), OK
        If 20 days < Reorder Lead Time (7 days), ORDER NOW
```

#### 4. Material Cost Variance
```
Cost Variance = (Actual Cost - Standard Cost) / Standard Cost × 100

Example:
Previous Purchase Cost: PKR 400/kg
Current Purchase Cost: PKR 420/kg
Variance = (420 - 400) / 400 × 100 = 5% increase
```

#### 5. Reorder Quantity Calculation
```
Reorder Qty = (Average Daily Consumption × Lead Time) + Safety Stock

Example:
Average Daily Use: 25 kg/day
Lead Time: 7 days
Safety Stock: 50 kg (for emergencies)
Reorder Qty = (25 × 7) + 50 = 225 kg

So order when stock reaches 225 kg
```

---

## 6. USER INTERFACE FEATURES FOR MATERIAL MANAGEMENT

### Dashboard Widgets

**Material Inventory Widget**
```
┌─────────────────────────────────┐
│ MATERIAL INVENTORY STATUS       │
├─────────────────────────────────┤
│ PP (Gray)           │ 1,200 kg  │
│ Stock Level: ████████ (60%)     │
│ Status: SAFE        │ ✓ OK      │
│                                 │
│ ABS (Black)         │   150 kg  │
│ Stock Level: ███░░░░ (20%)      │
│ Status: LOW STOCK   │ ⚠️ Order  │
│                                 │
│ PE (Natural)        │   800 kg  │
│ Stock Level: ████████░ (80%)    │
│ Status: SAFE        │ ✓ OK      │
└─────────────────────────────────┘
```

**Cost Trend Widget**
```
Material Cost Trend (Last 12 Months)

PP Cost/kg
PKR 450  │
         │     ╱╲
PKR 400  │ ╱╲ ╱  ╲  ╱╲
         │╱  ╲╱    ╲╱  ╲
PKR 350  │
         │ Jan Feb Mar Apr May Jun...
```

**Reorder Alerts Widget**
```
┌──────────────────────────────────┐
│ REORDER ALERTS                   │
├──────────────────────────────────┤
│ 🔴 URGENT: PP (Gray)             │
│    Current: 100 kg               │
│    Reorder Level: 200 kg         │
│    Action: ORDER IMMEDIATELY     │
│                                  │
│ 🟡 WARNING: ABS (Black)          │
│    Current: 180 kg               │
│    Reorder Level: 200 kg         │
│    Action: ORDER SOON             │
│                                  │
│ 🟢 OK: PE (Natural)              │
│    Current: 800 kg               │
│    Status: SAFE                  │
└──────────────────────────────────┘
```

### Forms & Entry Pages

**Material Purchase Form**
```
┌─────────────────────────────────────┐
│ NEW MATERIAL PURCHASE               │
├─────────────────────────────────────┤
│                                     │
│ Material Type: [ABS (Black)    ▼]  │
│ Supplier: [ABC Plastics Ltd    ▼]  │
│ Quantity (kg): [______500______]    │
│ Cost per kg: [______420_______]     │
│ Total Cost: [    PKR 210,000   ]    │
│ Expected Delivery: [2024-02-15 ]    │
│ Batch Number: [______________]     │
│ Quality Grade: [Grade A ▼]          │
│                                     │
│ [Submit] [Cancel]                   │
└─────────────────────────────────────┘
```

**Material Usage Entry (During Production)**
```
┌──────────────────────────────────────┐
│ LOG MATERIAL USAGE                   │
├──────────────────────────────────────┤
│                                      │
│ Production Run ID: #P00123           │
│ Product: [Mud Flap CD70 ▼]          │
│ Material: [PP (Gray) ▼]              │
│ Batch Number: [BATCH-2024-001]       │
│                                      │
│ Quantity Used (kg): [____250______] │
│ Waste/Scrap (kg): [____25_______]  │
│ Yield %: [90%]                      │
│                                      │
│ Mold Temperature: [220°C]            │
│ Machine ID: [Machine 1]              │
│ Operator: [Ahmad Khan]               │
│                                      │
│ [Record] [Cancel]                    │
└──────────────────────────────────────┘
```

---

## 7. ALERTS & NOTIFICATIONS

### Automatic Alerts

1. **Stock Below Reorder Level**
   - Alert: Email to manager
   - Suggestion: Create purchase order
   - Auto-action: Can auto-create PO for frequent orders

2. **Material Cost Increase**
   - Alert: When material cost increases >5%
   - Message: "PP cost increased from PKR 400 to PKR 420/kg"
   - Action: Review supplier, consider alternatives

3. **Quality Grade Degradation**
   - Alert: If material grade drops from A to B/C
   - Message: "New batch of ABS is Grade B (lower quality)"
   - Action: Verify with supplier, consider alternative

4. **Slow-Moving Inventory**
   - Alert: Material not used in 30 days
   - Message: "PE (Natural) - No usage for 30 days"
   - Action: Review forecasts, consider return to supplier

5. **Supplier Lead Time Issues**
   - Alert: If delivery is late
   - Message: "ABC Plastics - Expected delivery was 7 days ago"
   - Action: Follow up with supplier

6. **Batch Expiry Alert**
   - Alert: Before material expires (if applicable)
   - Message: "PP Batch #2024-001 expires in 7 days"
   - Action: Prioritize this batch for production

---

## 8. SAMPLE REPORTS

### Monthly Material Consumption Report

```
MATERIAL CONSUMPTION REPORT - JANUARY 2024

Material: PP (Gray)
─────────────────────────────────────
Opening Stock:        1,000 kg
Purchases:            +500 kg (2 orders)
  - Jan 5: 200 kg @ PKR 400/kg
  - Jan 20: 300 kg @ PKR 415/kg

Production Usage:     -425 kg
  - Mud Flaps CD70:   -250 kg
  - Footrests:        -175 kg

Waste/Scrap:          -45 kg
Closing Stock:        1,030 kg

Total Material Cost:  PKR 407,500
Avg Cost per kg:      PKR 407.50

Material Usage Efficiency: 90.4%
Cost Variance:        +2.5% (vs plan)

Products Manufactured:
  - Mud Flaps: 5,000 units (PKR 20/unit material)
  - Footrests: 3,500 units (PKR 5/unit material)
```

### Supplier Performance Report

```
SUPPLIER PERFORMANCE REPORT - Q1 2024

Supplier: ABC Plastics Ltd
─────────────────────────────────────
Total Purchases:      10 orders
Total Quantity:       2,500 kg
Total Spend:          PKR 1,025,000
Avg Cost per kg:      PKR 410

Quality Grade Distribution:
  - Grade A:  90% of orders ✓
  - Grade B:  10% of orders
  - Grade C:  0%

Delivery Performance:
  - On-time:           80% (8/10)
  - Late:              20% (2/10)
  - Avg Lead Time:     6.8 days
  - Avg Delay:         2.5 days

Quality Rating:       4.2/5 ⭐
Price Rating:         3.9/5 ⭐
Reliability Rating:   4.0/5 ⭐

Overall Score:        4.0/5 (Good)
Recommendation:       Continue with current supplier
                      Discuss quality improvements
```

---

## 9. INTEGRATION WITH OTHER MODULES

### Material → Production
- Check material availability before starting production
- Automatically deduct material when production logged
- Calculate material cost for each production batch

### Material → Financial
- Track material costs as major expense category
- Calculate cost per unit including material
- Generate cost variance reports
- Material cost trending

### Material → Inventory
- Finished goods dependent on material availability
- Can't produce without adequate material stock
- Waste tracking affects inventory accuracy

### Material → Supplier Management
- Supplier ratings based on quality and delivery
- Track supplier costs and pricing trends
- Manage supplier relationships and contact info

---

**End of Plastic Pellets/Granules Material Management Specification**