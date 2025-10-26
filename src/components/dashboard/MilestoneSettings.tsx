"use client";

import { useState } from "react";
import { db } from "@/lib/instant-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MilestoneSettingsProps {
  domainId: string;
  domainUrl: string;
  currentDR: number;
}

export function MilestoneSettings({ domainId, domainUrl, currentDR }: MilestoneSettingsProps) {
  const { user } = db.useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  // Query existing milestones for this domain
  const { data: milestonesData, isLoading } = db.useQuery({
    milestones: {
      $: {
        where: {
          user_id: user?.id,
          domain_id: domainId,
        },
      },
    },
  });

  const milestones = milestonesData?.milestones || [];

  const handleAddMilestone = async () => {
    const targetDR = parseInt(newMilestone);
    if (!targetDR || targetDR <= 0 || targetDR <= currentDR) {
      toast.error("Please enter a valid DR target higher than current DR");
      return;
    }

    if (targetDR > 100) {
      toast.error("DR target cannot exceed 100");
      return;
    }

    try {
      await db.transact([
        db.tx.milestones[crypto.randomUUID()].update({
          user_id: user?.id,
          domain_id: domainId,
          dr_value: targetDR,
          celebrated: false,
        }),
      ]);

      setNewMilestone("");
      toast.success(`Milestone set for DR ${targetDR}!`);
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast.error("Failed to add milestone");
    }
  };

  const handleRemoveMilestone = async (milestone: any) => {
    // TODO: Implement milestone removal once schema types are updated
    toast.info("Milestone removal will be available after schema update");
  };

  const activeMilestones = milestones.filter((m: any) => !m.celebrated);
  const achievedMilestones = milestones.filter((m: any) => m.celebrated);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          Milestones
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Milestone Settings</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set custom DR targets for {domainUrl}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current DR Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Current DR: {currentDR}</p>
          </div>

          {/* Add New Milestone */}
          <div className="space-y-2">
            <Label htmlFor="new-milestone">Add New Milestone</Label>
            <div className="flex gap-2">
              <Input
                id="new-milestone"
                type="number"
                placeholder="Target DR (e.g., 30)"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                min={currentDR + 1}
                max={100}
              />
              <Button onClick={handleAddMilestone} disabled={!newMilestone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Milestones */}
          {activeMilestones.length > 0 && (
            <div className="space-y-2">
              <Label>Active Milestones</Label>
              <div className="space-y-2">
                {activeMilestones.map((milestone: any, index: number) => (
                  <div key={`active-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Reach DR {milestone.dr_value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMilestone(milestone)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achieved Milestones */}
          {achievedMilestones.length > 0 && (
            <div className="space-y-2">
              <Label>Achieved Milestones</Label>
              <div className="space-y-2">
                {achievedMilestones.map((milestone: any) => (
                  <div key={milestone.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-800">✓ DR {milestone.dr_value} achieved</span>
                    <span className="text-xs text-green-600">
                      {new Date(milestone.celebrated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMilestones.length === 0 && achievedMilestones.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No milestones set yet</p>
              <p className="text-xs">Add your first DR target above!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}