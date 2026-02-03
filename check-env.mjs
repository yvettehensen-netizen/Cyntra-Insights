import 'dotenv/config';
console.log({
  OPENAI: !!process.env.OPENAI_API_KEY,
  RESEND: !!process.env.RESEND_API_KEY
});
