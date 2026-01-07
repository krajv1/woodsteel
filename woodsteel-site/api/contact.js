import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Proszę wypełnić wszystkie wymagane pola.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.CONTACT_EMAIL,
            subject: subject || 'Nowe zapytanie z formularza kontaktowego',
            html: `
                <h3>Nowe zapytanie z formularza kontaktowego</h3>
                <p><strong>Imię i nazwisko:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone || 'Brak'}</p>
                <p><strong>Temat:</strong> ${subject || 'Nie wybrano'}</p>
                <p><strong>Wiadomość:</strong><br>${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Wiadomość została wysłana pomyślnie!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Coś poszło nie tak. Spróbuj ponownie później.' });
    }
}
