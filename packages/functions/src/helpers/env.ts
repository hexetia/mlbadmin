// @TODO documentar isso no README.md, que todas essas variáveis são necessárias se quiser q o app funcione

export const APP_ADMIN_EMAILS: string[] = process.env.APP_ADMIN_EMAILS.split(',');
export const APP_MAIL_SOURCE = process.env.APP_MAIL_SOURCE as string;

export const AWS_SES_ACCESS_KEY = process.env.AWS_SES_ACCESS_KEY as string;
export const AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY as string;
