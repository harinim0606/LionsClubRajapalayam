import Member from "../models/Member.js";
import CommunicationAudit from "../models/CommunicationAudit.js";
import ExcelJS from "exceljs";

/**
 * communicationController.js
 * 
 * Handles all backend logic for the Communication Module.
 * Strict Rule: Only returns Name, Mobile, Email, Member Number, Photo, Date of Birth, Wedding Date, Status, Blood Group.
 * Never exposes passwords, import history, or settings.
 */

const COMMUNICATION_FIELDS = "memberNumber name firstName lastName mobile alternateMobile whatsappMobile email avatar city dateOfBirth weddingDate bloodGroup status gender profession clubPosition membershipType joiningYear";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildFilterQuery = (filters = {}, search = "") => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
  if (filters.gender) query.gender = { $regex: new RegExp(`^${filters.gender}$`, "i") };
  if (filters.city) query.city = { $regex: new RegExp(filters.city, "i") };
  if (filters.occupation) query.profession = { $regex: new RegExp(filters.occupation, "i") };
  if (filters.clubPosition) query.clubPosition = filters.clubPosition;
  if (filters.zone) query.zone = { $regex: new RegExp(`^${filters.zone}$`, "i") };
  if (filters.region) query.region = { $regex: new RegExp(`^${filters.region}$`, "i") };
  if (filters.chapter) query.chapter = { $regex: new RegExp(`^${filters.chapter}$`, "i") };
  if (filters.membershipType) query.membershipType = filters.membershipType;
  
  if (filters.joinedFrom || filters.joinedTo) {
    query.joiningYear = {};
    if (filters.joinedFrom) query.joiningYear.$gte = parseInt(filters.joinedFrom);
    if (filters.joinedTo) query.joiningYear.$lte = parseInt(filters.joinedTo);
  }

  // Birthdays/Anniversaries specific month
  if (filters.birthdayMonth) {
    query.$expr = query.$expr || { $and: [] };
    query.$expr.$and.push({ $eq: [{ $month: "$dateOfBirth" }, parseInt(filters.birthdayMonth)] });
  }
  if (filters.anniversaryMonth) {
    query.$expr = query.$expr || { $and: [] };
    query.$expr.$and.push({ $eq: [{ $month: "$weddingDate" }, parseInt(filters.anniversaryMonth)] });
  }

  if (search && search.trim() !== "") {
    const s = search.trim();
    query.$or = [
      { name: { $regex: new RegExp(s, "i") } },
      { memberNumber: { $regex: new RegExp(s, "i") } },
      { mobile: { $regex: new RegExp(s, "i") } },
      { email: { $regex: new RegExp(s, "i") } }
    ];
  }

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

