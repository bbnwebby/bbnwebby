// modules/activities/admin/ActivitiesTab.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ActivityForm from "./CreateEditActivitiesForm";
import ActivitiesGrid from "./ActivitiesGrid";
import { supabase } from "@/lib/supabaseClient";
import { UserActivity } from "../types";

/**
 * Activities Tab — switches between grid and create/edit modes
 * based purely on URL search params.
 */
function ActivitiesTabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode"); // "create" | "edit" | null
  const activityId = searchParams.get("activity_id") || undefined;

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Debug: log render and URL params
  // ------------------------------
  console.log("ActivitiesTabContent rendered", { mode, activityId });
  console.log("All search params:", Array.from(searchParams.entries()));

  // Load all activities for admin
  useEffect(() => {
    async function loadActivities() {
      console.log("Loading activities from Supabase...");
      setLoading(true);

      const { data, error } = await supabase
        .from("user_activities")
        .select("*")
        .order("registration_time", { ascending: false });

      console.log("Supabase data:", data);
      console.log("Supabase error:", error);

      setActivities(data || []);
      setLoading(false);
    }
    loadActivities();
  }, []);

  // Navigate to create form
  const handleCreateClick = () => {
    console.log("Navigating to create mode...");
    router.push(`/admin?tab=activities&mode=create`);
  };

  // ---------------------------------------------------
  // SHOW ACTIVITY FORM (create/edit)
  // ---------------------------------------------------
  if (mode === "create" || (mode === "edit" && activityId)) {
    console.log("Showing ActivityForm");
    return (
      <div className="max-h-screen">
        <div className="bg-white rounded-lg shadow">
          <ActivityForm activityId={activityId} />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // DEFAULT VIEW: SHOW GRID + CREATE BUTTON
  // ---------------------------------------------------
  console.log("Showing ActivitiesGrid + Create button");
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Create Activity
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading activities...</p>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No activities found. Click `Create Activity` to add the first one.
        </p>
      ) : (
        <ActivitiesGrid activities={activities} />
      )}
    </div>
  );
}

/**
 * Suspense wrapper
 */
export default function ActivitiesTab() {
  return (
    <Suspense fallback={<div className="p-8">Loading activities...</div>}>
      <ActivitiesTabContent />
    </Suspense>
  );
}
