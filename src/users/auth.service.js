const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./user.model.js');
const { sendEmail } = require('../../shared/utils/emailService.js'); // emailService will use config internally
const config = require('../../shared/config/env.js');

class AuthService {
    async registerNewUser({ name, email, password }) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw { statusCode: 409, message: 'Email already exists.' };
        }

        let baseUsername = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '') || 'user';
        if (baseUsername.length < 3) baseUsername = `user${baseUsername}`;
        let username = baseUsername;
        let count = 1;
        while (await User.findOne({ username })) {
            username = `${baseUsername}${count++}`;
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = Date.now() + 24 * 3600000; // 24 hours

        const newUser = new User({
            name,
            email,
            password,
            username,
            verificationToken,
            verificationTokenExpiry
        });
        await newUser.save();

        const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
        const emailHtml = `<p>Hi ${name},</p><p>Please verify your email by clicking this link: <a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p>`;
        await sendEmail({ to: email, subject: 'Verify Your PrepBuddy Email', html: emailHtml });

        return { message: 'Registration successful. Verification email sent.' };
    }

    async verifyUserEmail(token) {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired verification token. Please request a new one.' };
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        return { message: 'Email verified successfully. You may now log in.' };
    }

    async resendUserVerificationEmail(userId) {
        const user = await User.findById(userId);
        if (!user) throw { statusCode: 404, message: 'User not found.' };
        if (user.isVerified) throw { statusCode: 400, message: 'Email is already verified.' };

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = Date.now() + 24 * 3600000; // 24 hours
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();

        const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
        const emailHtml = `<p>Hi ${user.name},</p><p>Please verify your email by clicking this link: <a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p>`;
        await sendEmail({ to: user.email, subject: 'Resend: Verify Your PrepBuddy Email', html: emailHtml });

        return { message: 'Verification email resent successfully.' };
    }

    async loginUser({ email, password }) {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw { statusCode: 401, message: 'Invalid email or password.' };
        }
        if (!user.isVerified) {
            throw { statusCode: 403, message: 'Please verify your email before logging in.' };
        }
        return user; // Return full user object for token generation
    }

    generateAuthToken(user) {
        return jwt.sign(
            { userId: user._id, role: user.role, tier: user.subscriptionTier },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }

    setTokenCookie(res, token) {
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: config.nodeEnv === 'production' ? 'None' : 'Lax',
            maxAge: config.jwt.cookieExpiresInDays * 24 * 60 * 60 * 1000
        });
    }

    clearTokenCookie(res) {
        res.cookie('token', '', {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: config.nodeEnv === 'production' ? 'None' : 'Lax',
            expires: new Date(0)
        });
    }

    async initiatePasswordReset(email) {
        const user = await User.findOne({ email });
        if (!user) {
            // To prevent email enumeration, don't reveal if user exists
            return { message: 'If an account with this email exists, a password reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
        const emailHtml = `<p>Hi ${user.name},</p><p>To reset your password, click this link: <a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 1 hour.</p>`;
        await sendEmail({ to: user.email, subject: 'PrepBuddy Password Reset Request', html: emailHtml });

        return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }

    async validatePasswordResetToken(token) {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired password reset token.' };
        }
        return { message: 'Token is valid.' };
    }

    async resetUserPassword(token, newPassword) {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetTokenExpiry: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired password reset token.' };
        }

        user.password = newPassword; // Pre-save hook will hash
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        await user.save();

        return { message: 'Password reset successful. You can now log in with your new password.' };
    }
}

module.exports = new AuthService();
