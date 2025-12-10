"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TemplateGrid from "./templatesGrid";
import Editor from "./Editor";

// ============================================
// TYPES (LOCAL TO THIS FILE)
// ============================================

interface BindingConfig {
  source: "user_profiles" | "makeup_artists";
  field: string;
  fallback?: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
}

interface EditorElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  text?: string;
  font_size?: number;
  font?: string;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number;
  alignment?: "left" | "center" | "right" | "justify";
  text_wrap?: boolean;
  line_height?: number;
  image_url?: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  binding_config?: BindingConfig[];
}

interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url: string | null;
}

// Props needed by Editor based on current usage
interface EditorProps {
  state: {
    elements: EditorElement[];
    setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>;
    selectedId: string | null;
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
    backgroundUrl: string | null;
    setBackgroundUrl: React.Dispatch<React.SetStateAction<string | null>>;
  };
}

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
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

  // --------------------------------------------
  // Load Template Data When Editing
  // --------------------------------------------
  useEffect(() => {
    const loadTemplateData = async () => {
      // Editing Template
      if (mode === "edit" && templateId && templateId !== loadedTemplateId) {
        // TODO: Load template from Supabase here

        // Reset for now (placeholder)
        setElements([]);
        setSelectedId(null);
        setBackgroundUrl(null);

        setLoadedTemplateId(templateId);
      }

      // Creating New Template → Reset Editor
      else if (mode === "create" && loadedTemplateId !== null) {
        setElements([]);
        setSelectedId(null);
        setBackgroundUrl(null);
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
  // Save template (placeholder – actual Supabase logic to be added)
  // --------------------------------------------
  const handleSaveTemplate = async () => {
    console.log("Saving template...", {
      mode,
      templateId,
      elements,
      backgroundUrl,
    });

    alert("Save functionality coming soon!");
  };

  // --------------------------------------------
  // SHOW EDITOR (in create or edit mode)
  // --------------------------------------------
  if (mode === "create" || mode === "edit") {
    const editorState: EditorProps["state"] = {
      elements,
      setElements,
      selectedId,
      setSelectedId,
      backgroundUrl,
      setBackgroundUrl,
    };

    return (
      <div className="space-y-4">
        {/* Header */}
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
