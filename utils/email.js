const nodemailer = require('nodemailer');

// Konfiguracja transportera email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true dla 465, false dla innych portów
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Weryfikacja konfiguracji
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Błąd konfiguracji email:', error);
  } else {
    console.log('✅ Serwer email gotowy do wysyłania wiadomości');
  }
});

// Funkcja wysyłająca email weryfikacyjny
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  const mailOptions = {
    from: `"Business Analysis Platform" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '✅ Potwierdź swoje konto',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Witaj w Business Analysis!</h1>
          </div>
          <div class="content">
            <h2>Potwierdź swoje konto</h2>
            <p>Dziękujemy za rejestrację! Aby aktywować swoje konto, kliknij w poniższy przycisk:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Potwierdź email</a>
            </div>
            <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>Link jest ważny przez 24 godziny.</strong></p>
            <p>Jeśli nie rejestrowałeś się na naszej platformie, zignoruj tę wiadomość.</p>
          </div>
          <div class="footer">
            <p>© 2024 Business Analysis Platform | Flowmanaged</p>
            <p>Masz pytania? Napisz do nas: <a href="mailto:flowmanaged@gmail.com">flowmanaged@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email weryfikacyjny wysłany do: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila:', error);
    throw error;
  }
};

// Funkcja wysyłająca email z linkiem do resetu hasła
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Business Analysis Platform" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '🔑 Resetowanie hasła',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Resetowanie hasła</h1>
          </div>
          <div class="content">
            <h2>Otrzymaliśmy prośbę o reset hasła</h2>
            <p>Aby ustawić nowe hasło, kliknij w poniższy przycisk:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Ustaw nowe hasło</a>
            </div>
            <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Ważne:</strong>
              <ul>
                <li>Link jest ważny przez 1 godzinę</li>
                <li>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość</li>
                <li>Twoje hasło pozostanie niezmienione</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Business Analysis Platform | Flowmanaged</p>
            <p>Masz pytania? Napisz do nas: <a href="mailto:flowmanaged@gmail.com">flowmanaged@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email resetujący hasło wysłany do: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
