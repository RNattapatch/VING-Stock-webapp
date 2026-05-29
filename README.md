# VING Stock Count & Grading — คู่มือติดตั้ง

**เวอร์ชัน:** 1.0
**อัปเดต:** 2026-05-29

ระบบเช็คสต็อกด้วยการยิง barcode + ปรับเกรดสินค้าพร้อมรูปยืนยัน
ผูกสาขาตามอีเมลที่ login — PC/มือถือไม่ต้องเลือกสาขาเอง

---

## ไฟล์ในชุดนี้

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าแรก — login ด้วยอีเมล + เมนู |
| `checker.html` | หน้านับสต็อก — ยิง barcode สะสมจำนวน |
| `stock.html` | หน้าสินค้า — ปรับเกรด (ตกเกรด / หลุด QC / ส่งคืน) + ถ่ายรูป |
| `ving-stock-api.gs` | Code backend (วางใน Apps Script — ไม่อัปขึ้น GitHub Pages) |
| `README.md` | คู่มือนี้ |

---

## ภาพรวม 4 ขั้นตอน

1. สร้าง Google Sheet + Drive folder → ได้ 2 ID
2. วาง Apps Script + Deploy → ได้ Web App URL
3. ขึ้น GitHub Pages → ได้ URL ของระบบ
4. กรอก API URL ในเว็บ + เพิ่มอีเมลทีมใน Sheet → พร้อมใช้งาน

---

## ส่วนที่ 1 — Google Sheet + Drive folder

