export const changePasswordTemplate = (userName) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:30px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <h2 style="color:#222; text-align:center; margin-bottom:20px;">Your Password Has Been Changed</h2>
  
        <p style="font-size:16px; color:#333;">Hello <strong>${userName}</strong>,</p>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          We wanted to let you know that the password for your account was successfully changed.
        </p>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          If this was you, no further action is required. You can now log in using your new password.
        </p>
  
        <div style="text-align:center; margin:30px 0;">
          <a href="${
            process.env.FRONTEND_URL || "https://yourwebsite.com/login"
          }"
             style="display:inline-block; background-color:#000; color:#fff; text-decoration:none; padding:12px 24px; border-radius:5px; font-size:15px;">
            Go to Login
          </a>
        </div>
  
        <p style="font-size:15px; color:#555; line-height:1.6;">
          If you didn’t request this change, please <a href="${
            process.env.FRONTEND_URL || "https://yourwebsite.com/forgot"
          }" style="color:#007bff; text-decoration:none;">reset your password</a> immediately
          or contact our support team.
        </p>
  
        <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />
  
        <p style="font-size:13px; color:#888; text-align:center;">
          This is an automated email. Please do not reply.<br/>
          © ${new Date().getFullYear()} Forever Store. All rights reserved.
        </p>
  
      </div>
    </div>
    `;
  };
  