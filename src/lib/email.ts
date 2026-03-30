import nodemailer from 'nodemailer';

export async function sendVerificationCodeEmail(to: string, code: string, userName: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("\n=======================================================");
        console.warn("⚠️ NO EMAIL_USER OR EMAIL_PASS CONFIGURED IN .env ⚠️");
        console.warn(`이메일 발송 시뮬레이션: [수신자: ${to}]`);
        console.warn(`인증번호 6자리: ${code}`);
        console.warn("=======================================================\n");
        return 'simulated';
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"AGRA HR 시스템" <${process.env.EMAIL_USER}>`,
        to,
        subject: '[AGRA] HR 시스템 비밀번호 설정 인증번호',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #111827; margin: 0;">비밀번호 설정 인증번호</h1>
                </div>
                <p style="color: #374151; font-size: 16px;">안녕하세요, <b>${userName}</b>님.</p>
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 25px; border-radius: 6px; margin: 25px 0; text-align: center;">
                    <p style="color: #1e3a8a; font-size: 15px; margin: 0 0 15px 0;">아래의 6자리 인증번호를 화면에 입력해 주세요.</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1d4ed8;">
                        ${code}
                    </div>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.5;">
                    이 인증번호는 보안을 위해 발행 후 <strong>15분 동안만 유효</strong>합니다.<br/>
                    만약 본인이 요청하지 않으셨다면 이 이메일을 무시해 주시기 바랍니다.<br/>
                    감사합니다.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Nodemailer send email error:", error);
        return false;
    }
}
