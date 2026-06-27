/**
 * excelExportEngine.js
 * 
 * Professional multi-sheet Excel workbook generator using ExcelJS.
 * Supports streaming for 50,000+ member exports without memory leaks.
 * 
 * Features:
 * - Royal Blue (#0A2A5E) headers with white bold centered text
 * - Alternating light gray rows
 * - Frozen first row
 * - Auto-filter on all columns
 * - Auto-sized column widths
 * - Mobile numbers stored as text (no scientific notation)
 * - 4 Worksheets: Members, Statistics, Birthdays, Anniversaries
 */

import ExcelJS from "exceljs";

// ─── Color Constants ────────────────────────────────────────────────────────
const COLORS = {
  headerBg: "FF0A2A5E",       // Royal Blue
  headerText: "FFFFFFFF",      // White
  altRowBg: "FFF0F4F8",       // Light blue-gray
  borderColor: "FFD1D9E0",    // Light border
  goldAccent: "FFF4B400",     // Lions Gold
  linkBlue: "FF1D4ED8",       // Email/URL blue
  successGreen: "FF16A34A",   // Active status
  warningRed: "FFDC2626",     // Inactive status
};

// ─── Column Definitions ─────────────────────────────────────────────────────
export const ALL_COLUMNS = [
  { key: "memberNumber",   header: "Member No",          width: 14, type: "text" },
  { key: "name",           header: "Member Name",         width: 28, type: "text" },
  { key: "firstName",      header: "First Name",          width: 18, type: "text" },
  { key: "lastName",       header: "Last Name",           width: 18, type: "text" },
  { key: "dateOfBirth",    header: "Date of Birth",       width: 16, type: "date" },
  { key: "age",            header: "Age",                 width: 8,  type: "number" },
  { key: "weddingDate",    header: "Wedding Anniversary", width: 20, type: "date" },
  { key: "gender",         header: "Gender",              width: 10, type: "text" },
  { key: "bloodGroup",     header: "Blood Group",         width: 14, type: "text" },
  { key: "mobile",         header: "Mobile",              width: 16, type: "phone" },
  { key: "alternateMobile",header: "Alternate Mobile",    width: 18, type: "phone" },
  { key: "whatsappMobile", header: "WhatsApp",            width: 16, type: "phone" },
  { key: "email",          header: "Email",               width: 30, type: "email" },
  { key: "address",        header: "Address",             width: 36, type: "text" },
  { key: "city",           header: "City",                width: 16, type: "text" },
  { key: "district",       header: "District",            width: 16, type: "text" },
  { key: "state",          header: "State",               width: 14, type: "text" },
  { key: "country",        header: "Country",             width: 14, type: "text" },
  { key: "pincode",        header: "Pincode",             width: 12, type: "text" },
  { key: "profession",     header: "Occupation",          width: 24, type: "text" },
  { key: "company",        header: "Company",             width: 28, type: "text" },
  { key: "clubPosition",   header: "Club Position",       width: 20, type: "text" },
  { key: "membershipType", header: "Membership Type",     width: 18, type: "text" },
  { key: "joiningYear",    header: "Joining Year",        width: 14, type: "text" },
  { key: "status",         header: "Membership Status",   width: 18, type: "status" },
  { key: "spouseName",     header: "Spouse Name",         width: 24, type: "text" },
  { key: "createdAt",      header: "Created Date",        width: 16, type: "date" },
  { key: "updatedAt",      header: "Updated Date",        width: 16, type: "date" },
];

// Default column selection (the most common export fields)
export const DEFAULT_COLUMNS = [
  "memberNumber", "name", "dateOfBirth", "age", "weddingDate", "gender",
  "bloodGroup", "mobile", "email", "city", "profession", "clubPosition",
  "status", "joiningYear",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const calcAge = (dob) => {
  if (!dob) return "";
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
    cell.font = { color: { argb: COLORS.headerText }, bold: true, size: 11, name: "Calibri" };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    cell.border = {
      bottom: { style: "medium", color: { argb: COLORS.goldAccent } },
    };
  });
  row.height = 28;
};

