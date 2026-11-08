'use server';

import { getDb } from '@/db';
import { product, user } from '@/db/schema';
import {
  sendApplicationResultEmail,
  type ApplicationType,
} from '@/lib/send-application-result';
import { adminActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateProductTemplateAdminSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  template: z.enum(['mksaas', 'mkdirs', 'pending', 'rejected', '']),
});

/**
 * Admin action to update product template field.
 * Empty string clears the template value.
 */
export const updateProductTemplateAdminAction = adminActionClient
  .inputSchema(updateProductTemplateAdminSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { productId, template } = parsedInput;
      const db = await getDb();

      // Verify product exists
      const existing = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.id, productId))
        .limit(1);

      if (existing.length === 0) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      // Update template (empty string -> null)
      await db
        .update(product)
        .set({
          template: template || null,
          updatedAt: new Date(),
        })
        .where(eq(product.id, productId));

      // Send notification email when template is set to approved or rejected
      const terminalTemplate = template === '' ? null : template;
      if (
        terminalTemplate === 'mksaas' ||
        terminalTemplate === 'mkdirs' ||
        terminalTemplate === 'rejected'
      ) {
        const author = await db
          .select({
            email: user.email,
            name: user.name,
            productName: product.name,
          })
          .from(product)
          .innerJoin(user, eq(product.userId, user.id))
          .where(eq(product.id, productId))
          .limit(1);
        if (author.length > 0 && author[0].email) {
          const applicationType: ApplicationType =
            terminalTemplate === 'mksaas'
              ? 'mksaas_showcase'
              : terminalTemplate === 'mkdirs'
                ? 'mkdirs_showcase'
                : 'showcase';
          await sendApplicationResultEmail({
            to: author[0].email,
            applicationType,
            result: terminalTemplate === 'rejected' ? 'rejected' : 'approved',
            productName: author[0].productName,
            authorName: author[0].name || 'there',
          });
        }
      }

      return {
        success: true,
        data: {
          id: productId,
          template: template || null,
        },
      };
    } catch (error) {
      console.error('Update product template admin error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update product template',
      };
    }
  });
