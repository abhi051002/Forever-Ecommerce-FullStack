const resendLoginOtpTemplate = (otp, name) => {
  return `
    <div style="font-family:Arial; padding:20px; background:#eaeaea;">
      <div style="max-width:500px; background:#fff; padding:25px; border-radius:10px; margin:auto;">
        <h2>Hello ${name},</h2>
        <p>Your new login OTP is:</p>

        <h1 style="background:#222; color:white; padding:10px; border-radius:6px; text-align:center;">
          ${otp}
        </h1>

        <p>This OTP is valid for 5 minutes.</p>
      </div>
    </div>
  `;
};

export default resendLoginOtpTemplate;
