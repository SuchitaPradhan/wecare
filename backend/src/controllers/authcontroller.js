const User    = require("../models/user");
const OTP     = require("../models/OTP");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      role: role || "patient",
      password: hashedPassword,
    });

    // Never send password back
    res.status(201).json({
      message: "Registered successfully",
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET PROFILE ───────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "dob", "gender", "bloodGroup",
      "address", "allergies", "emergencyContact",
      // Doctor fields
      "specialty", "qualification", "experience", "hospital",
      "city", "shifts", "languages", "isAvailable"
    ];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── FORGOT PASSWORD (Generate OTP) ────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Terminal log for dev (T13 requirement)
    console.log(`\n===========================================`);
    console.log(`🔐 OTP GENERATED FOR ${email}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log(`===========================================\n`);

    await OTP.deleteMany({ email }); // Remove old OTPs for this email
    await OTP.create({ email, otp });

    res.json({ message: "OTP sent successfully (Check terminal for development)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── RESET PASSWORD (Verify OTP) ───────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    await OTP.deleteOne({ _id: validOtp._id }); // Single use OTP

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE PASSWORD (WITH OLD PASSWORD) ───────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};