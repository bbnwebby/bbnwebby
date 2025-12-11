// modules\template_generation\admin\templatesTab.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TemplateGrid from "./templatesGrid";
import Editor from "./Editor";

// ============================================
// MAIN COMPONENT
// ============================================

function TemplatesTabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode"); // "create" or "edit"
  const templateId = searchParams.get("template_id");

  // --------------------------------------------
  // Editor UI State
  // --------------------------------------------

  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

  // --------------------------------------------
  // Load Template Data When Editing
  // --------------------------------------------
  useEffect(() => {
    const loadTemplateData = async () => {
      // Editing Template
      if (mode === "edit" && templateId && templateId !== loadedTemplateId) {
        // TODO: Load template from Supabase here

        setLoadedTemplateId(templateId);
      }

      // Creating New Template → Reset Editor
      else if (mode === "create" && loadedTemplateId !== null) {
        setLoadedTemplateId(null);
      }
    };

    loadTemplateData();
  }, [mode, templateId, loadedTemplateId]);

  // --------------------------------------------
  // Navigation back to template grid
  // --------------------------------------------
  const handleBackToGrid = () => {
    router.push(`/admin?tab=templates`);
  };



  // --------------------------------------------
  // SHOW EDITOR (in create or edit mode)
  // --------------------------------------------
  if (mode === "create" || mode === "edit") {


    return (
      <div className="max-100vh">

        {/* Editor */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Editor />
        </div>
      </div>
    );
  }

  // --------------------------------------------
  // SHOW TEMPLATE GRID (default)
  // --------------------------------------------
  return <TemplateGrid />;
}

// ============================================
// WRAPPER WITH SUSPENSE
// ============================================

export default function TemplatesTab() {
  return (
    <Suspense fallback={<div className="p-8">Loading templates...</div>}>
      <TemplatesTabContent />
    </Suspense>
  );
}
