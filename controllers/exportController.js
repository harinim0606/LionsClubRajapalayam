/**
 * exportController.js
 * 
 * Handles all export API endpoints with security logging.
 * Supports streaming export for large datasets (50,000+ members).
 */

import path from "path";
import { fileURLToPath } from "url";
import Member from "../models/Member.js";
import ExportHistory from "../models/ExportHistory.js";
import ExportPreset from "../models/ExportPreset.js";
import { generateWorkbook, generateStatisticsOnly, ALL_COLUMNS, DEFAULT_COLUMNS } from "../utils/excelExportEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

const buildFilterQuery = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
  if (filters.gender) query.gender = { $regex: new RegExp(`^${filters.gender}$`, "i") };
  if (filters.city) query.city = { $regex: new RegExp(filters.city, "i") };
  if (filters.district) query.district = { $regex: new RegExp(filters.district, "i") };
  if (filters.state) query.state = { $regex: new RegExp(filters.state, "i") };
  if (filters.occupation) query.profession = { $regex: new RegExp(filters.occupation, "i") };
  if (filters.clubPosition) query.clubPosition = { $regex: new RegExp(filters.clubPosition, "i") };
  if (filters.membershipType) query.membershipType = filters.membershipType;

  // Date joined range (joiningYear)
  if (filters.joiningYearFrom || filters.joiningYearTo) {
    query.joiningYear = {};
    if (filters.joiningYearFrom) query.joiningYear.$gte = parseInt(filters.joiningYearFrom);
    if (filters.joiningYearTo) query.joiningYear.$lte = parseInt(filters.joiningYearTo);
  }

  // Has email / mobile / photo
  if (filters.hasEmail === "yes") query.email = { $exists: true, $ne: "" };
  if (filters.hasEmail === "no") query.$or = [{ email: { $exists: false } }, { email: "" }];
  if (filters.hasMobile === "yes") query.mobile = { $exists: true, $ne: "" };
  if (filters.hasMobile === "no") query.$or = [{ mobile: { $exists: false } }, { mobile: "" }];
  if (filters.hasPhoto === "yes") query.avatar = { $exists: true, $ne: "" };
  if (filters.hasPhoto === "no") query.$or = [{ avatar: { $exists: false } }, { avatar: "" }];

  // Age range — requires filtering in memory or using $expr with date math
  // We'll do this post-query as a filter pass for simplicity
  return query;
};

const applyAgeFilter = (members, ageFrom, ageTo) => {
  if (!ageFrom && !ageTo) return members;
  return members.filter(m => {
    if (!m.dateOfBirth) return false;
    const age = Math.floor((Date.now() - new Date(m.dateOfBirth)) / 31557600000);
    if (ageFrom && age < parseInt(ageFrom)) return false;
    if (ageTo && age > parseInt(ageTo)) return false;
    return true;
  });
};

const logExport = async ({ req, exportType, fileName, totalRows, columns, filters, executionTime, status, errorMessage }) => {
  try {
    await ExportHistory.create({
      fileName,
      exportType,
      totalRows,
      columnsExported: columns || DEFAULT_COLUMNS,
      filtersUsed: filters || {},
      executionTime,
      status,
      errorMessage: errorMessage || null,
      exportedBy: req.user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"] || "unknown",
    });
  } catch (err) {
    console.error("Failed to log export:", err.message);
  }
};

// ─── 1. Export All Members ───────────────────────────────────────────────────

export const exportAllMembers = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { columns } = req.query;
    const selectedCols = columns ? columns.split(",") : DEFAULT_COLUMNS;

    const members = await Member.find({}).lean();

    await generateWorkbook(res, members, {
      columns: selectedCols,
      fileName: "LionsClub_All_Members",
      includeStats: true,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({
      req, exportType: "all",
      fileName: `LionsClub_All_Members_${new Date().toISOString().slice(0,10).replace(/-/g,"")}.xlsx`,
      totalRows: members.length, columns: selectedCols, filters: {},
      executionTime: elapsed, status: "Completed",
    });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({ req, exportType: "all", fileName: "Failed", totalRows: 0, executionTime: elapsed, status: "Failed", errorMessage: error.message });
    next(error);
  }
};

// ─── 2. Export Filtered Members ──────────────────────────────────────────────

export const exportFilteredMembers = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { filters = {}, columns } = req.body;
    const selectedCols = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;

    const query = buildFilterQuery(filters);
    let members = await Member.find(query).lean();

    // Post-query age filter
    members = applyAgeFilter(members, filters.ageFrom, filters.ageTo);

    await generateWorkbook(res, members, {
      columns: selectedCols,
      fileName: "LionsClub_Filtered_Members",
      includeStats: true,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({
      req, exportType: "filtered",
      fileName: `LionsClub_Filtered_Members_${new Date().toISOString().slice(0,10).replace(/-/g,"")}.xlsx`,
      totalRows: members.length, columns: selectedCols, filters,
      executionTime: elapsed, status: "Completed",
    });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({ req, exportType: "filtered", fileName: "Failed", totalRows: 0, executionTime: elapsed, status: "Failed", errorMessage: error.message });
    next(error);
  }
};

