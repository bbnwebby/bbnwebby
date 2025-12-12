import ActivityPage from "@/modules/activities/ActivityPage";
import { Suspense } from "react";




export default function login() {
  return (
    <Suspense>
    <div className="flex  flex-col p-12">
      <ActivityPage />
    </div>
    </Suspense>
  );
}