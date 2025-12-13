// modules/activities/admin/ActivitiesGrid.tsx
"use client";

import React from "react";
import { UserActivity } from "../types";

interface ActivitiesGridProps {
  activities: UserActivity[];
}

export default function ActivitiesGrid({ activities }: ActivitiesGridProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="border rounded p-4 bg-white shadow hover:shadow-md transition"
        >
          <h3 className="font-semibold">{activity.activity_name}</h3>
          <p className="text-gray-500 text-sm">{activity.activity_type}</p>
          <p className="text-gray-700 mt-2">
            {activity.activity_description || "No description"}
          </p>
        </div>
      ))}
    </div>
  );
}
