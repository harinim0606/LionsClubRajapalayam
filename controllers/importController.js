import XLSX from "xlsx";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Member from "../models/Member.js";
import User from "../models/User.js";
import ImportHistory from "../models/ImportHistory.js";
import OverrideAudit from "../models/OverrideAudit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PREVIEWS_DIR = path.join(__dirname, "..", "storage", "imports", "previews");
const REPORTS_DIR  = path.join(__dirname, "..", "storage", "imports", "reports");

if (!fs.existsSync(PREVIEWS_DIR)) fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const safeUnlink = (filePath) => {
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
};

const cleanupOldPreviews = () => {
  try {
    const files = fs.readdirSync(PREVIEWS_DIR);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    files.forEach(file => {
      const filePath = path.join(PREVIEWS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) fs.unlinkSync(filePath);
    });
  } catch (_) {}
};

const parseDate = (val) => {
  if (!val || val === "-") return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === "string") {
    const parts = val.split(".");
    if (parts.length === 3) {
      const parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return null;
};

const formatPasswordDate = (date) => {
  if (!date || isNaN(date.getTime())) return "Default@123";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear());
  return `${d}${m}${y}`;
};

const generateRandomPassword = () => crypto.randomBytes(9).toString('base64').replace(/[/+=]/g, '').substring(0, 12);

// Shared validation function to run on a single row (used during initial parse AND inline edits)
const validateRow = (memberObj, existingSets, excelSets) => {
  memberObj.errors = [];
  memberObj.warnings = [];
  memberObj.status = "valid";
  
  if (memberObj.isOverridden) {
    memberObj.status = "overridden";
    return;
  }

  const { memberNumber, name, mobile, alternateMobile, whatsappMobile, email } = memberObj;

  // 1. Mandatory Fields
  if (!memberNumber) {
    memberObj.status = "invalid";
    memberObj.errors.push("Missing Member Number.");
  } else {
    if (excelSets.memberNos.has(memberNumber)) {
      memberObj.status = "duplicate_excel";
      memberObj.errors.push("Duplicate Member Number within the Excel file.");
    } else if (existingSets.memberNos.has(memberNumber)) {
      memberObj.status = "duplicate_db";
      memberObj.errors.push("Member Number already exists in the database.");
    } else {
      excelSets.memberNos.add(memberNumber);
    }
  }

  if (!name) {
    if (memberObj.status !== "duplicate_db" && memberObj.status !== "duplicate_excel") {
      memberObj.status = "invalid";
    }
    memberObj.errors.push("Full Name is required.");
  }

  // 2. Mobile validation
  const checkMobile = (m, fieldName) => {
    if (m) {
      if (excelSets.mobiles.has(m)) {
        if (memberObj.status === "valid" || memberObj.status === "warning") memberObj.status = "duplicate_excel";
        memberObj.warnings.push(`Duplicate ${fieldName} within the Excel file.`);
      } else if (existingSets.mobiles.has(m)) {
        if (memberObj.status === "valid" || memberObj.status === "warning") memberObj.status = "duplicate_db";
        memberObj.warnings.push(`${fieldName} already in use in the database.`);
      } else {
        excelSets.mobiles.add(m);
      }
    }
  };
  checkMobile(mobile, "Mobile");
  checkMobile(alternateMobile, "Alternate Mobile");
  checkMobile(whatsappMobile, "WhatsApp Mobile");

  // 3. Email validation
  if (email) {
    if (excelSets.emails.has(email)) {
      if (memberObj.status === "valid" || memberObj.status === "warning") memberObj.status = "duplicate_excel";
      memberObj.warnings.push("Duplicate Email within the Excel file.");
    } else if (existingSets.emails.has(email)) {
      if (memberObj.status === "valid" || memberObj.status === "warning") memberObj.status = "duplicate_db";
      memberObj.warnings.push("Email already in use in the database.");
    } else {
      excelSets.emails.add(email);
    }
  }

  // 4. Username Validation (assuming memberNumber = username)
  if (memberNumber && existingSets.usernames && existingSets.usernames.has(memberNumber)) {
    if (memberObj.status === "valid" || memberObj.status === "warning") memberObj.status = "duplicate_db";
    memberObj.warnings.push("A user account with this Member Number (Username) already exists.");
  }
};

