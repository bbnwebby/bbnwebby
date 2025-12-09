"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TemplatesTab from "@/modules/template_generation/admin/templatesTab";

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "templates";

  const handleTabChange = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-gray-200 mt-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange("templates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === "templates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => handleTabChange("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabChange("artists")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === "artists"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Artists
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === "templates" && <TemplatesTab />}
        {currentTab === "users" && (
          <div className="text-center py-12 text-gray-500">
            Users tab coming soon...
          </div>
        )}
        {currentTab === "artists" && (
          <div className="text-center py-12 text-gray-500">
            Artists tab coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}