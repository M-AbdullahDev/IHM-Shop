# 👑 ZYRO Premium Retail POS - Cloud Sync & Setup Guide

Welcome to the **ZYRO** Retail Management System. This system is designed with an **offline-first hybrid architecture**, storing all local sales, cache, and configuration in the browser's persistent storage, and seamlessly synchronizing with **Supabase Cloud Database** in real-time when an internet connection is available.

> [!IMPORTANT]  
> If you are setting up this system for a new client or switching to the **Owner's database account**, please follow the step-by-step instructions below.

---

## ⚡ How to Switch Database to the Owner's Account

To switch the system's cloud database from the default development database to the owner's personal or business account, follow these **7 steps**:

### Step 1: Create a Supabase Account
1. Go to [supabase.com](https://supabase.com) and click **Sign Up** or **Sign In**.
2. Have the business owner register or log in using their company credentials.

### Step 2: Set Up a New Project
1. In the Supabase Dashboard, click **New Project**.
2. Select your Organization, enter a project name (e.g., `Zyro Retail`), choose a secure Database Password, and select the region closest to your physical store.
3. Click **Create new project** and wait a few minutes for the database to provision.

### Step 3: Run the Database Initialization Script
1. Once the project is ready, navigate to the **SQL Editor** tab from the left-hand sidebar menu.
2. Click **New Query**.
3. Copy and paste the entire schema script from [supabase_schema.sql](file:///e:/huzaifa%20Qadir/supabase_schema.sql) (shown below) and click **Run**:

```sql
-- Create the organized inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,                       -- Alphanumeric variant key (e.g., shirt_black_s_v1)
    name TEXT NOT NULL,                        -- Product name
    type TEXT NOT NULL,                        -- Category (e.g., Shirt, Polo, Trouser, Tank Top)
    style TEXT DEFAULT 'Plain',                -- Style classification
    size TEXT NOT NULL,                        -- Size (S, M, L, XL, XXL)
    color TEXT NOT NULL,                       -- Display color name
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    price NUMERIC(10, 2) NOT NULL,             -- Selling price
    cost_price NUMERIC(10, 2) DEFAULT 0.00,    -- Unit cost price
    low_stock INTEGER NOT NULL DEFAULT 5,       -- Alert threshold level
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create performance search indexes for fast loading and filtering
CREATE INDEX IF NOT EXISTS idx_inventory_type ON public.inventory(type);
CREATE INDEX IF NOT EXISTS idx_inventory_color_size ON public.inventory(color, size);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON public.inventory(quantity);
```

### Step 4: Enable Realtime for Live Sync
To allow live inventory updates across multiple registers or dashboard screens instantly:
1. In your Supabase Dashboard, go to **Database** -> **Replication** (or **Publications**).
2. Edit the `supabase_realtime` publication.
3. Enable replication for the `inventory` table.

### Step 5: Configure Row Level Security (RLS)
By default, Supabase blocks unauthorized access to the database. Since the POS terminal acts as a client interface, you must configure RLS to allow operations. 
Run the following policy rules in the **SQL Editor**:

```sql
-- 1. Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 2. Create Public Read Access Policy
DROP POLICY IF EXISTS "Allow public read access" ON public.inventory;
CREATE POLICY "Allow public read access" ON public.inventory FOR SELECT USING (true);

-- 3. Create Public Insert Policy
DROP POLICY IF EXISTS "Allow public insert access" ON public.inventory;
CREATE POLICY "Allow public insert access" ON public.inventory FOR INSERT WITH CHECK (true);

-- 4. Create Public Update Policy
DROP POLICY IF EXISTS "Allow public update access" ON public.inventory;
CREATE POLICY "Allow public update access" ON public.inventory FOR UPDATE USING (true);

-- 5. Create Public Delete Policy
DROP POLICY IF EXISTS "Allow public delete access" ON public.inventory;
CREATE POLICY "Allow public delete access" ON public.inventory FOR DELETE USING (true);
```

### Step 6: Connect the Web App to the New Database
Now you need to replace the old credentials in the web application:
1. Open the file [js/supabase.js](file:///e:/huzaifa%20Qadir/js/supabase.js) in your text editor.
2. In the Supabase project dashboard, navigate to **Project Settings** -> **API**.
3. Copy the **Project API URL** and the **anon public API Key**.
4. Update lines 11 & 12 of `js/supabase.js`:

```javascript
const SupabaseManager = {
    // ---------------------------------------------------------
    // CONFIGURATION (Update with the Owner's Supabase project details)
    // ---------------------------------------------------------
    url: 'YOUR_NEW_SUPABASE_PROJECT_URL',
    key: 'YOUR_NEW_SUPABASE_ANON_PUBLIC_KEY',
    client: null,
    
    // ...
}
```

### Step 7: Perform a Fresh Sync
1. Open the **ZYRO** admin dashboard in your web browser.
2. If there is already older product data cached in your browser that you want to clear, click on the **Cloud Active / Synced Status Indicator** in the header.
3. Confirm the prompt: *"Clear local browser storage cache and fetch all products fresh from Supabase?"*.
4. This will clear the local storage shell and download the active inventory directly from the new owner's database.

---

## 🏷️ Percentage-Based Discount System

Discounts in the checkout terminal are calculated using a **percentage-based (%)** entry system for clean retail calculations:

1. **Applying a Discount**: Click the **Discount** button in the POS terminal.
2. **Entering the Percentage**: Type the percentage value (e.g., `10` for a 10% discount).
3. **Calculation & Storage**:
   * The system automatically computes: `Discount Amount = Subtotal * (Discount Percentage / 100)`.
   * The order total is adjusted dynamically in real-time.
   * Both `discountPercent` and `discount` (calculated flat Rs. amount) are recorded inside the transaction logs for backwards compatibility with sales reports and accounting tools.
4. **Receipt Generation**:
   * The printed thermal receipt automatically shows the discount rate alongside the saved money: `DISCOUNT (10%)` | `- Rs. 450.00`.
   * Historical receipts in the vault will load percentage values dynamically with backward compatibility for legacy flat-rate transactions.

---

## 💻 Running ZYRO on a New Laptop / Browser (Data Portability)

Because ZYRO stores live transactional registers in local browser memory (`localStorage`) for offline robustness, moving the project to a **new laptop** or **different browser** results in an empty dashboard initially.

To retrieve and populate all data onto the new machine:
1. Copy the project files to the new laptop.
2. Verify that your [js/supabase.js](file:///e:/huzaifa%20Qadir/js/supabase.js) has the correct **Owner's Supabase URL and Key**.
3. Open the web app and navigate to the **Settings** page.
4. Locate the **Cloud Synchronization** panel and click **Download from Cloud**.
5. Confirm the overwrite prompt: *"Are you sure you want to download all inventory data from Supabase Cloud?"*.
6. The POS system will query the owner's active database and load all products automatically.

---

## 🔄 Rich Manual Synchronization & Loaders

Manual cloud synchronization triggers feature custom interactive feedback animations and state confirmations:
* **Interactive Animations:** When clicking **Upload to Cloud** or **Download from Cloud** (on both the Settings panel and the Ledger Page header):
  1. The clicked button immediately disables to prevent double-submissions.
  2. The cloud icon transforms into a spinning loading indicator (`fa-spinner fa-spin`).
  3. The label updates dynamically to **"Syncing..."** to reflect the pending cloud request.
* **Confirmations & Success Flaunts:**
  * **Before Syncing:** User must explicitly approve the overwrite action to prevent accidental data loss.
  * **On Success:** The button changes to green (`var(--accent-success)`), shifts to a checkmark icon (`fa-check-circle`), changes its text to **"Completed!"**, and displays a friendly success window alert. After 2 seconds, it elegantly restores to its default state.
  * **On Failure:** If network drops or credentials fail, it restores the button and alerts the user with the detailed error trace.

---

## 🗑️ Master Delete System (Bulk Variant Purging)

To simplify stock management, ZYRO includes a **Master Delete** system to wipe out a product and all of its associated variants in a single action:

* **Triggering Master Delete:** A dedicated **Master Delete** button is positioned adjacent to the product name on both the **Main Inventory Grid** and the **Master Business Ledger**.
* **Pre-Deletion Warning:** Click to open a confirmation window: *"Are you sure you want to delete the product and ALL of its size & color variants? This action cannot be undone."*
* **How it Operates Behind the Scenes:**
  1. The system queries the local cache and extracts all unique variant IDs associated with that product name.
  2. The local database (`localStorage`) filter-purges all matching records.
  3. If online, the system performs a single optimized API request `delete().in('id', [ids])` to Supabase, removing all size/color rows from the cloud in a fraction of a second.
  4. Both stock panels and financial ledger views refresh dynamically.

---

## 💡 Smart Autocomplete & Variation Pre-Filling

To ensure consistent product naming across variants (such as adding an `XXL` size of `Terry Trouser` without typing errors) and speed up inventory management:

* **Real-time Datalist Autocomplete:** When adding a new product variation via the **Add Stock** modal, the **Product Name** input displays a dynamic drop-down suggestion list of all existing product names in your inventory.
* **Intelligent Auto-Pre-Fill:** 
  1. Once the user types or selects an existing product name (e.g., `Terry Trouser`), the form instantly detects the match.
  2. The system automatically fetches and pre-fills the **Category/Type** (e.g., `Trouser`), **Style** (e.g., `Plain`), **Sale Price** (e.g., `Rs. 1,200`), and **Cost Price** from the existing product record.
  3. The operator only needs to key in the new **Size** (e.g., `XXL`), **Color**, and **Initial Quantity**, completely eliminating manual data-entry errors and catalog fragmentation.

---

## 📍 Store Location & Thermal Receipt Footer

To align printed transactions with legal and branding requirements, the thermal receipt generated by `POS.generateReceipt()` has been completely refactored to match your custom pixel-perfect receipt template optimized for standard **57mm x 90mm** single-page thermal rolls:

* **Single-Page Constraint (`57mm 90mm`):** Formatted using `overflow: hidden`, tight `1.5mm` body padding, and compact styling to ensure the entire layout fits on exactly one single receipt sheet without spilling onto a second page.
* **Header Branding Section:** Includes a bold page-top timestamp, a centered ultra-bold **Zyro** title, an elegant solid horizontal divider line, and clear branding lines (`Outdoor Tours`, `Emanzaib plaza, darwesh, Gt road haripur`, `support@zyro.com`).
* **Customer Info Block (SOLD TO):** Structures customer parameters with right-aligned labels and extra bold values (`SOLD TO`, `SALE DATE`, `ORDER ID`) in a tight grid.
* **Dynamic Table Grid:** Arranges columns (`Qty`, `Item`, `Price`) using a bold header row with solid dividers, and uses dotted gridlines between item rows.
* **Dynamic "ITEMS SOLD" Badge:** Computes total items and places a centered, uppercase items-purchased summary.
* **Totals Block:** Places subtotal, discount, payment method, and total due values within dashed lines, keeping currency formatting crisp.

---

*For further technical support, refer to the source files or contact the enterprise system engineer.*
