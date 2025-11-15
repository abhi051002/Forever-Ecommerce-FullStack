const resendRegisterOtpTemplate = (otp, name) => {
  return `
    <div style="font-family:Arial; padding:20px; background:#eee;">
      <div style="max-width:500px; background:white; padding:25px; border-radius:10px; margin:auto;">
        <h2>Hello ${name},</h2>
        <p>Your new email verification OTP is:</p>

        <h1 style="background:#111; color:white; padding:10px; border-radius:6px; text-align:center;">
          ${otp}
        </h1>

        <p>This replaces your previous OTP.</p>
      </div>
    </div>
  `;
};

export default resendRegisterOtpTemplate;
