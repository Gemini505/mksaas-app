'use server';

import { getDb } from '@/db';
import { product } from '@/db/schema';
import type { SessionUser } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import { sendMksaasShowcaseNotification } from '@/notification';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const submitMksaasShowcaseSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

/**
 * Submit product to MkSaaS showcase for admin review.
 * Sets template to 'pending' and sends Discord notification.
 * Allows re-submission if previously rejected.
 */
export const submitMksaasShowcaseAction = userActionClient
  .inputSchema(submitMksaasShowcaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const currentUser = (ctx as { user: SessionUser }).user;
      const userId = currentUser.id;
      const { productId } = parsedInput;
      const db = await getDb();

      // Verify product exists and belongs to current user
      const productRecord = await db
        .select({
          id: product.id,
          userId: product.userId,
          url: product.url,
          name: product.name,
          template: product.template,
        })
        .from(product)
        .where(and(eq(product.id, productId), eq(product.userId, userId)))
        .limit(1);

      if (productRecord.length === 0) {
        return {
          success: false,
          error: 'Product not found or you do not have permission',
        };
      }

      const productData = productRecord[0];

      // Check if already approved
      if (productData.template === 'mksaas') {
        return {
          success: false,
          error: 'This product is already marked as MkSaaS showcase',
        };
      }

      // Check if already pending
      if (productData.template === 'pending') {
        return {
          success: false,
          error: 'Your showcase application is already pending review',
        };
      }

      // Block if already associated with another showcase
      if (productData.template === 'mkdirs') {
        return {
          success: false,
          error: 'This product is already associated with another showcase',
        };
      }

      // Set template to pending
      await db
        .update(product)
        .set({
          template: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(product.id, productId));

      // Send Discord notification to admin
      await sendMksaasShowcaseNotification({
        productId,
        productName: productData.name,
        productUrl: productData.url,
        userName: currentUser.name || currentUser.email,
        userId: currentUser.id,
      });

      return {
        success: true,
        data: {
          id: productId,
          template: 'pending',
        },
      };
    } catch (error) {
      console.error('Submit MkSaaS showcase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit MkSaaS showcase application',
      };
    }
  });
