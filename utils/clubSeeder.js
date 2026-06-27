import ClubSettings from "../models/ClubSettings.js";
import Member from "../models/Member.js";

const seedClubSettings = async () => {
  try {
    // Check if ClubSettings already exists (singleton collection)
    const existingSettings = await ClubSettings.findOne();
    if (existingSettings) {
      console.log("ClubSettings already exists. Seeding skipped.");
      return;
    }

    // Resolve President, Secretary, Treasurer ObjectIds
    const presMember = await Member.findOne({ memberNumber: "3092059" }).lean();
    const secMember = await Member.findOne({ memberNumber: "26738509" }).lean();
    const treasMember = await Member.findOne({ memberNumber: "26738484" }).lean();

    const newSettings = new ClubSettings({
      clubName: "Lions Club of Rajapalayam",
      clubNumber: "026498",
      inauguratedOn: "09-02-1972",
      charteredOn: "14-05-1972",
      region: "Sathuragiri",
      zone: "41",
      mjfCount: 10,
      meetingDays: "I & III Monday",
      meetingTime: "7:20 PM",
      meetingVenue: "P.D.G. Lion P.A.B. Raju A/C Golden Jubilee Hall Sankarankovil Road",
      sponsoredBy: "Lions Club of Madurai Host",
      clubsSponsored: [
        "Srivilliputtur",
        "Meenakshiyapuram Centennial",
        "Dhalavaipuram",
        "Arasu Nagar",
        "Tirunelveli Smart City",
        "Kings",
        "Sivakasi Joy Star",
        "Sankarankovil",
        "Tirunelveli Dawn City",
      ],
      permanentProjects: ["Anti Asthma Camp", "Bus Shelters"],
      currentLionisticYear: "2025-2026",
      clubLogo: "", // Placeholder for logo path
      president: presMember ? presMember._id : null,
      secretary: secMember ? secMember._id : null,
      treasurer: treasMember ? treasMember._id : null,
    });

    await newSettings.save();
    console.log("Successfully seeded default Club Settings.");
  } catch (error) {
    console.error("Error seeding Club Settings:", error);
  }
};

export default seedClubSettings;
