"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TemplateGrid from "./templatesGrid";
import Editor from "./Editor";
import { EditorElement } from "../types";

function TemplatesTabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode"); // "create" or "edit"
  const templateId = searchParams.get("template_id");

  // Editor state - initialize based on mode
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

  // Load template data when in edit mode
  useEffect(() => {
    const loadTemplateData = async () => {
      if (mode === "edit" && templateId && templateId !== loadedTemplateId) {
        // TODO: Load template data from Supabase
        // const { data, error } = await supabase
        //   .from("templates")
        //   .select("*, text_elements(*), image_elements(*)")
        //   .eq("id", templateId)
        //   .single();
        
        // For now, reset to empty state
        setElements([]);
        setSelectedId(null);
        setBackgroundUrl(null);
        setLoadedTemplateId(templateId);
      } else if (mode === "create" && loadedTemplateId !== null) {
        // Reset for new template only if coming from a loaded template
        setElements([]);
        setSelectedId(null);
        setBackgroundUrl(null);
        setLoadedTemplateId(null);
      }
    };

    loadTemplateData();
  }, [mode, templateId, loadedTemplateId]);

  const handleBackToGrid = () => {
    router.push(`/admin?tab=templates`);
  };

  const handleSaveTemplate = async () => {
    // TODO: Implement save logic to Supabase
    console.log("Saving template...", {
      mode,
      templateId,
      elements,
      backgroundUrl,
    });
    alert("Save functionality coming soon!");
  };

  // Show editor in create or edit mode
  if (mode === "create" || mode === "edit") {
    const editorState = {
      elements,
      setElements,
      selectedId,
      setSelectedId,
      backgroundUrl,
      setBackgroundUrl,
    };

    return (
      <div className="space-y-4">
        {/* Editor Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToGrid}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">
              {mode === "create" ? "Create New Template" : "Edit Template"}
            </h2>
          </div>
          
          <button
            onClick={handleSaveTemplate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Template
          </button>
        </div>

        {/* Editor Component */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Editor state={editorState} />
        </div>
      </div>
    );
  }

  // Show template grid by default
  return <TemplateGrid />;
}

export default function TemplatesTab() {
  return (
    <Suspense fallback={<div className="p-8">Loading templates...</div>}>
      <TemplatesTabContent />
    </Suspense>
  );
}