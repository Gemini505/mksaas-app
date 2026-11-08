import { websiteConfig } from '@/config/website';
import { getBaseUrl, getExternalUrl } from '@/lib/urls';
import type {
  NotificationProvider,
  SendCreditDistributionNotificationParams,
  SendDirectoryApplicationNotificationParams,
  SendDrChangeMessageParams,
  SendPaymentNotificationParams,
  SendProductDealNotificationParams,
  SendShowcaseNotificationParams,
} from '../types';
import { defaultMessages } from '@/i18n/messages';

async function sendMessage(
  webhookUrl: string,
  body: Record<string, unknown>
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error('Failed to send Discord message:', response);
  }
}

export class DiscordProvider implements NotificationProvider {
  private webhookUrl: string;
  private botName: string;
  private avatarUrl?: string;

  constructor() {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) throw new Error('DISCORD_WEBHOOK_URL is required.');
    this.webhookUrl = webhookUrl;
    this.botName = defaultMessages.Metadata.name ?? 'Bot';
    const logoPath = websiteConfig.metadata?.images?.logoLight;
    this.avatarUrl = logoPath ? `${getBaseUrl()}${logoPath}` : undefined;
  }

  getProviderName(): string {
    return 'discord';
  }

  async sendPaymentNotification(
    params: SendPaymentNotificationParams
  ): Promise<void> {
    const { sessionId, customerId, userName, amount } = params;
    try {
      const body: Record<string, unknown> = {
        username: this.botName,
        embeds: [
          {
            title: '🎉 New Purchase',
            color: 0x4caf50,
            fields: [
              { name: 'Username', value: userName, inline: true },
              { name: 'Amount', value: `$${amount.toFixed(2)}`, inline: true },
              {
                name: 'Customer ID',
                value: `\`${customerId}\``,
                inline: false,
              },
              { name: 'Session ID', value: `\`${sessionId}\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      if (this.avatarUrl) body.avatar_url = this.avatarUrl;
      await sendMessage(this.webhookUrl, body);
      console.log(
        `Successfully sent Discord notification for user ${userName}`
      );
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  async sendCreditDistributionNotification(
    params: SendCreditDistributionNotificationParams
  ): Promise<void> {
    const { usersCount, processedCount, errorCount } = params;
    try {
      const body: Record<string, unknown> = {
        username: this.botName,
        embeds: [
          {
            title: '🎉 Credit Distribution',
            color: 0x4caf50,
            fields: [
              { name: 'Users', value: usersCount.toString(), inline: true },
              {
                name: 'Processed',
                value: processedCount.toString(),
                inline: true,
              },
              { name: 'Errors', value: errorCount.toString(), inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      if (this.avatarUrl) body.avatar_url = this.avatarUrl;
      await sendMessage(this.webhookUrl, body);
      console.log(
        'Successfully sent Discord notification for credit distribution'
      );
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  /**
   * Send a message to Discord when a user applies to convert product to directory
   */
  async sendDirectoryApplicationNotification({
    directoryId,
    productName,
    productUrl,
    userName,
    userId,
  }: SendDirectoryApplicationNotificationParams): Promise<void> {
    try {
      const message = {
        username: `${defaultMessages.Metadata.name} Bot`,
        avatar_url: `${getBaseUrl()}${websiteConfig.metadata?.images?.logoLight}`,
        embeds: [
          {
            title: '📋 New Directory Application',
            color: 0xffa500,
            fields: [
              { name: 'Product Name', value: productName, inline: true },
              {
                name: 'Product URL',
                value: getExternalUrl(productUrl),
                inline: false,
              },
              { name: 'Applicant', value: userName, inline: false },
              {
                name: 'Directory ID',
                value: `\`${directoryId}\``,
                inline: false,
              },
              { name: 'User ID', value: `\`${userId}\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await sendMessage(this.webhookUrl, message);
      console.log(
        `<< Successfully sent Discord notification for directory application ${directoryId}`
      );
    } catch (error) {
      console.error('<< Failed to send Discord notification:', error);
    }
  }

  /**
   * Send a message to Discord when a user submits product for Mkdirs showcase
   */
  async sendMkdirsShowcaseNotification({
    productId,
    productName,
    productUrl,
    userName,
    userId,
  }: SendShowcaseNotificationParams): Promise<void> {
    try {
      const message = {
        username: `${defaultMessages.Metadata.name} Bot`,
        avatar_url: `${getBaseUrl()}${websiteConfig.metadata?.images?.logoLight}`,
        embeds: [
          {
            title: '📂 New Mkdirs Showcase Application',
            color: 0x10b981,
            fields: [
              { name: 'Product Name', value: productName, inline: true },
              {
                name: 'Product URL',
                value: getExternalUrl(productUrl),
                inline: false,
              },
              { name: 'Applicant', value: userName, inline: false },
              { name: 'Product ID', value: `\`${productId}\``, inline: false },
              { name: 'User ID', value: `\`${userId}\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await sendMessage(this.webhookUrl, message);
      console.log(
        `<< Successfully sent Discord notification for Mkdirs showcase ${productId}`
      );
    } catch (error) {
      console.error('<< Failed to send Discord notification:', error);
    }
  }

  /**
   * Send a message to Discord when a user submits product for MkSaaS showcase
   */
  async sendMksaasShowcaseNotification({
    productId,
    productName,
    productUrl,
    userName,
    userId,
  }: SendShowcaseNotificationParams): Promise<void> {
    try {
      const message = {
        username: `${defaultMessages.Metadata.name} Bot`,
        avatar_url: `${getBaseUrl()}${websiteConfig.metadata?.images?.logoLight}`,
        embeds: [
          {
            title: '🚀 New MkSaaS Showcase Application',
            color: 0x6366f1,
            fields: [
              { name: 'Product Name', value: productName, inline: true },
              {
                name: 'Product URL',
                value: getExternalUrl(productUrl),
                inline: false,
              },
              { name: 'Applicant', value: userName, inline: false },
              { name: 'Product ID', value: `\`${productId}\``, inline: false },
              { name: 'User ID', value: `\`${userId}\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await sendMessage(this.webhookUrl, message);
      console.log(
        `<< Successfully sent Discord notification for MkSaaS showcase ${productId}`
      );
    } catch (error) {
      console.error('<< Failed to send Discord notification:', error);
    }
  }

  /**
   * Send a message to Discord when a user creates a new product deal
   */
  async sendProductDealNotification({
    productName,
    productUrl,
    dealEventName,
    price,
    userName,
    userId,
  }: SendProductDealNotificationParams): Promise<void> {
    try {
      const message = {
        username: `${defaultMessages.Metadata.name} Bot`,
        avatar_url: `${getBaseUrl()}${websiteConfig.metadata?.images?.logoLight}`,
        embeds: [
          {
            title: '🎁 New Product Deal',
            color: 0x00bcd4,
            fields: [
              { name: 'Product Name', value: productName, inline: false },
              { name: 'Deal Event', value: dealEventName, inline: false },
              {
                name: 'Price',
                value: `$${(price / 100).toFixed(2)}`,
                inline: false,
              },
              {
                name: 'Product URL',
                value: getExternalUrl(productUrl),
                inline: false,
              },
              { name: 'Creator', value: userName, inline: false },
              { name: 'User ID', value: `\`${userId}\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await sendMessage(this.webhookUrl, message);
      console.log(
        `<< Successfully sent Discord notification for product deal ${productName}`
      );
    } catch (error) {
      console.error('<< Failed to send Discord notification:', error);
    }
  }

  /**
   * Send a message to Discord when DR change emails are sent (admin notification).
   */
  async sendDrChangeMessage(params: SendDrChangeMessageParams): Promise<void> {
    if (params.changes.length === 0) return;
    try {
      const domainsText = params.changes
        .map((c) => `${c.domainUrl} (${c.oldDr ?? '-'} → ${c.newDr ?? '-'})`)
        .join('\n');
      const message = {
        username: `${defaultMessages.Metadata.name} Bot`,
        avatar_url: `${getBaseUrl()}${websiteConfig.metadata?.images?.logoLight}`,
        embeds: [
          {
            title: '📊 DR Change Notification',
            color: 0x9c27b0,
            fields: [
              { name: 'User', value: params.userName, inline: false },
              {
                name: 'Domains changed',
                value: domainsText,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await sendMessage(this.webhookUrl, message);
    } catch (error) {
      console.error('<< Failed to send Discord DR change notification:', error);
    }
  }
}