### Step 1 — สร้าง Google Sheet
1. เปิด [sheets.google.com](https://sheets.google.com) → **+ สร้าง Spreadsheet ใหม่**
2. ตั้งชื่อ: **VING Stock System**
3. คัดลอก **Sheet ID** จาก URL (ส่วนระหว่าง `/d/` กับ `/edit`):
   ```
   https://docs.google.com/spreadsheets/d/ ► SHEET_ID ◄ /edit
   ```

### Step 2 — สร้าง Drive folder เก็บรูปปรับเกรด
1. เปิด [drive.google.com](https://drive.google.com) → **+ ใหม่ → โฟลเดอร์**
2. ตั้งชื่อ: **VING Grade Photos**
3. เปิดโฟลเดอร์ → คัดลอก **Folder ID** จาก URL (ส่วนหลัง `/folders/`):
   ```
   https://drive.google.com/drive/folders/ ► FOLDER_ID ◄
   ```

---

## ส่วนที่ 2 — Apps Script

### Step 1 — วาง code
1. ใน Google Sheet → เมนู **Extensions → Apps Script**
2. **ลบ code เดิมทิ้งทั้งหมด**
3. เปิดไฟล์ `ving-stock-api.gs` → คัดลอกทั้งหมด → วาง
4. แก้ 2 บรรทัดบนสุด:
   ```javascript
   const SHEET_ID        = 'วาง_SHEET_ID_จาก_ส่วนที่1_Step1';
   const DRIVE_FOLDER_ID = 'วาง_FOLDER_ID_จาก_ส่วนที่1_Step2';
   ```
5. กด **Save** (⌘S)

### Step 2 — สร้าง tabs + ทดสอบ
1. dropdown เลือก function ด้านบน → เลือก **testSetup**
2. กด **▶ Run**
3. ครั้งแรกขอ Permission → **Review permissions → เลือกบัญชี → Advanced → Go to (unsafe) → Allow**
   > ต้อง allow ทั้ง Sheet และ Drive เพราะระบบเขียนทั้งสองที่
4. กลับไปดู Google Sheet → ต้องมี 4 tabs: **Branches · SKU_Master · Count_Log · Grade_Log** พร้อมข้อมูลตัวอย่าง

### Step 3 — Deploy เป็น Web App
1. คลิก **Deploy → New deployment**
2. คลิกไอคอน ⚙ ข้าง Select type → เลือก **Web App**
3. ตั้งค่า:
   - **Execute as:** Me
   - **Who has access:** **Anyone** ← สำคัญ (ต้องเป็น Anyone ไม่ใช่ Anyone with Google account)
4. คลิก **Deploy** → คัดลอก **Web App URL** (ลงท้าย `/exec`)

> ⚠️ **แก้ code ทีหลังต้อง Deploy ใหม่เสมอ:** Deploy → Manage deployments → ✏️ Edit → Version: **New version** → Deploy

---

## ส่วนที่ 3 — ขึ้น GitHub Pages

### Step 1 — สร้าง Repository
1. [github.com](https://github.com) → **＋ New → New repository**
2. **Repository name:** `ving-stock` (ไม่มีช่องว่าง) · **Visibility:** ✅ **Public**
3. ✅ Add a README file → **Create repository**

### Step 2 — อัปโหลดไฟล์
1. **Add file → Upload files**
2. ลาก 3 ไฟล์เข้าไป: `index.html` · `checker.html` · `stock.html`
   > `ving-stock-api.gs` ไม่ต้องอัป (อยู่ใน Apps Script แล้ว)
3. **Commit changes**

### Step 3 — เปิด Pages
1. **Settings → Pages** (เมนูซ้าย)
2. **Branch:** `main` → folder: `/ (root)` → **Save**
3. รอ 1-5 นาที → ได้ URL:
   ```
   https://[github-username].github.io/ving-stock/
   ```

> ⚠️ ครั้งแรกถ้า 404 ให้รอ 2-5 นาทีแล้ว refresh

---

## ส่วนที่ 4 — เชื่อม API + เพิ่มทีม

### Step 1 — กรอก API URL
1. เปิด URL ของระบบ (จากส่วนที่ 3) → กดปุ่ม **⚙** มุมขวาบน
2. วาง **Web App URL** (จากส่วนที่ 2 Step 3) → **บันทึก**
   > ตั้งครั้งเดียวต่อเครื่อง — เก็บในเครื่องนั้นเลย

### Step 2 — เพิ่มอีเมลทีม (allowlist สาขา)
เปิด Google Sheet → tab **Branches** → กรอกทีละแถว:

| email | branch_code | branch_name | active |
|---|---|---|---|
| staff1@ving.com | BKK01 | สาขาสยาม | TRUE |
| staff2@ving.com | BKK02 | สาขาลาดพร้าว | TRUE |

- **email** = อีเมลที่พนักงานจะใช้ login (พิมพ์ตัวไหนก็ได้ ระบบไม่สนตัวพิมพ์เล็กใหญ่)
- **branch_name** = ชื่อสาขาที่จะโชว์บนหน้าจอ
- **active** = `TRUE` ใช้งานได้ / `FALSE` ปิดสิทธิ์
- หลายอีเมลผูกสาขาเดียวกันได้

### Step 3 — นำเข้ารายการสินค้า
เปิด tab **SKU_Master** → วางข้อมูลจาก Odoo (export ออกมา):

| sku | product_name | category | size |
|---|---|---|---|
| VING-RUN-BLK-40 | รองเท้าแตะวิ่ง VING สีดำ | รองเท้าแตะ | 40 |

- **sku** ต้องตรงกับ barcode ที่ยิง (ถ้า barcode = SKU เป๊ะ ระบบจับคู่อัตโนมัติ)
- ลบ 2 แถวตัวอย่างที่ `testSetup` สร้างไว้ออกได้

> ✅ เสร็จแล้ว — ส่ง URL ของระบบให้ทีม login ด้วยอีเมลที่อยู่ใน Branches ได้เลย

---

## วิธีใช้งาน

### หน้านับสต็อก (checker.html)
1. login → กด **นับสต็อก**
2. โฟกัสอยู่ที่ช่องยิงเสมอ — **ยิง barcode** (เครื่องสแกน USB = พิมพ์ SKU + Enter อัตโนมัติ)
3. ยิงซ้ำ SKU เดิม = **+1 ชิ้นทันที**
4. แก้จำนวนเองได้ด้วยปุ่ม **+ / − / 🗑**
5. นับครบ → กด **บันทึกการนับ** → ลง tab Count_Log → เริ่มรอบใหม่อัตโนมัติ
6. ถ้าเน็ตหลุด/รีเฟรช รายการที่นับยังอยู่ (เก็บในเครื่อง) — ไม่หาย

> SKU ที่ไม่อยู่ใน SKU_Master ยังนับได้ แต่ติดป้าย **⚠ ไม่พบ master** เพื่อให้ไปตรวจทีหลัง

### หน้าสินค้า (stock.html)
1. login → กด **สินค้า** → ค้นหา / กรองหมวด
2. กด **ปรับเกรด** ที่สินค้านั้น
3. เลือกประเภท: **ตกเกรด / หลุด QC / ส่งคืน** → ใส่จำนวน
4. **ถ่ายรูปยืนยัน (บังคับ)** — กดบันทึกไม่ได้ถ้ายังไม่มีรูป
5. **บันทึก** → รูปขึ้น Drive + ลงข้อมูล tab Grade_Log พร้อมลิงก์รูป

---

## ดูข้อมูลที่บันทึก
เปิด Google Sheet **VING Stock System**:
- tab **Count_Log** — ผลนับสต็อกแต่ละรอบ (timestamp · session · สาขา · อีเมล · SKU · จำนวน)
- tab **Grade_Log** — ประวัติปรับเกรด + ลิงก์รูป (คลิก photo_url ดูรูปได้เลย)

---

## แก้ปัญหาเบื้องต้น

| ปัญหา | วิธีแก้ |
|---|---|
| login แล้วขึ้น "ไม่พบสิทธิ์เข้าใช้" | เพิ่มอีเมลใน tab Branches + ตั้ง active = TRUE |
| เปิดเว็บแล้วไม่มีอะไรเกิดขึ้น / นับไม่ได้ | กด ⚙ ตรวจว่าวาง Web App URL (ลงท้าย /exec) ถูก |
| บันทึกแล้ว error | re-deploy Apps Script (New version) + ตรวจ Who has access = **Anyone** |
| รูปปรับเกรดอัปไม่ได้ | ตรวจ DRIVE_FOLDER_ID + รัน testSetup ใหม่เพื่อ re-authorize Drive |
| สินค้าไม่โหลด | ตรวจว่า tab SKU_Master มีข้อมูล + คอลัมน์ตรง (sku/product_name/category/size) |
| เปิด URL แล้ว 404 | รอ 2-5 นาทีหลังเปิด GitHub Pages แล้ว refresh |

---

*สอบถามเพิ่มเติม: ปัน ณัฐพัชร์ — r.nattapatch@gmail.com*