// ─── 3. Export Selected Members ──────────────────────────────────────────────

export const exportSelectedMembers = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { ids = [], columns } = req.body;
    const selectedCols = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No member IDs provided." });
    }

    const members = await Member.find({ _id: { $in: ids } }).lean();

    await generateWorkbook(res, members, {
      columns: selectedCols,
      fileName: "LionsClub_Selected_Members",
      includeStats: false,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({
      req, exportType: "selected",
      fileName: `LionsClub_Selected_Members_${new Date().toISOString().slice(0,10).replace(/-/g,"")}.xlsx`,
      totalRows: members.length, columns: selectedCols, filters: { selectedIds: ids.length },
      executionTime: elapsed, status: "Completed",
    });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({ req, exportType: "selected", fileName: "Failed", totalRows: 0, executionTime: elapsed, status: "Failed", errorMessage: error.message });
    next(error);
  }
};

// ─── 4. Download Import Template ─────────────────────────────────────────────

export const downloadTemplate = async (req, res, next) => {
  try {
    const templatePath = path.join(__dirname, "..", "storage", "templates", "member_import_template.xlsx");
    
    // If a pre-built template exists, send it directly
    try {
      res.download(templatePath, "Member_Import_Template.xlsx");
    } catch {
      // Otherwise generate a blank template dynamically
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Members");
      
      const templateCols = [
        "Member Number", "First Name", "Last Name", "Gender", "Date of Birth (DDMMYYYY)",
        "Mobile", "Alternate Mobile", "WhatsApp", "Email", "Blood Group",
        "Occupation", "Company", "Address", "City", "District", "State", "Pincode",
        "Joining Year", "Club Position", "Wedding Anniversary (DDMMYYYY)", "Spouse Name",
        "Membership Type", "Status"
      ];

      ws.columns = templateCols.map((h, i) => ({ header: h, key: `col${i}`, width: 22 }));
      const headerRow = ws.getRow(1);
      headerRow.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A2A5E" } };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      headerRow.height = 28;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="Member_Import_Template.xlsx"');
      await wb.xlsx.write(res);
    }
  } catch (error) {
    next(error);
  }
};

// ─── 5. Export Statistics Report ─────────────────────────────────────────────

export const exportStatistics = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const members = await Member.find({}).lean();
    await generateStatisticsOnly(res, members);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({
      req, exportType: "statistics",
      fileName: `LionsClub_Statistics_${new Date().toISOString().slice(0,10).replace(/-/g,"")}.xlsx`,
      totalRows: members.length, columns: [], filters: {},
      executionTime: elapsed, status: "Completed",
    });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    await logExport({ req, exportType: "statistics", fileName: "Failed", totalRows: 0, executionTime: elapsed, status: "Failed", errorMessage: error.message });
    next(error);
  }
};

// ─── 6. Get Export History ────────────────────────────────────────────────────

export const getExportHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      ExportHistory.find()
        .populate("exportedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ExportHistory.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { records, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 7. Get Export Stats (for UI cards) ──────────────────────────────────────

export const getExportStats = async (req, res, next) => {
  try {
    const [totalMembers, lastExport] = await Promise.all([
      Member.countDocuments(),
      ExportHistory.findOne({ status: "Completed" }).sort({ createdAt: -1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        lastExport: lastExport ? {
          fileName: lastExport.fileName,
          totalRows: lastExport.totalRows,
          createdAt: lastExport.createdAt,
          exportType: lastExport.exportType,
        } : null,
        columns: ALL_COLUMNS.map(c => ({ key: c.key, header: c.header })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 8. Preview Filter Count ─────────────────────────────────────────────────

export const getFilterPreview = async (req, res, next) => {
  try {
    const { filters = {} } = req.body;
    const query = buildFilterQuery(filters);
    let members = await Member.find(query, "_id dateOfBirth").lean();
    members = applyAgeFilter(members, filters.ageFrom, filters.ageTo);

    res.status(200).json({
      success: true,
      data: { count: members.length },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 9. Preset CRUD ──────────────────────────────────────────────────────────

export const getPresets = async (req, res, next) => {
  try {
    const presets = await ExportPreset.find({
      $or: [{ createdBy: req.user.id }, { isGlobal: true }]
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, data: presets });
  } catch (error) {
    next(error);
  }
};

export const savePreset = async (req, res, next) => {
  try {
    const { name, description, columns, filters, isGlobal } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Preset name is required." });

    const preset = await ExportPreset.create({
      name, description, columns, filters,
      createdBy: req.user.id,
      isGlobal: isGlobal || false,
    });

    res.status(201).json({ success: true, data: preset, message: "Preset saved." });
  } catch (error) {
    next(error);
  }
};

export const deletePreset = async (req, res, next) => {
  try {
    const preset = await ExportPreset.findById(req.params.id);
    if (!preset) return res.status(404).json({ success: false, message: "Preset not found." });

    // Only owner can delete
    if (preset.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await preset.deleteOne();
    res.status(200).json({ success: true, message: "Preset deleted." });
  } catch (error) {
    next(error);
  }
};
