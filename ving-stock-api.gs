// ════════════════════════════════════════════════════════════
// VING — Stock Count & Grading API (Google Apps Script)
// วาง code นี้ใน Apps Script แล้ว Deploy เป็น Web App (Execute as: Me / Access: Anyone)
// ════════════════════════════════════════════════════════════

// ── ตั้งค่าตรงนี้ ──────────────────────────────────────────
const SHEET_ID        = 'YOUR_GOOGLE_SHEET_ID_HERE';   // ID ของ Google Sheet
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE';   // ID ของ Drive folder เก็บรูปปรับเกรด
// ──────────────────────────────────────────────────────────

const TABS = {
  branches: {
    name: 'Branches',
    headers: ['email', 'branch_code', 'branch_name', 'active'],
  },
  skus: {
    name: 'SKU_Master',
    headers: ['sku', 'product_name', 'category', 'size'],
  },
  count: {
    name: 'Count_Log',
    headers: ['timestamp', 'session_id', 'branch_code', 'branch_name', 'email', 'sku', 'product_name', 'counted_qty'],
  },
  grade: {
    name: 'Grade_Log',
    headers: ['timestamp', 'branch_code', 'branch_name', 'email', 'sku', 'product_name', 'grade_type', 'qty', 'photo_url', 'note'],
  },
};

// ── router ────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    switch (data.action) {
      case 'verify_email': return jsonResponse(verifyEmail(data));
      case 'load_skus':    return jsonResponse(loadSkus());
      case 'save_count':   return jsonResponse(saveCount(data));
      case 'save_grade':   return jsonResponse(saveGrade(data));
      default:             return jsonResponse({ ok: false, error: 'unknown action: ' + data.action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'VING Stock API', version: '1.0' });
}

// ── actions ───────────────────────────────────────────────
function verifyEmail(data) {
  const email = String(data.email || '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'no email' };

  const sheet = getOrCreateSheet(TABS.branches);
  const rows  = sheet.getDataRange().getValues();
  // rows[0] = header: email | branch_code | branch_name | active
  for (let i = 1; i < rows.length; i++) {
    const rowEmail = String(rows[i][0] || '').trim().toLowerCase();
    const active   = String(rows[i][3]).trim().toUpperCase();
    if (rowEmail === email && active !== 'FALSE' && active !== 'NO' && active !== '0') {
      return {
        ok: true,
        branch_code: String(rows[i][1] || '').trim(),
        branch_name: String(rows[i][2] || '').trim(),
      };
    }
  }
  return { ok: false, error: 'not_allowed' };
}

function loadSkus() {
  const sheet = getOrCreateSheet(TABS.skus);
  const rows  = sheet.getDataRange().getValues();
  const skus  = [];
  for (let i = 1; i < rows.length; i++) {
    const sku = String(rows[i][0] || '').trim();
    if (!sku) continue;
    skus.push({
      sku:          sku,
      product_name: String(rows[i][1] || '').trim(),
      category:     String(rows[i][2] || '').trim(),
      size:         String(rows[i][3] || '').trim(),
    });
  }
  return { ok: true, skus: skus };
}

function saveCount(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) return { ok: false, error: 'no items' };

  const sheet = getOrCreateSheet(TABS.count);
  const ts    = new Date();
  const rows  = items.map(it => ([
    ts,
    data.session_id  || '-',
    data.branch_code || '-',
    data.branch_name || '-',
    data.email       || '-',
    it.sku           || '-',
    it.product_name  || '-',
    Number(it.counted_qty) || 0,
  ]));
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, TABS.count.headers.length).setValues(rows);
  return { ok: true, logged: rows.length };
}

function saveGrade(data) {
  if (!data.grade_type) return { ok: false, error: 'no grade_type' };
  if (!data.photo_base64) return { ok: false, error: 'photo required' };

  // 1) decode + save photo to Drive
  let photoUrl = '';
  try {
    const mime    = data.photo_mime || 'image/jpeg';
    const ext      = mime.indexOf('png') > -1 ? 'png' : 'jpg';
    const bytes    = Utilities.base64Decode(data.photo_base64);
    const safeName = String(data.sku || 'NOSKU').replace(/[^\w-]/g, '_');
    const fname    = ['VING', safeName, data.grade_type, formatStamp(new Date())].join('_') + '.' + ext;
    const blob     = Utilities.newBlob(bytes, mime, fname);
    const folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const file     = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    photoUrl = file.getUrl();
  } catch (err) {
    return { ok: false, error: 'photo upload failed: ' + err.message };
  }

  // 2) append grade log row
  const sheet = getOrCreateSheet(TABS.grade);
  sheet.appendRow([
    new Date(),
    data.branch_code || '-',
    data.branch_name || '-',
    data.email       || '-',
    data.sku         || '-',
    data.product_name|| '-',
    data.grade_type,
    Number(data.qty) || 0,
    photoUrl,
    data.note        || '',
  ]);
  return { ok: true, photo_url: photoUrl };
}

// ── helpers ───────────────────────────────────────────────
function getOrCreateSheet(tab) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(tab.name);
  if (!sheet) {
    sheet = ss.insertSheet(tab.name);
    const hRange = sheet.getRange(1, 1, 1, tab.headers.length);
    hRange.setValues([tab.headers]);
    hRange.setBackground('#1a1a2e');
    hRange.setFontColor('#ffffff');
    hRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatStamp(d) {
  const p = n => ('0' + n).slice(-2);
  return [d.getFullYear(), p(d.getMonth() + 1), p(d.getDate())].join('') +
         '-' + [p(d.getHours()), p(d.getMinutes()), p(d.getSeconds())].join('');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── setup helper (รัน manual ครั้งเดียวเพื่อสร้าง tabs + seed) ──
function testSetup() {
  // สร้าง 4 tabs พร้อม header
  getOrCreateSheet(TABS.branches);
  getOrCreateSheet(TABS.skus);
  getOrCreateSheet(TABS.count);
  getOrCreateSheet(TABS.grade);

  // seed 1 branch ตัวอย่าง (แก้เป็น email จริงของทีม)
  const b = getOrCreateSheet(TABS.branches);
  if (b.getLastRow() < 2) {
    b.appendRow(['admin@ving.com', 'HQ', 'สำนักงานใหญ่', 'TRUE']);
  }
  // seed 2 SKU ตัวอย่าง
  const s = getOrCreateSheet(TABS.skus);
  if (s.getLastRow() < 2) {
    s.appendRow(['VING-RUN-BLK-40', 'รองเท้าแตะวิ่ง VING สีดำ', 'รองเท้าแตะ', '40']);
    s.appendRow(['VING-RUN-BLU-42', 'รองเท้าแตะวิ่ง VING สีน้ำเงิน', 'รองเท้าแตะ', '42']);
  }
  Logger.log('Setup done. Tabs created + seeded. แก้ Branches/SKU_Master เป็นข้อมูลจริงได้เลย');
}
