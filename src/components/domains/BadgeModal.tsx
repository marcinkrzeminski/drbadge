"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCustomizer } from "@/components/badge/BadgeCustomizer";
import { ExternalLink } from "lucide-react";

interface BadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  drValue: number;
}

export function BadgeModal({
  open,
  onOpenChange,
  domain,
  drValue,
}: BadgeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Get Badge for {domain}
            <a
              href={`/domain/${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </DialogTitle>
          <DialogDescription>
            Customize and embed your domain rating badge on your website
          </DialogDescription>
        </DialogHeader>

        <BadgeCustomizer domain={domain} drValue={drValue} />
      </DialogContent>
    </Dialog>
  );
}