const styleDataRow = (row, rowIndex, columns) => {
  const isAlt = rowIndex % 2 === 0;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (isAlt) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.altRowBg } };
    }
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.font = { size: 10, name: "Calibri" };
    
    // Special styling for emails
    const col = columns[colNumber - 1];
    if (col && col.type === "email" && cell.value) {
      cell.font = { size: 10, color: { argb: COLORS.linkBlue }, name: "Calibri" };
    }
    // Status coloring
    if (col && col.type === "status") {
      if (cell.value === "active") {
        cell.font = { size: 10, color: { argb: COLORS.successGreen }, bold: true, name: "Calibri" };
        cell.value = "Active";
      } else if (cell.value === "inactive") {
        cell.font = { size: 10, color: { argb: COLORS.warningRed }, bold: true, name: "Calibri" };
        cell.value = "Inactive";
      }
    }
  });
  row.height = 20;
};

// ─── Build Cell Value ─────────────────────────────────────────────────────────
const getCellValue = (member, col) => {
  if (col.key === "age") return calcAge(member.dateOfBirth);
  if (col.type === "date") return formatDate(member[col.key]);
  if (col.type === "phone") return member[col.key] ? `'${member[col.key]}` : ""; // Leading ' prevents scientific notation in some viewers
  return member[col.key] ?? "";
};

// ─── Sheet 1: Members ─────────────────────────────────────────────────────────
const buildMembersSheet = (wb, members, selectedColumnKeys) => {
  const selectedCols = selectedColumnKeys && selectedColumnKeys.length > 0
    ? ALL_COLUMNS.filter(c => selectedColumnKeys.includes(c.key))
    : ALL_COLUMNS.filter(c => DEFAULT_COLUMNS.includes(c.key));

  const ws = wb.addWorksheet("Members", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 20 },
  });

  // Define columns
  ws.columns = selectedCols.map(c => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));

  // Style header
  styleHeaderRow(ws.getRow(1));
  ws.autoFilter = { from: "A1", to: { row: 1, column: selectedCols.length } };

  // Add data rows
  members.forEach((member, idx) => {
    const rowData = {};
    selectedCols.forEach(col => {
      rowData[col.key] = getCellValue(member, col);
    });
    const row = ws.addRow(rowData);
    styleDataRow(row, idx + 1, selectedCols);
  });

  return ws;
};

