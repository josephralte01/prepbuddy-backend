const AuthService = require('./auth.service.js');
// User model is used by AuthService, not directly here typically

// Helper to handle service call errors
const handleServiceError = (res, error) => {
    console.error('Auth Service Error:', error.message || error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected server error occurred.';
    res.status(statusCode).json({ message });
};

exports.registerUser = async (req, res) => {
  try {
    const result = await AuthService.registerNewUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await AuthService.verifyUserEmail(token);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const result = await AuthService.resendUserVerificationEmail(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await AuthService.loginUser(req.body);
    const token = AuthService.generateAuthToken(user);
    AuthService.setTokenCookie(res, token);

    // Update last login time or activity (optional, can be in service)
    // user.lastLogin = new Date(); // Or lastActiveDate
    // await user.save({ validateBeforeSave: false }); // Avoid re-hashing password if not changed

    res.status(200).json({
      message: "Login successful",
      user: { // Return minimal, non-sensitive user info
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        tier: user.subscriptionTier,
      }
    });
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.logoutUser = (req, res) => {
  AuthService.clearTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
};

exports.getMe = (req, res) => { // No async needed if just returning req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated or user not found.' });
  }
  res.status(200).json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await AuthService.initiatePasswordReset(email);
    res.status(200).json(result); // Service handles non-existence of user gracefully
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await AuthService.validatePasswordResetToken(token);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await AuthService.resetUserPassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};
