"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiDelete, apiPost } from "@/lib/api";
import Button from "@/components/ui/button";

interface ProgressButtonProps {
  slug: string;
  initialLearned: boolean;
  onToggle?: (learned: boolean) => void;
}

export default function ProgressButton({
  slug,
  initialLearned,
  onToggle,
}: ProgressButtonProps) {
  const { user } = useAuth();
  const [learned, setLearned] = useState(initialLearned);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLearned(initialLearned);
  }, [initialLearned]);

  if (!user) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (learned) {
        await apiDelete(`/tricks/${slug}/progress/`);
        setLearned(false);
        onToggle?.(false);
      } else {
        await apiPost(`/tricks/${slug}/progress/`);
        setLearned(true);
        onToggle?.(true);
      }
    } catch {
      // revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={learned ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {learned ? "✓ Learned" : "Mark as Learned"}
    </Button>
  );
}