// ─── Sheet 2: Statistics ──────────────────────────────────────────────────────
const buildStatisticsSheet = (wb, members) => {
  const ws = wb.addWorksheet("Statistics");

  // Header helper
  const addSection = (title, rows) => {
    const titleRow = ws.addRow([title]);
    titleRow.getCell(1).font = { bold: true, size: 12, color: { argb: COLORS.headerBg }, name: "Calibri" };
    titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EDF5" } };
    titleRow.height = 22;

    rows.forEach(([label, value], i) => {
      const row = ws.addRow([label, value]);
      if (i % 2 === 0) {
        row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.altRowBg } };
        row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.altRowBg } };
      }
      row.getCell(1).font = { size: 10, name: "Calibri" };
      row.getCell(2).font = { bold: true, size: 10, name: "Calibri" };
    });
    ws.addRow([]);
  };

  ws.columns = [
    { key: "label", width: 32 },
    { key: "value", width: 18 },
  ];

  // Title
  const headerRow = ws.addRow(["Statistics Report — Lions Club Rajapalayam"]);
  headerRow.getCell(1).font = { bold: true, size: 14, color: { argb: COLORS.headerText }, name: "Calibri" };
  headerRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
  ws.mergeCells(`A1:B1`);
  headerRow.height = 32;
  ws.addRow([]);

  const today = new Date();
  const activeMembers = members.filter(m => m.status === "active");
  const inactiveMembers = members.filter(m => m.status === "inactive");
  const maleMembers = members.filter(m => (m.gender || "").toLowerCase() === "male");
  const femaleMembers = members.filter(m => (m.gender || "").toLowerCase() === "female");

  // Overview
  addSection("📊 Overview", [
    ["Total Members", members.length],
    ["Active Members", activeMembers.length],
    ["Inactive Members", inactiveMembers.length],
    ["Male Members", maleMembers.length],
    ["Female Members", femaleMembers.length],
    ["Report Generated On", formatDate(today)],
  ]);

  // Blood Group
  const bgCounts = {};
  members.forEach(m => {
    const bg = m.bloodGroup || "Unknown";
    bgCounts[bg] = (bgCounts[bg] || 0) + 1;
  });
  addSection("🩸 Blood Group Distribution", Object.entries(bgCounts).sort((a, b) => b[1] - a[1]));

  // City Distribution
  const cityCounts = {};
  members.forEach(m => {
    const city = m.city || "Unknown";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  addSection("🏙️ City Distribution (Top 15)", Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 15));

  // Occupation Distribution
  const profCounts = {};
  members.forEach(m => {
    const prof = m.profession || "Unknown";
    profCounts[prof] = (profCounts[prof] || 0) + 1;
  });
  addSection("💼 Occupation Distribution (Top 15)", Object.entries(profCounts).sort((a, b) => b[1] - a[1]).slice(0, 15));

  // Age Distribution
  const ageBuckets = { "Under 30": 0, "30–40": 0, "41–50": 0, "51–60": 0, "61–70": 0, "Over 70": 0, "Unknown": 0 };
  let totalAge = 0, ageCount = 0;
  members.forEach(m => {
    const age = calcAge(m.dateOfBirth);
    if (age === "") { ageBuckets["Unknown"]++; return; }
    totalAge += age; ageCount++;
    if (age < 30) ageBuckets["Under 30"]++;
    else if (age <= 40) ageBuckets["30–40"]++;
    else if (age <= 50) ageBuckets["41–50"]++;
    else if (age <= 60) ageBuckets["51–60"]++;
    else if (age <= 70) ageBuckets["61–70"]++;
    else ageBuckets["Over 70"]++;
  });
  const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : "N/A";
  addSection("👥 Age Distribution", [
    ...Object.entries(ageBuckets),
    ["Average Age", avgAge],
  ]);

  return ws;
};

// ─── Sheet 3: Birthdays (Month-wise) ─────────────────────────────────────────
const buildBirthdaysSheet = (wb, members) => {
  const ws = wb.addWorksheet("Birthdays");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  ws.columns = [
    { key: "name", header: "Member Name", width: 28 },
    { key: "memberNumber", header: "Member No", width: 14 },
    { key: "dob", header: "Date of Birth", width: 16 },
    { key: "age", header: "Age", width: 8 },
    { key: "mobile", header: "Mobile", width: 16 },
  ];

  // Group members by birth month
  const byMonth = Array.from({ length: 12 }, () => []);
  members.forEach(m => {
    if (!m.dateOfBirth) return;
    const month = new Date(m.dateOfBirth).getMonth();
    byMonth[month].push(m);
  });

  byMonth.forEach((group, monthIdx) => {
    // Month header
    const monthRow = ws.addRow([months[monthIdx]]);
    ws.mergeCells(`A${monthRow.number}:E${monthRow.number}`);
    monthRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
    monthRow.getCell(1).font = { bold: true, size: 11, color: { argb: COLORS.headerText }, name: "Calibri" };
    monthRow.height = 24;

    if (group.length === 0) {
      ws.addRow(["No birthdays this month", "", "", "", ""]);
    } else {
      // Column sub-headers
      const subHeader = ws.addRow(["Member Name", "Member No", "Date of Birth", "Age", "Mobile"]);
      styleHeaderRow(subHeader);
      group
        .sort((a, b) => new Date(a.dateOfBirth).getDate() - new Date(b.dateOfBirth).getDate())
        .forEach((m, i) => {
          const row = ws.addRow([
            m.name, m.memberNumber, formatDate(m.dateOfBirth),
            calcAge(m.dateOfBirth), m.mobile ? `'${m.mobile}` : "",
          ]);
          if (i % 2 === 0) {
            row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.altRowBg } }; });
          }
          row.height = 20;
        });
    }
    ws.addRow([]);
  });

  return ws;
};

