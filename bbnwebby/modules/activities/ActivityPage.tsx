"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ActivityCard } from "./ActivityCard";
import { UserActivity, UserProfileMinimal } from "./types";

/**
 * Fully self-contained component.
 * No props.
 * Reads URL query params directly using useSearchParams().
 */
export default function ActivityPage() {
  const searchParams = useSearchParams();

  const activity_id = searchParams.get("activity_id") || undefined;
  const user_id = searchParams.get("user_id") || undefined;

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [user, setUser] = useState<UserProfileMinimal | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // LOAD SINGLE ACTIVITY
      if (activity_id) {
        const { data: activityRecord } = await supabase
          .from("user_activities")
          .select("*")
          .eq("id", activity_id)
          .maybeSingle<UserActivity>();

        if (activityRecord) {
          setActivity(activityRecord);

          const { data: userRecord } = await supabase
            .from("user_profiles")
            .select("id, full_name, profession, profile_photo_url")
            .eq("id", activityRecord.user_id)
            .maybeSingle<UserProfileMinimal>();

          setUser(userRecord || null);
        }

        setLoading(false);
        return;
      }

      // LOAD ALL ACTIVITIES OF USER
      if (user_id) {
        const { data: activityList } = await supabase
          .from("user_activities")
          .select("*")
          .eq("user_id", user_id)
          .order("registration_time", { ascending: false });

        setActivities(activityList || []);

        const { data: userRecord } = await supabase
          .from("user_profiles")
          .select("id, full_name, profession, profile_photo_url")
          .eq("id", user_id)
          .maybeSingle<UserProfileMinimal>();

        setUser(userRecord || null);

        setLoading(false);
        return;
      }

      setLoading(false);
    }

    load();
  }, [activity_id, user_id]);

  // --------------------------------------------
  // UI STATES
  // --------------------------------------------
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!activity_id && !user_id) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">
          Provide <strong>activity_id</strong> or <strong>user_id</strong> in the URL.
        </p>
      </div>
    );
  }

  // SINGLE ACTIVITY MODE
  if (activity_id) {
    if (!activity) return <div className="p-8">Activity not found.</div>;
    if (!user) return <div className="p-8">User profile not found.</div>;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ActivityCard activity={activity} user={user} />
      </div>
    );
  }

  // MULTIPLE ACTIVITIES MODE
  if (user_id) {
    if (!user) return <div className="p-8">User profile not found.</div>;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Activities for {user.full_name}
        </h2>

        {activities.length === 0 ? (
          <p className="text-gray-500">No activities found.</p>
        ) : (
          activities.map((a) => (
            <ActivityCard key={a.id} activity={a} user={user} />
          ))
        )}
      </div>
    );
  }

  return null;
}
