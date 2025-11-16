export const resetPasswordTemplate = (userName, resetLink) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:30px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <h2 style="color:#222; text-align:center; margin-bottom:20px;">Reset Your Password</h2>
  
        <p style="font-size:16px; color:#333;">Hello <strong>${userName}</strong>,</p>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          We received a request to reset your password for your Forever account.
          If you made this request, please click the button below to set a new password.
        </p>
  
        <div style="text-align:center; margin:30px 0;">
          <a href="${resetLink}" target="_blank" rel="noopener"
             style="display:inline-block; background-color:#000; color:#fff; text-decoration:none; padding:12px 24px; border-radius:5px; font-size:15px;">
            Set New Password
          </a>
        </div>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          This link will expire in <strong>1 hour</strong> for security reasons. If you didn’t request a password reset, you can safely ignore this email.
        </p>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          Need help? Contact our <a href="${
            process.env.FRONTEND_URL || "https://yourwebsite.com/contact"
          }" style="color:#007bff; text-decoration:none;">support team</a>.
        </p>
  
        <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />
  
        <p style="font-size:13px; color:#888; text-align:center;">
          This is an automated message. Please do not reply.<br/>
          © ${new Date().getFullYear()} Forever Store. All rights reserved.
        </p>
  
      </div>
    </div>
    `;
  };
  