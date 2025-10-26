"use client";

import { useState } from "react";
import { db } from "@/lib/instant-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface GoalSettingProps {
  domainId: string;
  domainUrl: string;
  currentDR: number;
}

export function GoalSetting({ domainId, domainUrl, currentDR }: GoalSettingProps) {
  const { user } = db.useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [targetDR, setTargetDR] = useState("");
  const [deadline, setDeadline] = useState("");

  // Query existing goals for this domain
  const { data: goalsData, isLoading } = db.useQuery({
    user_goals: {
      $: {
        where: {
          user_id: user?.id,
          domain_id: domainId,
          status: "active",
        },
      },
    },
  });

  const activeGoal = goalsData?.user_goals?.[0];

  const handleSetGoal = async () => {
    const target = parseInt(targetDR);
    if (!target || target <= currentDR) {
      toast.error("Target DR must be higher than current DR");
      return;
    }

    if (target > 100) {
      toast.error("DR target cannot exceed 100");
      return;
    }

    try {
      const deadlineTimestamp = deadline ? new Date(deadline).getTime() : undefined;

      await db.transact([
        db.tx.user_goals[crypto.randomUUID()].update({
          user_id: user?.id,
          domain_id: domainId,
          target_dr: target,
          current_dr: currentDR,
          deadline: deadlineTimestamp,
          created_at: Date.now(),
          status: "active",
        }),
      ]);

      setTargetDR("");
      setDeadline("");
      toast.success(`Goal set: Reach DR ${target}!`);
    } catch (error) {
      console.error("Error setting goal:", error);
      toast.error("Failed to set goal");
    }
  };

  const handleUpdateProgress = async () => {
    if (!activeGoal) return;

    try {
      await db.transact([
        db.tx.user_goals[activeGoal.id].update({
          current_dr: currentDR,
        }),
      ]);
      toast.success("Progress updated!");
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleCompleteGoal = async () => {
    if (!activeGoal) return;

    try {
      await db.transact([
        db.tx.user_goals[activeGoal.id].update({
          status: "completed",
          completed_at: Date.now(),
        }),
      ]);
      toast.success("🎉 Goal completed! Congratulations!");
    } catch (error) {
      console.error("Error completing goal:", error);
      toast.error("Failed to complete goal");
    }
  };

  const calculateProgress = () => {
    if (!activeGoal) return 0;
    const progress = ((currentDR - activeGoal.current_dr) / (activeGoal.target_dr - activeGoal.current_dr)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateETA = () => {
    if (!activeGoal || !activeGoal.deadline) return null;

    const now = Date.now();
    const timeLeft = activeGoal.deadline - now;

    if (timeLeft <= 0) return "Overdue";

    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    return `${daysLeft} days left`;
  };

  const progress = calculateProgress();
  const eta = calculateETA();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          Goals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Goal Setting</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set and track DR improvement goals for {domainUrl}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current DR Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Current DR: {currentDR}</p>
          </div>

          {activeGoal ? (
            /* Active Goal Display */
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900">Active Goal</h4>
                  <span className="text-sm text-green-700">Target: DR {activeGoal.target_dr}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-green-700">
                    {currentDR} / {activeGoal.target_dr} DR points
                  </p>
                </div>

                {eta && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-700">
                    <Calendar className="h-4 w-4" />
                    {eta}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateProgress} variant="outline" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
                {currentDR >= activeGoal.target_dr && (
                  <Button onClick={handleCompleteGoal} className="flex-1">
                    Complete Goal
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Set New Goal Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-dr">Target DR</Label>
                <Input
                  id="target-dr"
                  type="number"
                  placeholder="e.g., 50"
                  value={targetDR}
                  onChange={(e) => setTargetDR(e.target.value)}
                  min={currentDR + 1}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>

              <Button onClick={handleSetGoal} disabled={!targetDR} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </div>
          )}

          {!activeGoal && (
            <div className="text-center py-4 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active goals</p>
              <p className="text-xs">Set your first DR improvement goal!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}