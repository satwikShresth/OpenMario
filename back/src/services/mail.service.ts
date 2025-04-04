import formData from 'form-data';
import Mailgun from 'mailgun.js';
import verify_email from '#email/verify_email.ts';

class EmailService {
   private senderEmail: string;
   private mgMail: any;

   constructor(key: string | null, senderEmail: string) {
      this.senderEmail = senderEmail;
      if (!key) {
         throw new Error(
            'EMAIL_API_KEY API key is required. Please set the EMAIL_API_KEY environment variable.',
         );
      }
      const mailgun = new Mailgun(formData);
      this.mgMail = mailgun.client({
         username: 'api',
         key,
      });
   }

   private createMagicLink(token: string): string {
      return `${Deno.env.get('APP_URL') || 'localhost'}/login/${token}`;
   }

   public async sendVerificationEmail(to: string, token: string) {
      console.log(to);
      return await this.mgMail.messages
         .create('verify.openmario.com', {
            to,
            from: this.senderEmail,
            subject: 'Verification Email for OpenMario Account Creation',
            html: verify_email(this.createMagicLink(token), 'OpenMario'),
         })
         .then((msg) => {
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
   Deno.env.get('EMAIL_API_KEY') || null,
   Deno.env.get('SENDER_EMAIL') || 'noreply@verify.openmario.com',
);

export default EmailService;
