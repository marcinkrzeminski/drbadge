'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { toast } from 'sonner';
import { Bell, Mail, AlertTriangle, Trophy, Calendar, Clock } from 'lucide-react';

interface NotificationSettingsProps {
  domainId: string;
  domainUrl: string;
  isPaidUser: boolean;
}

export function NotificationSettings({ domainId, domainUrl, isPaidUser }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current preferences via API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(`/api/notifications/preferences?domainId=${domainId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const prefs = await response.json();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [domainId]);

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainId,
          preferences: {
            instant_alerts: preferences.instant_alerts,
            daily_batch: preferences.daily_batch,
            weekly_recaps: preferences.weekly_recaps,
            milestone_celebrations: preferences.milestone_celebrations,
            inactivity_warnings: preferences.inactivity_warnings,
            da_threshold: preferences.da_threshold,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, value: boolean | number) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Failed to load settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure email notifications for {domainUrl}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instant Alerts - Paid users only */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Label htmlFor="instant-alerts" className="text-sm font-medium">
                Instant DR Change Alerts
              </Label>
              {!isPaidUser && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Paid only
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Get immediate email notifications when DR changes
            </p>
          </div>
          <input
            type="checkbox"
            id="instant-alerts"
            checked={preferences.instant_alerts}
            onChange={(e) => updatePreference('instant_alerts', e.target.checked)}
            disabled={!isPaidUser}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Daily Batch Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <Label htmlFor="daily-batch" className="text-sm font-medium">
                Daily Summary Emails
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Receive daily batch notifications of DR changes
            </p>
          </div>
          <input
            type="checkbox"
            id="daily-batch"
            checked={preferences.daily_batch}
            onChange={(e) => updatePreference('daily_batch', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Weekly Recap Emails */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <Label htmlFor="weekly-recaps" className="text-sm font-medium">
                Weekly Recap Emails
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Get weekly summary emails every Monday
            </p>
          </div>
          <input
            type="checkbox"
            id="weekly-recaps"
            checked={preferences.weekly_recaps}
            onChange={(e) => updatePreference('weekly_recaps', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Milestone Celebrations */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <Label htmlFor="milestone-celebrations" className="text-sm font-medium">
                Milestone Celebrations
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Celebrate when you reach DR milestones
            </p>
          </div>
          <input
            type="checkbox"
            id="milestone-celebrations"
            checked={preferences.milestone_celebrations}
            onChange={(e) => updatePreference('milestone_celebrations', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Inactivity Warnings */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <Label htmlFor="inactivity-warnings" className="text-sm font-medium">
                Inactivity Warnings
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Get reminded when you haven't checked your rankings
            </p>
          </div>
          <input
            type="checkbox"
            id="inactivity-warnings"
            checked={preferences.inactivity_warnings}
            onChange={(e) => updatePreference('inactivity_warnings', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* DA Threshold */}
        <div className="space-y-2">
          <Label htmlFor="da-threshold" className="text-sm font-medium">
            DR Change Threshold
          </Label>
          <Select
            value={preferences.da_threshold.toString()}
            onValueChange={(value) => updatePreference('da_threshold', parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select threshold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Any change (≥1)</SelectItem>
              <SelectItem value="2">≥2 points</SelectItem>
              <SelectItem value="5">≥5 points</SelectItem>
              <SelectItem value="10">≥10 points</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only send alerts for DR changes of this magnitude or greater
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}