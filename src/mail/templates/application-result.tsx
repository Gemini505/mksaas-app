import {
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

/** Admin review notification: directory list, MkSaaS Showcase, or Mkdirs Showcase */
export type ApplicationType =
  | 'directory' // apply to join backlink/directory list
  | 'mksaas_showcase'
  | 'mkdirs_showcase'
  | 'showcase'; // rejected showcase when we cannot tell which one

export interface ApplicationResultEmailProps {
  applicationType: ApplicationType;
  result: 'approved' | 'rejected';
  productName: string;
  authorName: string;
  rejectedReason?: string | null;
}

export const applicationTypeLabel: Record<ApplicationType, string> = {
  directory: 'Backlink List',
  mksaas_showcase: 'MkSaaS Showcase',
  mkdirs_showcase: 'Mkdirs Showcase',
  showcase: 'Showcase Application',
};

export default function ApplicationResultEmail({
  applicationType,
  result,
  productName,
  authorName,
  rejectedReason,
}: ApplicationResultEmailProps) {
  const typeLabel = applicationTypeLabel[applicationType];
  const isApproved = result === 'approved';

  return (
    <Html lang="en">
      <Head />
      <Tailwind>
        <Section className="bg-gray-50 p-4">
          <Container className="rounded-lg bg-white p-6 text-gray-900">
            <Text className="text-lg font-medium">Hi {authorName},</Text>
            {isApproved ? (
              <>
                <Text>
                  Your application for &quot;{productName}&quot; to the{' '}
                  <strong>{typeLabel}</strong> has been approved.
                </Text>
                <Text>
                  Your product is now listed. Thank you for being part of our
                  community.
                </Text>
              </>
            ) : (
              <>
                <Text>
                  We have reviewed your application for &quot;{productName}
                  &quot; to the <strong>{typeLabel}</strong> and regret to
                  inform you that it was not approved at this time.
                </Text>
                {rejectedReason ? (
                  <Text className="rounded bg-gray-100 p-3 text-sm">
                    <strong>Reason:</strong> {rejectedReason}
                  </Text>
                ) : (
                  <Text>
                    You may reapply after making improvements or contact us for
                    more details.
                  </Text>
                )}
              </>
            )}
            <Hr className="my-6" />
            <Text className="text-sm text-gray-500">
              This is an automated message. Please do not reply directly to this
              email.
            </Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  );
}
