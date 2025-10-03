"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

interface BadgeCustomizerProps {
  domain: string;
  drValue: number;
}

type BadgeStyle = "normal" | "small" | "tiny";
type BadgeColor = "white" | "light" | "dark";
type BadgeIcon = "circle" | "checkmark";
type BadgeShape = "rect" | "round";
type TextStyle = "regular" | "bold" | "italic" | "bold-italic";

export function BadgeCustomizer({ domain, drValue }: BadgeCustomizerProps) {
  const [style, setStyle] = useState<BadgeStyle>("normal");
  const [color, setColor] = useState<BadgeColor>("white");
  const [icon, setIcon] = useState<BadgeIcon>("circle");
  const [shape, setShape] = useState<BadgeShape>("round");
  const [text, setText] = useState("certified domain rating");
  const [textStyle, setTextStyle] = useState<TextStyle>("regular");
  const [copied, setCopied] = useState(false);

  const generateBadgeUrl = () => {
    const params = new URLSearchParams({
      domain,
      style,
      color,
      icon,
      shape,
      text,
      textStyle,
    });
    return `${window.location.origin}/api/badge?${params.toString()}`;
  };

  const generateEmbedCode = () => {
    const badgeUrl = generateBadgeUrl();
    const linkUrl = `${window.location.origin}/domain/${domain}`;
    return `<a href="${linkUrl}" target="_blank"><img src="${badgeUrl}" alt="${domain} Domain Rating ${drValue}" /></a>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const badgeUrl = generateBadgeUrl();

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="p-8 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 font-medium">Preview</p>
          <a href={`/domain/${domain}`} target="_blank" rel="noopener noreferrer">
            <img
              src={badgeUrl}
              alt={`${domain} Domain Rating ${drValue}`}
              className="max-w-full h-auto"
            />
          </a>
        </div>
      </Card>

      {/* Customization Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Style */}
        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as BadgeStyle)}>
            <SelectTrigger id="style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="tiny">Tiny</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Select value={color} onValueChange={(v) => setColor(v as BadgeColor)}>
            <SelectTrigger id="color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={(v) => setIcon(v as BadgeIcon)}>
            <SelectTrigger id="icon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="checkmark">Checkmark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shape */}
        <div className="space-y-2">
          <Label htmlFor="shape">Shape</Label>
          <Select value={shape} onValueChange={(v) => setShape(v as BadgeShape)}>
            <SelectTrigger id="shape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rect">Rectangle</SelectItem>
              <SelectItem value="round">Rounded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Style */}
        <div className="space-y-2">
          <Label htmlFor="textStyle">Text Style</Label>
          <Select
            value={textStyle}
            onValueChange={(v) => setTextStyle(v as TextStyle)}
          >
            <SelectTrigger id="textStyle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
              <SelectItem value="bold-italic">Bold Italic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Text */}
        <div className="space-y-2">
          <Label htmlFor="text">Custom Text</Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="certified domain rating"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div className="space-y-2">
        <Label htmlFor="embed">Embed Code</Label>
        <div className="flex gap-2">
          <Input
            id="embed"
            value={generateEmbedCode()}
            readOnly
            className="font-mono text-xs"
          />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Copy this code and paste it into your website HTML
        </p>
      </div>

      {/* Direct Link */}
      <div className="space-y-2">
        <Label htmlFor="directLink">Direct Badge URL</Label>
        <div className="flex gap-2">
          <Input
            id="directLink"
            value={badgeUrl}
            readOnly
            className="font-mono text-xs"
          />
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(badgeUrl);
                toast.success("Badge URL copied!");
              } catch {
                toast.error("Failed to copy");
              }
            }}
            variant="outline"
            size="icon"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
