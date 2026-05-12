const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');  
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'otilia.schowalter86@ethereal.email',
        pass: '9xrXpWWRayjYkmBcGf'
    }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, role: role || 'student' });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/add-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin email already exists!' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ name, email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: 'Server error occurred' });
  }
});
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/admins/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found in our database.' });
    }
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 15 * 60 * 1000;  
    await user.save();
    const mailOptions = {
       from: '"UniSchedule System"',
      to: user.email,
      subject: 'UniSchedule - Password Reset OTP',
      text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis code is valid for 15 minutes.`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    console.error("Email Error: ", error);
    res.status(500).json({ message: 'Error sending email. Check server configuration.' });
  }
});
 router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetOTP: otp, 
      resetOTPExpiry: { $gt: Date.now() }  
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
     const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
     user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();
    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { profileImage, name } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }
    if (name !== undefined) {
      user.name = name;
    }
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, email: user.email, name: user.name, role: user.role, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;