const loginOtpTemplate = (otp, name) => {
  return `
    <div style="font-family:Arial; padding:20px; background:#f8f8f8;">
      <div style="max-width:500px; background:#fff; padding:25px; border-radius:10px; margin:auto;">
        <h2>Hello ${name},</h2>
        <p>Your login OTP is:</p>

        <h1 style="background:#000; color:#fff; padding:10px; border-radius:6px; text-align:center;">
          ${otp}
        </h1>

        <p style="margin-top:20px;">This OTP expires in 5 minutes.</p>
      </div>
    </div>
  `;
};

export default loginOtpTemplate;
