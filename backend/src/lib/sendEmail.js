export const sendWelcomeEmail = async (email, fullName) => {
	try {
		const response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.BREVO_API_KEY,
			},
			body: JSON.stringify({
				sender: {
					name: "PASO",
					email: process.env.BREVO_EMAIL,
				},
				to: [{ email }],
				subject: "Welcome to PASO - the best chat app",
				htmlContent: `
          <div style="font-family:sans-serif;">
            <h2>Welcome to PASO</h2>
            <p>Hey ${fullName},</p>
            <p>Welcome to <b>PASO</b> — the best AI/ML integrated chat-app.</p>
            <p>Smart replies. Toxic detection. AI assistant.</p>
            <p>Let’s chat smarter 😎</p>
          </div>
        `,
			}),
		});

		const data = await response.text();

		if (!response.ok) {
			console.error("Brevo API Error:", data);
		} else {
			console.log("Email sent successfully:", data);
		}
	} catch (error) {
		console.error("Brevo error:", error);
	}
};

export const sendOtpEmail = async (email, otp) => {
	console.log("BREVO_EMAIL:", process.env.BREVO_EMAIL);
	console.log("BREVO_API_KEY loaded:", !!process.env.BREVO_API_KEY);
	console.log("OTP email sent Successfully");

	if (
		!process.env.BREVO_API_KEY ||
		process.env.BREVO_API_KEY === "your_brevo_api_key" ||
		process.env.BREVO_API_KEY === "dummy"
	) {
		return;
	}

	try {
		const response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.BREVO_API_KEY,
			},
			body: JSON.stringify({
				sender: {
					name: "PASO Support",
					email: process.env.BREVO_EMAIL,
				},
				to: [{ email }],
				subject: "PASO - Password Reset OTP",
				htmlContent: `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
            <h2 style="color:#4F46E5; text-align:center;">PASO Password Recovery</h2>
            <p>Hello,</p>
            <p>You requested to recover your password. Please use the following One-Time Password (OTP) to complete the verification process:</p>
            <div style="text-align:center; margin:30px 0;">
            <span style="font-size:32px; font-weight:bold; letter-spacing:6px; background-color:#F3F4F6; padding:10px 24px; border-radius:8px; border:1px solid #d1d5db; color:#1F2937;">${otp}</span>
            </div>
            <p style="color:#ef4444; font-weight:bold;">This OTP is valid for 5 minutes only.</p>
            <p>If you did not initiate this request, please ignore this email.</p>
            <p style="margin-top:40px; border-top:1px solid #e0e0e0; padding-top:20px; font-size:12px; color:#9ca3af; text-align:center;">
            PASO Chat App Security Team
            </p>
        </div>
        `,
			}),
		});

		const data = await response.text();
		if (!response.ok) {
			console.error("Brevo API Error (OTP):", data);
		} else {
			console.log("OTP Email sent successfully:", data);
		}
	} catch (error) {
		console.error("Brevo OTP email error:", error);
	}
};

export const sendVerificationOtpEmail = async (email, otp) => {
	if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key" || process.env.BREVO_API_KEY === "dummy") { return; }
	try {
		const response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": process.env.BREVO_API_KEY,
			},
			body: JSON.stringify({
				sender: {
					name: "PASO-Support",
					email: process.env.BREVO_EMAIL,
				},
				to: [{ email }],
				subject: "Verify your PASO Account",
				htmlContent:
					`<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border: 1px solid #e0e0e0; border-radius:8px;">
						<h2 style="color:#4F46E5; text-align:center;">Verify Your Email</h2>
						<p>Welcome to PASO!</p>
						<p>Use the follwing One-Time_Password (OTP) for verify your email address:</p>
						<div style="text-align:center; margin:30px 0;">
							<span style="font-size:32px; font-weight:bold; letter-spacing:6px; background-color:#F3F4F6; padding:10px 24px; border-radius:8px; border:1px solid #d1d5db; color:#1F2937;">${otp}</span>
						</div>
						<p style="color:#ef4444; font-weight:bold">This OTP is valid for 5 minutes.</p>
						<p>If you did not create this account, you can safely ignore this email.</p>
						<p style="margin-top:40px; border-top:1px solid #e0e0e0; padding-top:20px; font-size:12px; color:#9ca3af; text-align:center;">PASO Security Team</p>
					</div>`
			}),
		});
		const data = await response.text();
		if (!response.ok) {
			console.error("Brevo API Error (Verification OTP):", data);
		} else {
			console.log("Verification OTP email sent successfully:", data);
		}
	} catch (error) {
		console.error("Verification OTP email error:", error);
	}
};