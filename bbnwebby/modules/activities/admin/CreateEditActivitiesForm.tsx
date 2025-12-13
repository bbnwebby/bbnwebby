// modules/activities/admin/CreateEditActivitiesFrom.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  UserActivity,
  UserActivityFormData,
  UserProfileMinimal,
} from "../types";

interface ActivityFormProps {
  activityId?: string; // if provided → edit mode
}

/**
 * Admin Create/Edit Form for Activities.
 * Styled similarly to your RightSidebar layout.
 */
export default function ActivityForm({ activityId }: ActivityFormProps) {
  // Form state
  const [form, setForm] = useState<UserActivityFormData>({
    user_id: "",
    activity_type: "",
    activity_name: "",
    activity_description: "",
    cover_image_url: "",
    start_time: "",
    completion_time: "",
  });

  const [users, setUsers] = useState<UserProfileMinimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedExisting, setLoadedExisting] = useState(false);

  // ---------------------------------------
  // Load user list (for dropdown)
  // ---------------------------------------
  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("user_profiles")
        .select("id, full_name, profession, profile_photo_url");

      setUsers(data || []);
    }
    loadUsers();
  }, []);

  // ---------------------------------------
  // Edit mode: load existing activity
  // ---------------------------------------
  useEffect(() => {
    if (!activityId) return;

    async function loadActivity() {
      const { data } = await supabase
        .from("user_activities")
        .select("*")
        .eq("id", activityId)
        .maybeSingle<UserActivity>();

      if (data) {
        setForm({
          user_id: data.user_id,
          activity_type: data.activity_type,
          activity_name: data.activity_name,
          activity_description: data.activity_description ?? "",
          cover_image_url: data.cover_image_url ?? "",
          start_time: data.start_time ?? "",
          completion_time: data.completion_time ?? "",
        });
        setLoadedExisting(true);
      }
    }

    loadActivity();
  }, [activityId]);

  // Simple helper
  const update = <K extends keyof UserActivityFormData>(
    key: K,
    val: UserActivityFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // ---------------------------------------
  // Submit handler
  // ---------------------------------------
  async function handleSubmit() {
    setLoading(true);

    if (activityId) {
      await supabase
        .from("user_activities")
        .update(form)
        .eq("id", activityId);
    } else {
      await supabase.from("user_activities").insert(form);
    }

    setLoading(false);
    alert("Saved!");
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div className="w-full border rounded p-6 bg-white space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        {activityId && loadedExisting ? "Edit Activity" : "Create Activity"}
      </h2>

      {/* USER FIELD */}
      <div>
        <label className="block mb-1 font-medium">User</label>
        <select
          className="border rounded p-2 w-full"
          value={form.user_id}
          onChange={(e) => update("user_id", e.target.value)}
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} — {u.profession}
            </option>
          ))}
        </select>
      </div>

      {/* ACTIVITY TYPE */}
      <div>
        <label className="block mb-1 font-medium">Activity Type</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.activity_type}
          onChange={(e) => update("activity_type", e.target.value)}
          placeholder="Example: workshop, seminar, event"
        />
      </div>

      {/* ACTIVITY NAME */}
      <div>
        <label className="block mb-1 font-medium">Activity Name</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.activity_name}
          onChange={(e) => update("activity_name", e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="border rounded p-2 w-full resize-none"
          rows={3}
          value={form.activity_description}
          onChange={(e) => update("activity_description", e.target.value)}
        />
      </div>

      {/* COVER IMAGE */}
      <div>
        <label className="block mb-1 font-medium">Cover Image URL</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={form.cover_image_url}
          onChange={(e) => update("cover_image_url", e.target.value)}
          placeholder="https://example.com/image.png"
        />
      </div>

      {/* DATE/TIME */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Completion Time</label>
          <input
            type="datetime-local"
            className="border rounded p-2 w-full"
            value={form.completion_time}
            onChange={(e) => update("completion_time", e.target.value)}
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        {loading ? "Saving..." : "Save Activity"}
      </button>
    </div>
  );
}