export const importPreview = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath, { cellDates: true, dateNF: "dd/mm/yyyy" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    safeUnlink(filePath);
    cleanupOldPreviews();

    const previewData = [];
    const existingMembers = await Member.find({}, "memberNumber mobile alternateMobile whatsappMobile email").lean();
    const existingUsers = await User.find({}, "username").lean();
    
    const existingSets = {
      memberNos: new Set(existingMembers.map((m) => m.memberNumber).filter(Boolean)),
      mobiles: new Set(),
      emails: new Set(existingMembers.map((m) => m.email).filter(Boolean)),
      usernames: new Set(existingUsers.map((u) => u.username).filter(Boolean))
    };
    
    existingMembers.forEach(m => {
      if (m.mobile) existingSets.mobiles.add(m.mobile);
      if (m.alternateMobile) existingSets.mobiles.add(m.alternateMobile);
      if (m.whatsappMobile) existingSets.mobiles.add(m.whatsappMobile);
    });

    const excelSets = { memberNos: new Set(), mobiles: new Set(), emails: new Set(), usernames: new Set() };

    rawData.forEach((row, index) => {
      const rowNum = index + 2;
      const parseField = (f) => { const v = String(row[f] || "").trim(); return v === "-" || v === "" ? null : v; };

      const memberObj = {
        id: `row-${rowNum}`, rowNum,
        memberNumber: parseField("member_no"),
        firstName: parseField("first_name"),
        lastName: parseField("last_name"),
        name: parseField("full_name"),
        gender: parseField("gender"),
        email: parseField("email"),
        mobile: parseField("mobile_number"),
        alternateMobile: parseField("alternate_mobile"),
        whatsappMobile: parseField("whatsapp_mobile"),
        bloodGroup: parseField("blood_group"),
        dateOfBirth: parseDate(row["date_of_birth"]),
        weddingDate: parseDate(row["wedding_date"]),
        profession: parseField("occupation"),
        company: parseField("company_name"),
        address: parseField("address_line"),
        city: parseField("city"),
        district: parseField("district"),
        state: parseField("state"),
        country: parseField("country"),
        pincode: parseField("pincode"),
        joiningYear: parseField("joining_year") ? Number(parseField("joining_year")) : null,
        clubPosition: parseField("club_position"),
        clubPositionYear: parseField("club_position_year"),
        spouseName: parseField("spouse_name"),
        spouseMemberId: parseField("spouse_member_id"),
        isOverridden: false
      };

      validateRow(memberObj, existingSets, excelSets);
      previewData.push(memberObj);
    });

    const previewId = crypto.randomUUID();
    const previewPath = path.join(PREVIEWS_DIR, `${previewId}.json`);
    fs.writeFileSync(previewPath, JSON.stringify({ originalFileName: req.file?.originalname || "unknown.xlsx", previewData }));

    // Calculate initial stats
    const stats = {
      totalRows: previewData.length,
      validCount: previewData.filter(m => m.status === "valid").length,
      warningCount: previewData.filter(m => m.status === "warning").length,
      invalidCount: previewData.filter(m => m.status === "invalid").length,
      duplicateExcelCount: previewData.filter(m => m.status === "duplicate_excel").length,
      duplicateDbCount: previewData.filter(m => m.status === "duplicate_db").length,
      overriddenCount: previewData.filter(m => m.status === "overridden").length,
    };

    res.status(200).json({ success: true, data: { previewId, stats } });
  } catch (error) {
    safeUnlink(req.file?.path);
    next(error);
  }
};

