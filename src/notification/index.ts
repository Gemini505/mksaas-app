import { websiteConfig } from '@/config/website';
import { DiscordProvider } from './provider/discord';
import { FeishuProvider } from './provider/feishu';
import type {
  NotificationProvider,
  NotificationProviderName,
  SendCreditDistributionNotificationParams,
  SendDirectoryApplicationNotificationParams,
  SendDrChangeMessageParams,
  SendPaymentNotificationParams,
  SendProductDealNotificationParams,
  SendShowcaseNotificationParams,
} from './types';

type ProviderFactory = () => NotificationProvider;

const providerRegistry: Partial<
  Record<NotificationProviderName, ProviderFactory>
> = {
  discord: () => new DiscordProvider(),
  feishu: () => new FeishuProvider(),
};

let notificationProvider: NotificationProvider | null = null;

function createProvider(): NotificationProvider {
  const name = websiteConfig.notification?.provider;
  if (!name)
    throw new Error('notification.provider is required in websiteConfig.');
  const factory = providerRegistry[name];
  if (!factory) {
    throw new Error(`Unsupported notification provider: ${name}.`);
  }
  return factory();
}

export function getNotificationProvider(): NotificationProvider {
  if (!notificationProvider) notificationProvider = createProvider();
  return notificationProvider;
}

export async function sendPaymentNotification(
  params: SendPaymentNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendPaymentNotification(params);
}

export async function sendCreditDistributionNotification(
  params: SendCreditDistributionNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendCreditDistributionNotification(params);
}

export async function sendDirectoryApplicationNotification(
  params: SendDirectoryApplicationNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendDirectoryApplicationNotification(params);
}

export async function sendMkdirsShowcaseNotification(
  params: SendShowcaseNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendMkdirsShowcaseNotification(params);
}

export async function sendMksaasShowcaseNotification(
  params: SendShowcaseNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendMksaasShowcaseNotification(params);
}

export async function sendProductDealNotification(
  params: SendProductDealNotificationParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendProductDealNotification(params);
}

export async function sendDrChangeMessage(
  params: SendDrChangeMessageParams
): Promise<void> {
  if (!websiteConfig.notification?.enable) return;
  const provider = getNotificationProvider();
  await provider.sendDrChangeMessage(params);
}
