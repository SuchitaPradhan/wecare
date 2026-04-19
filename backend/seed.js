const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./src/models/user");

dotenv.config();

const doctors = [
  { name: "Dr Samir Sahu", specialty: "Pulmonology", city: "Bhubaneswar", experience: 44, hospital: "Apollo Hospitals", rating: 4.8, qualification: "MBBS, MD (Pulmonary Medicine)", shifts: "Mon - Sat : 10:00 AM - 02:00 PM", languages: ["English", "Hindi", "Odia"] },
  { name: "Dr Manoj Kishor Chhotray", specialty: "Internal Medicine", city: "Delhi", experience: 40, hospital: "Fortis Hospital", rating: 4.6, qualification: "MBBS, MD (General Medicine)", shifts: "Mon - Fri : 09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM", languages: ["English", "Hindi"] },
  { name: "Dr Pitambar Prusty", specialty: "Endocrinology", city: "Bhubaneswar", experience: 37, hospital: "Apollo Hospitals", rating: 4.7, qualification: "MBBS, MD, DM (Endocrinology)", shifts: "Mon - Sat : 11:00 AM - 03:00 PM", languages: ["English", "Odia"] },
  { name: "Dr Ananya Sharma", specialty: "Cardiology", city: "Mumbai", experience: 18, hospital: "Lilavati Hospital", rating: 4.5, qualification: "MBBS, MD, DM (Cardiology)", shifts: "Mon - Fri : 10:00 AM - 04:00 PM", languages: ["English", "Hindi", "Marathi"] },
  { name: "Dr Rakesh Mehta", specialty: "Orthopedics", city: "Bangalore", experience: 22, hospital: "Manipal Hospital", rating: 4.4, qualification: "MBBS, MS (Orthopedics)", shifts: "Tue - Sun : 09:00 AM - 12:00 PM", languages: ["English", "Kannada", "Hindi"] },
  { name: "Dr Sneha Verma", specialty: "Dermatology", city: "Chennai", experience: 12, hospital: "MIOT International", rating: 4.3, qualification: "MBBS, MD (Dermatology)", shifts: "Mon - Sat : 02:00 PM - 06:00 PM", languages: ["English", "Tamil", "Hindi"] },
  { name: "Dr Kunal Arora", specialty: "Neurology", city: "Hyderabad", experience: 25, hospital: "Yashoda Hospital", rating: 4.6, qualification: "MBBS, MD, DM (Neurology)", shifts: "Mon - Fri : 10:00 AM - 02:00 PM", languages: ["English", "Hindi", "Telugu"] },
  { name: "Dr Meera Nair", specialty: "Gynecology", city: "Kochi", experience: 15, hospital: "Aster Medcity", rating: 4.5, qualification: "MBBS, MS (Obs & Gynae)", shifts: "Mon - Sat : 09:00 AM - 01:00 PM", languages: ["English", "Malayalam", "Hindi"] },
  { name: "Dr Arjun Rao", specialty: "Pediatrics", city: "Pune", experience: 10, hospital: "Ruby Hall Clinic", rating: 4.2, qualification: "MBBS, MD (Pediatrics)", shifts: "Mon - Sat : 10:00 AM - 02:00 PM, 06:00 PM - 08:00 PM", languages: ["English", "Marathi", "Hindi"] },
  { name: "Dr Priyanka Singh", specialty: "Psychiatry", city: "Kolkata", experience: 14, hospital: "AMRI Hospital", rating: 4.4, qualification: "MBBS, MD (Psychiatry)", shifts: "Tue - Sun : 11:00 AM - 05:00 PM", languages: ["English", "Bengali", "Hindi"] },
  { name: "Dr Vikram Iyer", specialty: "Gastroenterology", city: "Delhi", experience: 20, hospital: "Max Hospital", rating: 4.6, qualification: "MBBS, MD, DM (Gastroenterology)", shifts: "Mon - Sat : 09:00 AM - 01:00 PM", languages: ["English", "Hindi", "Tamil"] },
  { name: "Dr Rahul Das", specialty: "Nephrology", city: "Bhubaneswar", experience: 17, hospital: "Care Hospital", rating: 4.3, qualification: "MBBS, MD, DM (Nephrology)", shifts: "Mon - Sat : 10:00 AM - 02:00 PM", languages: ["English", "Hindi", "Odia"] },
  { name: "Dr Pooja Malhotra", specialty: "Oncology", city: "Mumbai", experience: 19, hospital: "Tata Memorial Hospital", rating: 4.8, qualification: "MBBS, MD, DM (Medical Oncology)", shifts: "Mon - Fri : 09:00 AM - 05:00 PM", languages: ["English", "Hindi", "Marathi"] },
  { name: "Dr Sandeep Reddy", specialty: "Urology", city: "Hyderabad", experience: 23, hospital: "KIMS Hospital", rating: 4.5, qualification: "MBBS, MS, MCh (Urology)", shifts: "Mon - Sat : 10:00 AM - 02:00 PM", languages: ["English", "Telugu", "Hindi"] },
  { name: "Dr Kavita Joshi", specialty: "Ophthalmology", city: "Ahmedabad", experience: 16, hospital: "Shalby Hospital", rating: 4.4, qualification: "MBBS, MS (Ophthalmology)", shifts: "Mon - Sat : 09:30 AM - 01:30 PM", languages: ["English", "Gujarati", "Hindi"] },
  { name: "Dr Nitin Kapoor", specialty: "ENT", city: "Jaipur", experience: 13, hospital: "Naracheckyana Hospital", rating: 4.2, qualification: "MBBS, MS (ENT)", shifts: "Mon - Sat : 10:00 AM - 02:00 PM", languages: ["English", "Hindi", "Rajasthani"] },
  { name: "Dr Alka Gupta", specialty: "Radiology", city: "Lucknow", experience: 21, hospital: "Medanta Hospital", rating: 4.6, qualification: "MBBS, MD (Radiology)", shifts: "Mon - Sat : 08:00 AM - 04:00 PM", languages: ["English", "Hindi"] },
  { name: "Dr Deepak Mishra", specialty: "General Surgery", city: "Chennai", experience: 28, hospital: "Apollo Hospitals", rating: 4.7, qualification: "MBBS, MS (General Surgery)", shifts: "Mon - Fri : 09:00 AM - 02:00 PM", languages: ["English", "Hindi", "Tamil"] },
  { name: "Dr Shweta Patil", specialty: "Anesthesiology", city: "Nagpur", experience: 11, hospital: "Wockhardt Hospital", rating: 4.1, qualification: "MBBS, MD (Anesthesiology)", shifts: "Mon - Sat : 10:00 AM - 06:00 PM", languages: ["English", "Hindi", "Marathi"] },
  { name: "Dr Harsh Vardhan", specialty: "Plastic Surgery", city: "Delhi", experience: 26, hospital: "BLK Hospital", rating: 4.7, qualification: "MBBS, MS, MCh (Plastic Surgery)", shifts: "Tue - Sun : 11:00 AM - 03:00 PM", languages: ["English", "Hindi"] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Hash a default password for all seeded doctors
    const hashedPassword = await bcrypt.hash("doctor123", 10);

    // ── Seed doctors ──────────────────────────────────────
    for (const doc of doctors) {
      const email = doc.name.toLowerCase().replace(/\s+/g, ".").replace(/^dr\.?/, "dr") + "@wecare.com";
      const exists = await User.findOne({ email });
      if (!exists) {
        await User.create({
          ...doc,
          email,
          phone: "9876543210",
          password: hashedPassword,
          role: "doctor",
          isAvailable: true,
        });
        console.log(`  ✅ Created doctor: ${doc.name}`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${doc.name}`);
      }
    }

    // ── Seed admin ────────────────────────────────────────
    const adminEmail = "admin@wecare.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const adminPass = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: adminEmail,
        phone: "9999999999",
        password: adminPass,
        role: "admin",
      });
      console.log("  ✅ Created admin user (admin@wecare.com / admin123)");
    } else {
      console.log("  ⏭️  Skipped (exists): Admin");
    }

    // ── Seed test patient ─────────────────────────────────
    const patientEmail = "patient@wecare.com";
    const patientExists = await User.findOne({ email: patientEmail });
    if (!patientExists) {
      const patientPass = await bcrypt.hash("patient123", 10);
      await User.create({
        name: "Suchita",
        email: patientEmail,
        phone: "9876543210",
        password: patientPass,
        role: "patient",
        gender: "Female",
        bloodGroup: "B+",
        dob: "14 March 1995",
        address: "Bhubaneswar, Odisha, India",
      });
      console.log("  ✅ Created test patient (patient@wecare.com / patient123)");
    }

    console.log("\n🎉 Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