const filterPreviewData = (data, filter, search) => {
  return data.filter(row => {
    if (filter && filter !== "all" && row.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (row.memberNumber || "").toLowerCase().includes(q) ||
             (row.name || "").toLowerCase().includes(q) ||
             (row.mobile || "").toLowerCase().includes(q) ||
             (row.email || "").toLowerCase().includes(q);
    }
    return true;
  });
};

const getStats = (data) => ({
  totalRows: data.length,
  validCount: data.filter(m => m.status === "valid").length,
  warningCount: data.filter(m => m.status === "warning").length,
  invalidCount: data.filter(m => m.status === "invalid").length,
  duplicateExcelCount: data.filter(m => m.status === "duplicate_excel").length,
  duplicateDbCount: data.filter(m => m.status === "duplicate_db").length,
  overriddenCount: data.filter(m => m.status === "overridden").length,
});

export const getPreviewData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, filter = "all", search = "" } = req.body;

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    const filtered = filterPreviewData(fileContent.previewData, filter, search);
    
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        rows: paginated,
        total: filtered.length,
        stats: getStats(fileContent.previewData)
      }
    });
  } catch (err) { next(err); }
};

export const updatePreviewRow = async (req, res, next) => {
  try {
    const { id, rowNumber } = req.params;
    const updateData = req.body;

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    const rowIdx = fileContent.previewData.findIndex(r => r.rowNum === Number(rowNumber));
    if (rowIdx === -1) return res.status(404).json({ success: false, message: "Row not found" });

    fileContent.previewData[rowIdx] = { ...fileContent.previewData[rowIdx], ...updateData };

    // Revalidate the entire set to correctly re-evaluate duplicates
    const existingMembers = await Member.find({}, "memberNumber mobile alternateMobile whatsappMobile email").lean();
    const existingSets = { memberNos: new Set(), mobiles: new Set(), emails: new Set() };
    existingMembers.forEach(m => {
      if (m.memberNumber) existingSets.memberNos.add(m.memberNumber);
      if (m.mobile) existingSets.mobiles.add(m.mobile);
      if (m.alternateMobile) existingSets.mobiles.add(m.alternateMobile);
      if (m.whatsappMobile) existingSets.mobiles.add(m.whatsappMobile);
      if (m.email) existingSets.emails.add(m.email);
    });

    const excelSets = { memberNos: new Set(), mobiles: new Set(), emails: new Set() };
    
    // First pass: gather sets excluding the current row's new values if we wanted strict accuracy,
    // but easier to just revalidate all.
    fileContent.previewData.forEach(row => {
      validateRow(row, existingSets, excelSets);
    });

    fs.writeFileSync(previewPath, JSON.stringify(fileContent));

    res.status(200).json({ success: true, data: { row: fileContent.previewData[rowIdx], stats: getStats(fileContent.previewData) } });
  } catch (err) { next(err); }
};


export const overridePreviewRow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowNumbers, overrideReason } = req.body; // array of row numbers to override

    if (!overrideReason) return res.status(400).json({ success: false, message: "Override reason is required." });

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    const audits = [];
    
    fileContent.previewData.forEach(row => {
      if (rowNumbers.includes(row.rowNum)) {
        audits.push({
          previewId: id,
          rowNumber: row.rowNum,
          adminId: req.user.id,
          adminName: req.user.name,
          originalErrors: [...(row.errors || [])],
          originalWarnings: [...(row.warnings || [])],
          overrideReason,
          memberNumber: row.memberNumber || `row-${row.rowNum}`,
          memberData: { ...row }
        });

        row.isOverridden = true;
        row.status = "overridden";
        row.errors = [];
      }
    });

    if (audits.length > 0) {
      await OverrideAudit.insertMany(audits);
    }

    fs.writeFileSync(previewPath, JSON.stringify(fileContent));

    res.status(200).json({ success: true, data: { stats: getStats(fileContent.previewData) } });
  } catch (err) { next(err); }
};

