import type { NotificationConfig } from '@/types';

/** Supported notification provider names */
export type NotificationProviderName = NonNullable<
  NotificationConfig['provider']
>;

/** Params for sending a payment notification */
export interface SendPaymentNotificationParams {
  sessionId: string;
  customerId: string;
  userName: string;
  amount: number;
}

/** Params for sending a credit distribution notification */
export interface SendCreditDistributionNotificationParams {
  usersCount: number;
  processedCount: number;
  errorCount: number;
}

/** Params for directory application notification */
export interface SendDirectoryApplicationNotificationParams {
  directoryId: string;
  productName: string;
  productUrl: string;
  userName: string;
  userId: string;
}

/** Params for Mkdirs/MkSaaS showcase notification */
export interface SendShowcaseNotificationParams {
  productId: string;
  productName: string;
  productUrl: string;
  userName: string;
  userId: string;
}

/** Params for product deal notification */
export interface SendProductDealNotificationParams {
  productName: string;
  productUrl: string;
  dealEventName: string;
  price: number;
  userName: string;
  userId: string;
}

/** Single DR change entry for sendDrChangeMessage */
export interface DrChangeEntry {
  domainUrl: string;
  oldDr: number | null;
  newDr: number | null;
}

/** Params for DR change notification */
export interface SendDrChangeMessageParams {
  userName: string;
  changes: DrChangeEntry[];
}

/**
 * Notification provider interface
 */
export interface NotificationProvider {
  /**
   * Get the notification provider name
   */
  getProviderName(): string;

  /**
   * Send a payment notification
   */
  sendPaymentNotification(params: SendPaymentNotificationParams): Promise<void>;

  /**
   * Send a credit distribution notification
   */
  sendCreditDistributionNotification(
    params: SendCreditDistributionNotificationParams
  ): Promise<void>;

  /**
   * Send directory application notification (product to directory)
   */
  sendDirectoryApplicationNotification(
    params: SendDirectoryApplicationNotificationParams
  ): Promise<void>;

  /**
   * Send Mkdirs showcase application notification
   */
  sendMkdirsShowcaseNotification(
    params: SendShowcaseNotificationParams
  ): Promise<void>;

  /**
   * Send MkSaaS showcase application notification
   */
  sendMksaasShowcaseNotification(
    params: SendShowcaseNotificationParams
  ): Promise<void>;

  /**
   * Send product deal creation notification
   */
  sendProductDealNotification(
    params: SendProductDealNotificationParams
  ): Promise<void>;

  /**
   * Send DR change notification (admin)
   */
  sendDrChangeMessage(params: SendDrChangeMessageParams): Promise<void>;
}
