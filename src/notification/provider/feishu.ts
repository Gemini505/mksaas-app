import type {
  NotificationProvider,
  SendCreditDistributionNotificationParams,
  SendDirectoryApplicationNotificationParams,
  SendDrChangeMessageParams,
  SendPaymentNotificationParams,
  SendProductDealNotificationParams,
  SendShowcaseNotificationParams,
} from '../types';

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
    console.error('Failed to send Feishu message:', response);
  }
}

export class FeishuProvider implements NotificationProvider {
  private webhookUrl: string;

  constructor() {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (!webhookUrl) throw new Error('FEISHU_WEBHOOK_URL is required.');
    this.webhookUrl = webhookUrl;
  }

  getProviderName(): string {
    return 'feishu';
  }

  async sendPaymentNotification(
    params: SendPaymentNotificationParams
  ): Promise<void> {
    const { sessionId, customerId, userName, amount } = params;
    try {
      await sendMessage(this.webhookUrl, {
        msg_type: 'text',
        content: {
          text: `🎉 New Purchase\nUsername: ${userName}\nAmount: $${amount.toFixed(2)}\nCustomer ID: ${customerId}\nSession ID: ${sessionId}`,
        },
      });
      console.log(`Successfully sent Feishu notification for user ${userName}`);
    } catch (error) {
      console.error('Failed to send Feishu notification:', error);
    }
  }

  async sendCreditDistributionNotification(
    params: SendCreditDistributionNotificationParams
  ): Promise<void> {
    const { usersCount, processedCount, errorCount } = params;
    try {
      await sendMessage(this.webhookUrl, {
        msg_type: 'text',
        content: {
          text: `🎉 Credit Distribution\nUsers: ${usersCount}\nProcessed: ${processedCount}\nErrors: ${errorCount}`,
        },
      });
      console.log(
        'Successfully sent Feishu notification for credit distribution'
      );
    } catch (error) {
      console.error('Failed to send Feishu notification:', error);
    }
  }

  async sendDirectoryApplicationNotification(
    _params: SendDirectoryApplicationNotificationParams
  ): Promise<void> {
    // No-op for Feishu
  }

  async sendMkdirsShowcaseNotification(
    _params: SendShowcaseNotificationParams
  ): Promise<void> {
    // No-op for Feishu
  }

  async sendMksaasShowcaseNotification(
    _params: SendShowcaseNotificationParams
  ): Promise<void> {
    // No-op for Feishu
  }

  async sendProductDealNotification(
    _params: SendProductDealNotificationParams
  ): Promise<void> {
    // No-op for Feishu
  }

  async sendDrChangeMessage(_params: SendDrChangeMessageParams): Promise<void> {
    // No-op for Feishu
  }
}
