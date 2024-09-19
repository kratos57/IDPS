const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Add this line
const Token = require('../model/token');
const User = require('../model/user');


exports.register = async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Check if user already exists by email or username
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ message: 'Email already registered' });
      }

      user = await User.findOne({ username });
      if (user) {
          return res.status(400).json({ message: 'Username already taken' });
      }

      // Create and save the user
      user = new User({ username, email, password });
      await user.save();

      // Generate token
      const token = new Token({
          userId: user._id,
          token: crypto.randomBytes(16).toString('hex')
      });
      await token.save();

      // Send verification email
      const verifyUrl = `http://localhost:5000/api/auth/verify/${token.token}`;
      await sendVerificationEmail(user.email, verifyUrl);

      res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

const sendVerificationEmail = async (email, link) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // Standard port for TLS
            secure: false, // Use true for port 465, false for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Verification',
            html: `
                <p>Please verify your email by clicking the link below:</p>
                <a href="${link}">${link}</a>
            `,
        });

        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

exports.activateAccount = async (req, res) => {
  try {
      const token = await Token.findOne({ token: req.params.token });

      if (!token) {
          return res.status(404).send("Token not found or expired");
      }

      await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
      await Token.findByIdAndDelete(token._id);

      res.status(200).send('Email Verified Successfully. You can now log in.');
  } catch (error) {
      console.error('Account activation error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.verified) {
      return res.status(400).json({ message: 'Invalid email or password, or email not verified' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Sign the JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

    // Include user role and username in the response
    res.status(200).json({
      token,
      user: {
        role: user.role,
        username: user.username  // Include username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1d" });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

 const resetUrl = `http://localhost:4200/reset-password/${user._id}/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click the following link to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    });

    console.log("Reset password email sent");

    // Send the token back to the client in the response
    res.status(200).json({ message: "Reset password email sent", token: token });

  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.changePassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    jwt.verify(token, "your_jwt_secret", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Directly update the password without hashing it
      await User.findByIdAndUpdate(id, { password: password });

      res.status(200).json({ message: "Password changed successfully" });
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};