export const comparePreviewRow = async (req, res, next) => {
  try {
    const { id, rowNumber } = req.params;

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    const row = fileContent.previewData.find(r => r.rowNum === Number(rowNumber));
    if (!row) return res.status(404).json({ success: false, message: "Row not found" });

    if (!row.memberNumber) return res.status(400).json({ success: false, message: "Row has no member number to compare" });

    const existingMember = await Member.findOne({ memberNumber: row.memberNumber }).lean();
    if (!existingMember) return res.status(404).json({ success: false, message: "No matching member in database" });

    res.status(200).json({ success: true, data: { excelRow: row, dbMember: existingMember } });
  } catch (err) { next(err); }
};

export const resolveExcelDuplicate = async (req, res, next) => {
  try {
    const { id, rowNumber } = req.params;
    const { action } = req.body; // 'delete'

    if (action !== 'delete') return res.status(400).json({ success: false, message: "Invalid action" });

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    
    // Remove the row
    fileContent.previewData = fileContent.previewData.filter(r => r.rowNum !== Number(rowNumber));

    // Revalidate everything since a duplicate was removed
    const existingMembers = await Member.find({}, "memberNumber mobile alternateMobile whatsappMobile email").lean();
    const existingUsers = await User.find({}, "username").lean();
    const existingSets = {
      memberNos: new Set(existingMembers.map((m) => m.memberNumber).filter(Boolean)),
      mobiles: new Set(),
      emails: new Set(existingMembers.map((m) => m.email).filter(Boolean)),
      usernames: new Set(existingUsers.map((u) => u.username).filter(Boolean))
    };
    existingMembers.forEach(m => {
      if (m.mobile) existingSets.mobiles.add(m.mobile);
      if (m.alternateMobile) existingSets.mobiles.add(m.alternateMobile);
      if (m.whatsappMobile) existingSets.mobiles.add(m.whatsappMobile);
    });

    const excelSets = { memberNos: new Set(), mobiles: new Set(), emails: new Set(), usernames: new Set() };
    fileContent.previewData.forEach(row => validateRow(row, existingSets, excelSets));

    fs.writeFileSync(previewPath, JSON.stringify(fileContent));

    res.status(200).json({ success: true, data: { stats: getStats(fileContent.previewData) } });
  } catch (err) { next(err); }
};

export const getMatchingIds = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filter = "all", search = "" } = req.body;

    const previewPath = path.join(PREVIEWS_DIR, `${id}.json`);
    if (!fs.existsSync(previewPath)) return res.status(404).json({ success: false, message: "Preview expired" });

    const fileContent = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
    const filtered = filterPreviewData(fileContent.previewData, filter, search);
    
    res.status(200).json({ success: true, data: filtered.map(r => r.id) });
  } catch (err) { next(err); }
};

const sseClients = new Map();

