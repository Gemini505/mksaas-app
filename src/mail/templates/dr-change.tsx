import React from 'react';
import { defaultMessages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import EmailButton from '@/mail/components/email-button';
import EmailLayout from '@/mail/components/email-layout';
import type { BaseEmailProps } from '@/mail/types';
import { Text } from '@react-email/components';
import { createTranslator } from 'use-intl/core';

export interface DrChangeItem {
  domainUrl: string;
  oldDr: number | null;
  newDr: number | null;
}

export interface DrChangeEmailProps extends BaseEmailProps {
  userName: string;
  changes: DrChangeItem[];
  productsUrl?: string;
}

export default function DrChangeEmail({
  userName,
  changes,
  productsUrl,
  locale,
  messages,
}: DrChangeEmailProps) {
  const t = createTranslator({
    locale,
    messages,
    namespace: 'Mail.drChange',
  });

  return (
    <EmailLayout locale={locale} messages={messages}>
      <Text>{t('title', { name: userName || 'there' })}</Text>
      <Text>{t('body')}</Text>
      {changes.map((item, index) => {
        const oldDrStr = item.oldDr !== null ? String(item.oldDr) : 'N/A';
        const newDrStr = item.newDr !== null ? String(item.newDr) : 'N/A';
        return (
          <React.Fragment key={index}>
            <Text>
              <strong>{t('domain')}</strong> {item.domainUrl}
            </Text>
            <Text>
              <strong>{t('drChange')}</strong> {oldDrStr} → {newDrStr}
            </Text>
          </React.Fragment>
        );
      })}
      <Text>{t('footer')}</Text>
      {productsUrl ? (
        <EmailButton href={productsUrl}>{t('viewProducts')}</EmailButton>
      ) : null}
    </EmailLayout>
  );
}

DrChangeEmail.PreviewProps = {
  locale: routing.defaultLocale,
  messages: defaultMessages,
  userName: 'User',
  changes: [
    { domainUrl: 'example.com', oldDr: 5, newDr: 6 },
    { domainUrl: 'another.com', oldDr: 10, newDr: 12 },
  ],
  productsUrl: 'https://mkdollar.com/products',
};
