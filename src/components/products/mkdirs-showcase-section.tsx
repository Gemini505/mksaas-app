'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSubmitMkdirsShowcase } from '@/hooks/use-product';
import { cn } from '@/lib/utils';
import {
  BanIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  Loader2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MkdirsShowcaseSectionProps {
  productId: string;
  template: string | null;
  className?: string;
}

/**
 * Mkdirs Showcase section for product settings.
 *
 * Allows users to submit their product to the Mkdirs showcase.
 * Displays different states: not submitted, pending review, rejected, approved.
 */
export function MkdirsShowcaseSection({
  productId,
  template,
  className,
}: MkdirsShowcaseSectionProps) {
  const submitShowcase = useSubmitMkdirsShowcase();
  // Local state for optimistic UI update since product context is server-rendered
  const [localTemplate, setLocalTemplate] = useState(template);

  const isPending = localTemplate === 'pending';
  const isApproved = localTemplate === 'mkdirs';
  const isRejected = localTemplate === 'rejected';
  // Already associated with another showcase (MkSaaS)
  const isOtherShowcase = localTemplate === 'mksaas';

  const handleSubmit = async () => {
    try {
      await submitShowcase.mutateAsync({ productId });
      setLocalTemplate('pending');
      toast.success('Showcase application submitted successfully');
    } catch (error) {
      console.error('Submit Mkdirs showcase error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit showcase application';
      toast.error(errorMessage);
    }
  };

  // Determine footer hint text
  const footerText = isApproved
    ? 'Contact us if you need to update your showcase information'
    : isRejected
      ? 'Please update your product information and re-submit'
      : 'Only submit if your website is built with Mkdirs template';

  // Determine submit button label
  const submitLabel = isRejected ? 'Re-submit' : 'Submit';
  const canSubmit = !isApproved && !isPending && !isOtherShowcase;

  return (
    <Card className={cn('max-w-2xl overflow-hidden pt-6 pb-0', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Submit to Mkdirs Showcase
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isApproved ? (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircleIcon className="size-4" />
            <span>
              This product has been verified and listed in the{' '}
              <a
                href="https://mkdirs.com/showcase"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Mkdirs Showcase
              </a>
            </span>
          </div>
        ) : isPending ? (
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <CircleDashedIcon className="size-4" />
            <span>Your application is pending review by administrators</span>
          </div>
        ) : isRejected ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <BanIcon className="size-4 shrink-0 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Your showcase application was rejected
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Please update your product information (e.g. logo, OG image,
              description) and re-submit for review
            </p>
          </div>
        ) : isOtherShowcase ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleDashedIcon className="size-4" />
            <span>
              This product is already associated with another showcase
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            If your website is built with Mkdirs template, submit it for review
            to be featured in the{' '}
            <a
              href="https://mkdirs.com/showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Mkdirs Showcase
            </a>
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-6 px-6 py-4 flex justify-between items-center bg-muted rounded-none">
        <p className="text-sm text-muted-foreground">{footerText}</p>
        {canSubmit && (
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={submitShowcase.isPending}
            className="cursor-pointer"
          >
            {submitShowcase.isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
