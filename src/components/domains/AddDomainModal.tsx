"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/instant-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import posthog from 'posthog-js';

const domainSchema = z.object({
  url: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})$/,
      "Please enter a valid domain (e.g., example.com)"
    ),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface AddDomainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function normalizeDomain(url: string): string {
  // Remove protocol
  let domain = url.replace(/^(https?:\/\/)/, "");
  // Remove www
  domain = domain.replace(/^www\./, "");
  // Remove trailing slash and path
  domain = domain.split("/")[0];
  // Convert to lowercase
  return domain.toLowerCase();
}

export function AddDomainModal({ open, onOpenChange }: AddDomainModalProps) {
  const { user } = db.useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's current domains and user data
  const { data: domainsData } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
        },
      },
    },
  });

  const { data: userData } = db.useQuery({
    users: {
      $: {
        where: {
          auth_id: user?.id,
        },
      },
    },
  });

  // Filter out deleted domains
  const domains = (domainsData?.domains || []).filter(d => !d.deleted_at || d.deleted_at === 0);
  const currentUser = userData?.users?.[0];
  const domainsLimit = currentUser?.domains_limit || 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
  });

  const onSubmit = async (data: DomainFormData) => {
    if (!user) {
      toast.error("You must be logged in to add a domain");
      return;
    }

    // Check domain limit
    if (domains.length >= domainsLimit) {
      posthog.capture('domain_add_failed', {
        reason: 'domain_limit_reached',
        limit: domainsLimit,
        current_domains: domains.length
      });
      toast.error(
        `You've reached your limit of ${domainsLimit} domains. ${
          domainsLimit === 3 ? "Upgrade to paid plan to track up to 12 domains." : ""
        }`
      );
      return;
    }

    const normalizedUrl = normalizeDomain(data.url);

    // Check for duplicates
    const duplicate = domains.find((d) => d.normalized_url === normalizedUrl);
    if (duplicate) {
      posthog.capture('domain_add_failed', {
        reason: 'duplicate_domain',
        domain_url: normalizedUrl
      });
      toast.error("This domain is already being tracked");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to add domain and fetch DR
      const response = await fetch("/api/domains/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          url: data.url,
          normalizedUrl: normalizedUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        posthog.capture('domain_add_failed', {
          reason: 'api_error',
          domain_url: normalizedUrl,
          error_message: result.error || "Failed to add domain"
        });
        toast.error(result.error || "Failed to add domain");
        return;
      }

      posthog.capture('domain_added', {
        domain_url: normalizedUrl,
        domain_rating: result.domain.current_da
      });
      toast.success(
        `Domain added successfully! DR: ${result.domain.current_da}`
      );
      reset();
      onOpenChange(false);
    } catch (error) {
      posthog.capture('domain_add_failed', {
        reason: 'client_error',
        domain_url: normalizedUrl
      });
      console.error("Error adding domain:", error);
      toast.error("Failed to add domain. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Enter the domain you want to track. We'll check its Domain Rating immediately and start monitoring it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Domain URL</Label>
            <Input
              id="url"
              placeholder="example.com or https://example.com"
              {...register("url")}
              disabled={isSubmitting}
            />
            {errors.url && (
              <p className="text-sm text-red-600">{errors.url.message}</p>
            )}
            <p className="text-xs text-gray-500">
              You're using {domains.length} of {domainsLimit} domains
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Domain
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
