//ActivityCard.tsx
"use client";

import React from "react";
import { UserActivity, UserProfileMinimal } from "./types";

interface ActivityCardProps {
  activity: UserActivity;
  user: UserProfileMinimal;
}

/**
 * Displays activity and user details in a two-column layout.
 */
export function ActivityCard({ activity, user }: ActivityCardProps) {
  return (
    <div className="border rounded-lg p-4 my-4 w-full bg-white shadow">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {activity.activity_name}{" "}
          <span className="text-gray-500 text-sm">
            ({activity.activity_type})
          </span>
        </h2>

        <div className="text-right text-gray-600 text-sm">
          {activity.start_time && (
            <p>Start: {new Date(activity.start_time).toLocaleString()}</p>
          )}
          {activity.completion_time && (
            <p>End: {new Date(activity.completion_time).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Activity Details */}
        <div>
          <h3 className="font-semibold mb-2">Activity Details</h3>

          <p className="text-gray-800 whitespace-pre-line">
            {activity.activity_description || "No description provided."}
          </p>

          {activity.cover_image_url && (
            <img
              src={activity.cover_image_url}
              alt="Activity cover"
              className="mt-4 rounded-lg border"
            />
          )}
        </div>

        {/* Right Column - User Details */}
        <div>
          <h3 className="font-semibold mb-2">User Details</h3>

          <p>
            <strong>Name:</strong> {user.full_name}
          </p>
          <p>
            <strong>Profession:</strong> {user.profession || "N/A"}
          </p>
          <p>
            <strong>Registration No:</strong>{" "}
            {activity.activity_registration_number || "N/A"}
          </p>
          <p>
            <strong>Registered At:</strong>{" "}
            {new Date(activity.registration_time).toLocaleString()}
          </p>

          {user.profile_photo_url && (
            <img
              src={user.profile_photo_url}
              alt="User"
              className="mt-4 w-32 h-32 object-cover rounded-full border"
            />
          )}
        </div>
      </div>
    </div>
  );
}
