import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { db, id } from './instant-client';

const MILESTONES = [10, 25, 50, 75];

export function useMilestoneCelebration() {
  const celebratedMilestones = useRef<Set<string>>(new Set());
  const { user } = db.useAuth();

  // Query domains to check for milestone achievements
  const { data: domainsData } = db.useQuery({
    domains: {
      $: {
        where: {
          user_id: user?.id,
          deleted_at: { $isNull: true },
        },
      },
    },
  });

  // Query existing celebrated milestones
  const { data: milestonesData } = db.useQuery({
    milestones: {
      $: {
        where: {
          user_id: user?.id,
        },
      },
    },
  });

  useEffect(() => {
    // Initialize celebrated milestones from database
    if (milestonesData?.milestones) {
      const celebrated = new Set(
        milestonesData.milestones
          .filter((m: any) => m.celebrated)
          .map((m: any) => `${m.domain_id}-${m.dr_value}`)
      );
      celebratedMilestones.current = celebrated;
    }
  }, [milestonesData]);

  useEffect(() => {
    if (!domainsData?.domains || !user?.id) return;

    const domains = domainsData.domains;

    domains.forEach((domain: any) => {
      const currentDR = domain.current_da || 0;
      // Use normalized_url as unique identifier since domain.id might not be available in types yet
      const domainIdentifier = domain.normalized_url || domain.url;

      MILESTONES.forEach(milestone => {
        const milestoneKey = `${domainIdentifier}-${milestone}`;

        // Check if this milestone has been reached and not yet celebrated
        if (currentDR >= milestone && !celebratedMilestones.current.has(milestoneKey)) {
          // Mark as celebrated in our local state
          celebratedMilestones.current.add(milestoneKey);

          // Trigger confetti celebration
          triggerConfetti();

          // Record milestone in database
          db.transact([
            db.tx.milestones[id()].update({
              user_id: user.id,
              domain_id: domain.id,
              dr_value: milestone,
              celebrated: true,
              celebrated_at: Date.now(),
            })
          ]);

          // Show a toast notification
          console.log(`🎉 Milestone reached! Domain ${domain.url} reached DR ${milestone}!`);
        }
      });
    });
  }, [domainsData, user?.id]);

  return null;
}

function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      particleCount,
      startVelocity: randomInRange(50, 100),
      spread: randomInRange(50, 70),
      origin: {
        x: randomInRange(0.1, 0.3),
        y: Math.random() - 0.2,
      },
    });

    confetti({
      particleCount,
      startVelocity: randomInRange(50, 100),
      spread: randomInRange(50, 70),
      origin: {
        x: randomInRange(0.7, 0.9),
        y: Math.random() - 0.2,
      },
    });
  }, 250);
}