// ─── 1. Dashboard Stats ──────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const [totalMembers, withMobile, withEmail, missingMobile, missingEmail, todaysBirthdays, todaysAnniversaries] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ mobile: { $exists: true, $ne: "" } }),
      Member.countDocuments({ email: { $exists: true, $ne: "" } }),
      Member.countDocuments({ $or: [{ mobile: { $exists: false } }, { mobile: "" }] }),
      Member.countDocuments({ $or: [{ email: { $exists: false } }, { email: "" }] }),
      Member.countDocuments({
        status: "active",
        dateOfBirth: { $ne: null },
        $expr: {
          $and: [
            { $eq: [{ $month: "$dateOfBirth" }, currentMonth] },
            { $eq: [{ $dayOfMonth: "$dateOfBirth" }, currentDay] },
          ]
        }
      }),
      Member.countDocuments({
        status: "active",
        weddingDate: { $ne: null },
        $expr: {
          $and: [
            { $eq: [{ $month: "$weddingDate" }, currentMonth] },
            { $eq: [{ $dayOfMonth: "$weddingDate" }, currentDay] },
          ]
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: { totalMembers, withMobile, withEmail, missingMobile, missingEmail, todaysBirthdays, todaysAnniversaries }
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. Today's Birthdays ────────────────────────────────────────────────────
export const getBirthdays = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const members = await Member.find({ status: "active", dateOfBirth: { $ne: null } })
      .select(COMMUNICATION_FIELDS)
      .lean();

    const result = { today: [], thisWeek: [], thisMonth: [], upcoming30Days: [] };

    members.forEach(m => {
      const dob = new Date(m.dateOfBirth);
      const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      // If birthday has passed this year, next one is next year
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const diffTime = nextBirthday - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) result.today.push(m);
      if (diffDays <= 7) result.thisWeek.push(m);
      if (dob.getMonth() === today.getMonth()) result.thisMonth.push(m);
      if (diffDays <= 30) result.upcoming30Days.push(m);
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── 3. Today's Anniversaries ────────────────────────────────────────────────
export const getAnniversaries = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const members = await Member.find({ status: "active", weddingDate: { $ne: null } })
      .select(COMMUNICATION_FIELDS)
      .lean();

    const result = { today: [], thisWeek: [], thisMonth: [], upcoming30Days: [] };

    members.forEach(m => {
      const wd = new Date(m.weddingDate);
      const nextAnniv = new Date(today.getFullYear(), wd.getMonth(), wd.getDate());
      
      if (nextAnniv < today) {
        nextAnniv.setFullYear(today.getFullYear() + 1);
      }

      const diffTime = nextAnniv - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) result.today.push(m);
      if (diffDays <= 7) result.thisWeek.push(m);
      if (wd.getMonth() === today.getMonth()) result.thisMonth.push(m);
      if (diffDays <= 30) result.upcoming30Days.push(m);
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── 4. Filter Members ───────────────────────────────────────────────────────
export const getMembers = async (req, res, next) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 20;
    const skip = (page - 1) * limit;
    const { filters = {}, search = "" } = req.body;

    const query = buildFilterQuery(filters, search);
    
    // If age filter exists, we have to fetch all matching query, filter by age, then paginate in memory
    // Otherwise we can paginate in DB
    if (filters.ageFrom || filters.ageTo) {
      let members = await Member.find(query).select(COMMUNICATION_FIELDS).sort({ name: 1 }).lean();
      members = applyAgeFilter(members, filters.ageFrom, filters.ageTo);
      const total = members.length;
      const paginated = members.slice(skip, skip + limit);
      return res.status(200).json({
        success: true,
        data: {
          members: paginated,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    // Normal DB pagination
    const [members, total] = await Promise.all([
      Member.find(query)
        .select(COMMUNICATION_FIELDS)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Member.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: { members, total, page, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// ─── 5. Export Selected Contacts ─────────────────────────────────────────────
export const exportContacts = async (req, res, next) => {
  try {
    const { ids = [], format = "xlsx", filters = {}, search = "" } = req.body;
    
    let query = {};
    if (ids && ids.length > 0) {
      query = { _id: { $in: ids } };
    } else {
      query = buildFilterQuery(filters, search);
    }

    let members = await Member.find(query).select("memberNumber name mobile email city status").lean();
    
    if (ids.length === 0 && (filters.ageFrom || filters.ageTo)) {
      members = applyAgeFilter(members, filters.ageFrom, filters.ageTo);
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `LionsClub_Contacts_${dateStr}`;

    if (format === "csv") {
      let csvContent = "Member No,Name,Mobile,Email,City,Status\n";
      members.forEach(m => {
        csvContent += `"${m.memberNumber || ""}","${m.name || ""}","${m.mobile || ""}","${m.email || ""}","${m.city || ""}","${m.status || ""}"\n`;
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);
      return res.status(200).send(csvContent);
    } 
    
    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}.json"`);
      return res.status(200).send(JSON.stringify(members, null, 2));
    }

    if (format === "vcf") {
      let vcfContent = "";
      members.forEach(m => {
        vcfContent += "BEGIN:VCARD\nVERSION:3.0\n";
        vcfContent += `FN:${m.name}\n`;
        if (m.mobile) vcfContent += `TEL;TYPE=CELL:${m.mobile}\n`;
        if (m.email) vcfContent += `EMAIL;TYPE=PREF,INTERNET:${m.email}\n`;
        if (m.city) vcfContent += `ADR;TYPE=HOME:;;;${m.city};;;;\n`;
        if (m.memberNumber) vcfContent += `ORG:Lions Club Rajapalayam;Member No: ${m.memberNumber}\n`;
        vcfContent += "END:VCARD\n";
      });
      res.setHeader("Content-Type", "text/vcard");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}.vcf"`);
      return res.status(200).send(vcfContent);
    }

    // Excel Format (xlsx)
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Contacts");
    ws.columns = [
      { header: "Member No", key: "memberNumber", width: 15 },
      { header: "Name", key: "name", width: 30 },
      { header: "Mobile", key: "mobile", width: 18 },
      { header: "Email", key: "email", width: 30 },
      { header: "City", key: "city", width: 20 },
      { header: "Status", key: "status", width: 12 },
    ];
    
    ws.getRow(1).eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A2A5E" } };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    });

    members.forEach(m => ws.addRow(m));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}.xlsx"`);
    await wb.xlsx.write(res);

  } catch (error) {
    next(error);
  }
};

// ─── 6. Log Communication ────────────────────────────────────────────────────
export const logCommunication = async (req, res, next) => {
  try {
    const { action, type, recipientsCount, successCount, failedCount, cancelled, timeTakenMs, status } = req.body;
    
    await CommunicationAudit.create({
      user: req.user._id,
      role: req.user.role,
      action,
      type,
      recipientsCount,
      successCount,
      failedCount,
      cancelled,
      timeTakenMs,
      status
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error("Audit log failed:", error);
    res.status(200).json({ success: false, message: "Audit log failed" });
  }
};