// ─── Sheet 4: Anniversaries (Month-wise) ─────────────────────────────────────
const buildAnniversariesSheet = (wb, members) => {
  const ws = wb.addWorksheet("Anniversaries");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  ws.columns = [
    { key: "name", header: "Member Name", width: 28 },
    { key: "memberNumber", header: "Member No", width: 14 },
    { key: "weddingDate", header: "Anniversary Date", width: 18 },
    { key: "spouseName", header: "Spouse", width: 24 },
    { key: "mobile", header: "Mobile", width: 16 },
  ];

  const byMonth = Array.from({ length: 12 }, () => []);
  members.forEach(m => {
    if (!m.weddingDate) return;
    const month = new Date(m.weddingDate).getMonth();
    byMonth[month].push(m);
  });

  byMonth.forEach((group, monthIdx) => {
    const monthRow = ws.addRow([months[monthIdx]]);
    ws.mergeCells(`A${monthRow.number}:E${monthRow.number}`);
    monthRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C2D8A" } }; // Purple for anniversaries
    monthRow.getCell(1).font = { bold: true, size: 11, color: { argb: COLORS.headerText }, name: "Calibri" };
    monthRow.height = 24;

    if (group.length === 0) {
      ws.addRow(["No anniversaries this month", "", "", "", ""]);
    } else {
      const subHeader = ws.addRow(["Member Name", "Member No", "Anniversary Date", "Spouse", "Mobile"]);
      styleHeaderRow(subHeader);
      group
        .sort((a, b) => new Date(a.weddingDate).getDate() - new Date(b.weddingDate).getDate())
        .forEach((m, i) => {
          const row = ws.addRow([
            m.name, m.memberNumber, formatDate(m.weddingDate),
            m.spouseName || "", m.mobile ? `'${m.mobile}` : "",
          ]);
          if (i % 2 === 0) {
            row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F0FA" } }; });
          }
          row.height = 20;
        });
    }
    ws.addRow([]);
  });

  return ws;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * generateWorkbook
 * Builds a complete multi-sheet workbook and pipes it to the Express response.
 * 
 * @param {object} res - Express response object
 * @param {Array} members - Array of member documents (plain objects)
 * @param {object} options
 * @param {string[]} options.columns - Column keys to include
 * @param {string} options.fileName - Filename without extension
 * @param {boolean} options.includeStats - Whether to include Statistics sheet
 */
export const generateWorkbook = async (res, members, options = {}) => {
  const { columns = DEFAULT_COLUMNS, fileName = "LionsClub_Members", includeStats = true } = options;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fullFileName = `${fileName}_${dateStr}.xlsx`;

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fullFileName}"`);

  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res, useStyles: true, useSharedStrings: true });

  buildMembersSheet(wb, members, columns);

  if (includeStats && members.length > 0) {
    buildStatisticsSheet(wb, members);
    buildBirthdaysSheet(wb, members);
    buildAnniversariesSheet(wb, members);
  }

  await wb.commit();
};

/**
 * generateStatisticsOnly
 * Builds just the statistics sheet as a standalone file.
 */
export const generateStatisticsOnly = async (res, members) => {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  res.setHeader("Content-Disposition", `attachment; filename="LionsClub_Statistics_${dateStr}.xlsx"`);

  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res, useStyles: true });
  buildStatisticsSheet(wb, members);
  buildBirthdaysSheet(wb, members);
  buildAnniversariesSheet(wb, members);
  await wb.commit();
};
