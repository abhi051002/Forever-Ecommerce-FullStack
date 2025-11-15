const registerOtpTemplate = (otp, name) => {
  return `
    <div style="font-family:Arial, sans-serif; padding:20px; background:#f6f6f6;">
      <div style="max-width:500px; margin:auto; background:white; padding:25px; border-radius:8px;">
        <h2 style="color:#333;">Welcome ${name} 👋</h2>
        <p style="font-size:16px;">Thank you for registering!</p>
        <p style="font-size:18px; margin-top:10px;">Your email verification OTP is:</p>

        <h1 style="letter-spacing:4px; text-align:center; background:#000; color:#fff; padding:10px; border-radius:6px;">
          ${otp}
        </h1>

        <p style="margin-top:20px; color:#444;">This OTP is valid for 5 minutes.</p>
        <p>If you didn't request this, please ignore.</p>
      </div>
    </div>
  `;
};

export default registerOtpTemplate;
