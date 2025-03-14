import sgMail from "@sendgrid/mail";
import verify_email from "#email/verify_email.ts";

class EmailService {
  private apiKey: string;
  private senderEmail: string;

  constructor(apiKey: string | null, senderEmail: string) {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;

    if (!this.apiKey) {
      throw new Error(
        "SendGrid API key is required. Please set the SENDGRID_API_KEY environment variable.",
      );
    }

    sgMail.setApiKey(this.apiKey);
  }

  public async sendVerificationEmail(to: string, magic_link: string) {
    return await sgMail
      .send({
        to,
        from: this.senderEmail,
        subject: "Verification Email for OpenMario Account Creation",
        html: verify_email(magic_link, "OpenMario"),
      })
      .then(() => {
        console.log(`Email sent to ${to}`);
        return true;
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
        return false;
      });
  }
}

export const emailService = new EmailService(
  Deno.env.get("SENDGRID_API_KEY") || null,
  Deno.env.get("SENDER_EMAIL") || "noreply@openmario.satwik.dev",
);

export default EmailService;