export const importProgress = (req, res) => {
  const { id } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ step: 'connected', message: 'Connected', progress: 0 })}\n\n`);

  req.on('close', () => {
    if (sseClients.has(id)) {
      sseClients.get(id).delete(res);
      if (sseClients.get(id).size === 0) sseClients.delete(id);
    }
  });
};

const emitProgress = (previewId, step, message, progress) => {
  if (sseClients.has(previewId)) {
    const data = JSON.stringify({ step, message, progress });
    sseClients.get(previewId).forEach(client => client.write(`data: ${data}\n\n`));
  }
};

export const importConfirm = async (req, res, next) => {
  const importStartedAt = new Date();
  let previewFilePath = null;
  try {
    const { previewId, selectedRowIds, options } = req.body;
    // options: { importSelected: true, updateExisting: false, createUsers: true }

    if (!previewId || !Array.isArray(selectedRowIds)) {
      throw new Error("Invalid payload.");
    }

    previewFilePath = path.join(PREVIEWS_DIR, `${previewId}.json`);
    if (!fs.existsSync(previewFilePath)) throw new Error("Preview session expired.");

    const fileContent = JSON.parse(fs.readFileSync(previewFilePath, "utf-8"));
    const { originalFileName, previewData } = fileContent;

    emitProgress(previewId, "validating", "Validating members...", 10);
    const membersToImport = previewData.filter(row => selectedRowIds.includes(row.id));
    if (membersToImport.length === 0) throw new Error("No members selected for import.");

    const passwordReport = [];
    const usernameReport = [];
    const combinedReport = [];
    const errorReport = [];

    let totalImported = 0, totalUpdated = 0, totalSkipped = 0, totalWarnings = 0, totalCreatedUsers = 0;
    
    // Batch processing
    let batchSize = membersToImport.length > 5000 ? 250 : 500;
    
    emitProgress(previewId, "processing", `Processing ${membersToImport.length} members...`, 20);

    for (let i = 0; i < membersToImport.length; i += batchSize) {
      const batch = membersToImport.slice(i, i + batchSize);
      
      const newMembers = [];
      const newUsers = [];
      const updateOperations = [];
      
      const hashPromises = batch.map(async (data) => {
        if (data.status === "invalid" && !data.isOverridden) {
          totalSkipped++;
          errorReport.push({ "Row": data.rowNum, "Member Number": data.memberNumber, "Reason": "Invalid row skipped." });
          return;
        }

        let existingMember = await Member.findOne({ memberNumber: data.memberNumber });
        
        if (existingMember && (options.conflictResolution === 'update' || options.updateExisting)) {
          // Update Mode — merge: keep existing value if Excel is blank
          const updateDoc = {
            firstName:        data.firstName        || existingMember.firstName,
            lastName:         data.lastName         || existingMember.lastName,
            name:             data.name             || existingMember.name,
            gender:           data.gender           || existingMember.gender,
            mobile:           data.mobile           || existingMember.mobile,
            alternateMobile:  data.alternateMobile  || existingMember.alternateMobile,
            whatsappMobile:   data.whatsappMobile   || existingMember.whatsappMobile,
            email:            data.email            || existingMember.email,
            bloodGroup:       data.bloodGroup       || existingMember.bloodGroup,
            dateOfBirth:      data.dateOfBirth ? new Date(data.dateOfBirth) : existingMember.dateOfBirth,
            weddingDate:      data.weddingDate ? new Date(data.weddingDate) : existingMember.weddingDate,
            profession:       data.profession       || existingMember.profession,
            company:          data.company          || existingMember.company,
            address:          data.address          || existingMember.address,
            city:             data.city             || existingMember.city,
            district:         data.district         || existingMember.district,
            state:            data.state            || existingMember.state,
            country:          data.country          || existingMember.country,
            pincode:          data.pincode          || existingMember.pincode,
            joiningYear:      data.joiningYear      || existingMember.joiningYear,
            clubPosition:     data.clubPosition     || existingMember.clubPosition,
            clubPositionYear: data.clubPositionYear || existingMember.clubPositionYear,
            spouseName:       data.spouseName       || existingMember.spouseName,
            spouseMemberId:   data.spouseMemberId   || existingMember.spouseMemberId,
            membershipType:   data.membershipType   || existingMember.membershipType,
          };
          updateOperations.push({
            updateOne: { filter: { _id: existingMember._id }, update: { $set: updateDoc } }
          });
          totalUpdated++;
          return;
        } else if (existingMember && (options.conflictResolution === 'replace')) {
          // Replace Mode — fully overwrite all fields from Excel
          const replaceDoc = {
            firstName:        data.firstName,
            lastName:         data.lastName,
            name:             data.name,
            gender:           data.gender,
            mobile:           data.mobile,
            alternateMobile:  data.alternateMobile,
            whatsappMobile:   data.whatsappMobile,
            email:            data.email,
            bloodGroup:       data.bloodGroup,
            dateOfBirth:      data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            weddingDate:      data.weddingDate ? new Date(data.weddingDate) : null,
            profession:       data.profession,
            company:          data.company,
            address:          data.address,
            city:             data.city,
            district:         data.district,
            state:            data.state,
            country:          data.country,
            pincode:          data.pincode,
            joiningYear:      data.joiningYear,
            clubPosition:     data.clubPosition,
            clubPositionYear: data.clubPositionYear,
            spouseName:       data.spouseName,
            spouseMemberId:   data.spouseMemberId,
            membershipType:   data.membershipType,
          };
          updateOperations.push({
            updateOne: { filter: { _id: existingMember._id }, update: { $set: replaceDoc } }
          });
          totalUpdated++;
          return;
        } else if (existingMember) {
          // Skip (default) — existing member, skip it
          totalSkipped++;
          return;
        }

        // Create Mode — map ALL member fields
        const memberId = new mongoose.Types.ObjectId();
        const memberDoc = {
          _id: memberId,
          memberNumber:     data.memberNumber,
          firstName:        data.firstName,
          lastName:         data.lastName,
          name:             data.name,
          gender:           data.gender,
          email:            data.email,
          mobile:           data.mobile,
          alternateMobile:  data.alternateMobile,
          whatsappMobile:   data.whatsappMobile,
          bloodGroup:       data.bloodGroup,
          dateOfBirth:      data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          weddingDate:      data.weddingDate ? new Date(data.weddingDate) : null,
          profession:       data.profession,
          company:          data.company,
          address:          data.address,
          city:             data.city,
          district:         data.district,
          state:            data.state,
          country:          data.country,
          pincode:          data.pincode,
          joiningYear:      data.joiningYear ? Number(data.joiningYear) : null,
          clubPosition:     data.clubPosition,
          clubPositionYear: data.clubPositionYear,
          spouseName:       data.spouseName,
          spouseMemberId:   data.spouseMemberId,
          membershipType:   data.membershipType,
          status: "active",
        };
        newMembers.push(memberDoc);

        if (options.createUsers) {
          const rawPassword = memberDoc.dateOfBirth ? formatPasswordDate(memberDoc.dateOfBirth) : generateRandomPassword();
          const hashedPassword = await bcrypt.hash(rawPassword, 8);
          newUsers.push({ username: memberDoc.memberNumber, password: hashedPassword, role: "member", memberId: memberId });
          totalCreatedUsers++;
          
          usernameReport.push({ "Member No": memberDoc.memberNumber, "Name": memberDoc.name, "Username": memberDoc.memberNumber });
          passwordReport.push({ "Member No": memberDoc.memberNumber, "Name": memberDoc.name, "Password": rawPassword });
          combinedReport.push({ 
            "Member No": memberDoc.memberNumber, 
            "Name": memberDoc.name, 
            "Mobile": memberDoc.mobile,
            "Email": memberDoc.email,
            "Username": memberDoc.memberNumber, 
            "Password": rawPassword, 
            "Role": "member" 
          });
        }
      });

      await Promise.all(hashPromises);

      if (newMembers.length > 0) {
        try {
          await Member.insertMany(newMembers, { ordered: false });
          totalImported += newMembers.length;
          if (newUsers.length > 0) await User.insertMany(newUsers, { ordered: false });
        } catch (err) {
          totalSkipped += newMembers.length;
          errorReport.push({ "Reason": err.message });
        }
      }

      if (updateOperations.length > 0) {
        await Member.bulkWrite(updateOperations, { ordered: false });
      }
      
      const currentProgress = Math.floor(20 + ((i + batchSize) / membersToImport.length) * 70);
      emitProgress(previewId, "importing", `Importing batch...`, Math.min(currentProgress, 90));
    }

    emitProgress(previewId, "reports", "Generating reports...", 95);
    const historyId = new mongoose.Types.ObjectId().toString();
    const reportsPath = {
      errors: path.join(REPORTS_DIR, `${historyId}-errors.json`),
      passwords: path.join(REPORTS_DIR, `${historyId}-passwords.json`),
      usernames: path.join(REPORTS_DIR, `${historyId}-usernames.json`),
      combined: path.join(REPORTS_DIR, `${historyId}-combined.json`)
    };

    fs.writeFileSync(reportsPath.errors, JSON.stringify(errorReport));
    fs.writeFileSync(reportsPath.passwords, JSON.stringify(passwordReport));
    fs.writeFileSync(reportsPath.usernames, JSON.stringify(usernameReport));
    fs.writeFileSync(reportsPath.combined, JSON.stringify(combinedReport));

    await ImportHistory.create({
      importId: historyId,
      fileName: originalFileName,
      originalFileName: originalFileName,
      totalRows: previewData.length,
      selectedRows: selectedRowIds.length,
      importedRows: totalImported,
      updatedRows: totalUpdated,
      skippedRows: totalSkipped,
      createdMembers: totalImported,
      createdUsers: totalCreatedUsers,
      invalidRows: previewData.filter(r => r.status === "invalid").length,
      warningRows: previewData.filter(r => r.status === "warning").length,
      duplicateExcelRows: previewData.filter(r => r.status === "duplicate_excel").length,
      duplicateDbRows: previewData.filter(r => r.status === "duplicate_db").length,
      overriddenRows: previewData.filter(r => r.status === "overridden").length,
      importStartedAt,
      importCompletedAt: new Date(),
      executionTime: ((Date.now() - importStartedAt.getTime()) / 1000).toFixed(1),
      importedBy: req.user.id,
      status: "Completed",
      reports: reportsPath
    });

    emitProgress(previewId, "completed", "Import completed successfully!", 100);

    res.status(201).json({
      success: true,
      message: `Processed ${membersToImport.length} records.`,
      data: { historyId, totalImported, totalUpdated, totalSkipped }
    });
  } catch (error) {
    if (req.body?.previewId) {
       emitProgress(req.body.previewId, "error", error.message || "Import failed", 100);
    }
    next(error);
  } finally {
    safeUnlink(previewFilePath);
  }
};

export const getImportHistoryReport = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const record = await ImportHistory.findOne({ importId: id }).lean();
    if (!record) return res.status(404).json({ success: false, message: "History not found" });

    // The base report is 'combined' for vcf/csv/json
    let filePath;
    if (type === "errors") filePath = record.reports?.errors;
    else if (type === "passwords") filePath = record.reports?.passwords;
    else if (type === "usernames") filePath = record.reports?.usernames;
    else if (type === "combined" || type === "vcf" || type === "csv") filePath = record.reports?.combined;

    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Report not found" });

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    if (type === "vcf") {
      let vcfContent = "";
      data.forEach(m => {
        vcfContent += "BEGIN:VCARD\nVERSION:3.0\n";
        vcfContent += `FN:${m.Name}\n`;
        if (m.Mobile) vcfContent += `TEL;TYPE=CELL:${m.Mobile}\n`;
        if (m.Email) vcfContent += `EMAIL;TYPE=PREF,INTERNET:${m.Email}\n`;
        vcfContent += `ORG:Lions Club Rajapalayam;Member No: ${m["Member No"]}\n`;
        vcfContent += "END:VCARD\n";
      });
      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="imported_contacts.vcf"`);
      return res.send(vcfContent);
    }
    
    if (type === "csv") {
      const header = Object.keys(data[0] || {}).join(",");
      const rows = data.map(d => Object.values(d).map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(","));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="imported_report.csv"`);
      return res.send([header, ...rows].join("\n"));
    }

    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getImportHistory = async (req, res, next) => {
  try {
    const history = await ImportHistory.find().sort({ createdAt: -1 }).populate("importedBy", "name").lean();
    res.status(200).json({ success: true, data: { history, pagination: { total: history.length } } });
  } catch (err) { next(err); }
};

export const getImportHistoryById = async (req, res, next) => {
  try {
    const record = await ImportHistory.findOne({ importId: req.params.id }).populate("importedBy", "name").lean();
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const deleteImportHistory = async (req, res, next) => {
  try {
    const record = await ImportHistory.findOne({ importId: req.params.id });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    
    safeUnlink(record.reports?.errors);
    safeUnlink(record.reports?.passwords);
    safeUnlink(record.reports?.usernames);
    safeUnlink(record.reports?.combined);
    
    await ImportHistory.deleteOne({ importId: req.params.id });
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};
