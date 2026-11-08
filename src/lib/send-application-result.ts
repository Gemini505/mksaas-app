import { renderEmailHtml, sendEmail, toPlainText } from '@/mail';
import ApplicationResultEmail from '@/mail/templates/application-result';

/** Admin review notification: directory list, MkSaaS Showcase, or Mkdirs Showcase */
export type ApplicationType =
  | 'directory' // apply to join backlink/directory list
  | 'mksaas_showcase'
  | 'mkdirs_showcase'
  | 'showcase'; // rejected showcase when we cannot tell which one

export interface SendApplicationResultParams {
  to: string;
  applicationType: ApplicationType;
  result: 'approved' | 'rejected';
  productName: string;
  authorName: string;
  rejectedReason?: string | null;
}

const applicationTypeLabel: Record<ApplicationType, string> = {
  directory: 'Backlink List',
  mksaas_showcase: 'MkSaaS Showcase',
  mkdirs_showcase: 'Mkdirs Showcase',
  showcase: 'Showcase Application',
};

function getSubject(
  applicationType: ApplicationType,
  result: 'approved' | 'rejected'
): string {
  const label = applicationTypeLabel[applicationType];
  return result === 'approved'
    ? `Application approved: ${label}`
    : `Application update: ${label}`;
}

/**
 * Send application result notification email to product author.
 */
export async function sendApplicationResultEmail(
  params: SendApplicationResultParams
): Promise<boolean> {
  const {
    to,
    applicationType,
    result,
    productName,
    authorName,
    rejectedReason,
  } = params;

  const subject = getSubject(applicationType, result);
  const html = await renderEmailHtml(
    ApplicationResultEmail({
      applicationType,
      result,
      productName,
      authorName,
      rejectedReason,
    })
  );
  const text = toPlainText(html);

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
