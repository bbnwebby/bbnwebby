"use client";

import React, { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ZoomableCanvas } from "./Canvas";
import { RightSidebar } from "./RightSidebar";
import { LeftSidebar } from "./LeftSidebar";

/*
 ===========================================
 TYPES
 ===========================================
 - All types used in this file are declared explicitly to avoid TS inference errors.
 - No `any` types used; all fields have specific types or optional.
*/

// single binding config entry (array used on elements)
interface BindingConfig {
  source: "user_profiles" | "makeup_artists";
  field: string;
  fallback?: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
}

export interface EditorElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  // text element
  text?: string;
  font_size?: number;
  font?: string;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number;
  alignment?: "left" | "center" | "right" | "justify";
  text_wrap?: boolean;
  line_height?: number;
  // image element
  image_url?: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  // binding
  binding_config?: BindingConfig[];
}

export interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url: string | null;
}

/*
 ===========================================
 PROPS INTERFACES EXPECTED BY CHILD COMPONENTS
 ===========================================
 - These are the shapes assumed for Canvas/LeftSidebar/RightSidebar.
 - If those components define different props in their files, make them compatible.
*/

export interface EditorState {
  elements: EditorElement[];
  setElements: Dispatch<SetStateAction<EditorElement[]>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  backgroundUrl: string | null;
  setBackgroundUrl: Dispatch<SetStateAction<string | null>>;
}

/*
 ===========================================
 TemplateEditor component
 - Loads templates from Supabase
 - Allows create/edit/save of templates
 - Manages editor state that is passed to child panels
 ===========================================
*/

export default function TemplateEditor(): JSX.Element {
  // UI mode: grid = show templates list, create = new template, edit = editing existing
  const [mode, setMode] = useState<"grid" | "create" | "edit">("grid");

  // templates list loaded from DB
  const [templates, setTemplates] = useState<Template[]>([]);

  // current editing template id (null for create)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // template metadata (name + type)
  const [templateName, setTemplateName] = useState<string>("");
  const [templateType, setTemplateType] = useState<"certificate" | "id_card">(
    "certificate"
  );

  // Editor state (elements + selection + background) — passed down to children
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  // Canvas size (kept local here — children receive width/height)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState<number>(1); // 1 = 100%

  // Handler for slider
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  // Load image dimensions when background URL changes
  useEffect(() => {
    if (!backgroundUrl) {
      setCanvasSize({ width: 800, height: 600 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      console.error("Failed to load background image");
      setCanvasSize({ width: 800, height: 600 });
    };
    img.src = backgroundUrl;
  }, [backgroundUrl]);

  // -------------------------
  // Load templates from Supabase
  // -------------------------
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading templates:", error);
          return;
        }
        if (data) setTemplates(data as Template[]);
      } catch (err) {
        console.error("Unexpected error loading templates:", err);
      }
    };

    loadTemplates();
  }, []);

  // -------------------------
  // Load a single template (text + image elements) for editing
  // -------------------------
  const loadTemplate = async (templateId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*, text_elements(*), image_elements(*)")
        .eq("id", templateId)
        .single();

      if (error || !data) {
        console.error("Failed to load template:", error);
        alert("Failed to load template");
        return;
      }

      // set metadata
      setCurrentTemplateId(data.id);
      setTemplateName(data.name);
      setTemplateType(data.type);
      setBackgroundUrl(data.background_img_url);

      // map DB elements to EditorElement[]
      const loadedElements: EditorElement[] = [
        ...(data.text_elements || []).map(
          (te: {
            id: string;
            x: number | string;
            y: number | string;
            width: number | string;
            height: number | string;
            z_index: number | null;
            static_text: string | null;
            font_size: number | null;
            font: string | null;
            text_color: string | null;
            bg_color: string | null;
            bg_transparency: number | null;
            alignment: string | null;
            text_wrap: boolean | null;
            line_height: number | null;
            binding_config: unknown;
          }) => ({
            id: te.id,
            type: "text" as const,
            x: parseFloat(te.x.toString()),
            y: parseFloat(te.y.toString()),
            width: parseFloat(te.width.toString()),
            height: parseFloat(te.height.toString()),
            z_index: te.z_index ?? 0,
            text: te.static_text ?? "",
            font_size: te.font_size ?? 16,
            font: te.font ?? "Arial",
            text_color: te.text_color ?? "#000000",
            bg_color: te.bg_color ?? "#ffffff",
            bg_transparency: te.bg_transparency ?? 0,
            alignment:
              (te.alignment as "left" | "center" | "right" | "justify") ?? "left",
            text_wrap: te.text_wrap ?? false,
            line_height: te.line_height ?? 1.2,
            binding_config: te.binding_config as EditorElement["binding_config"],
          })
        ),
        ...(data.image_elements || []).map(
          (ie: {
            id: string;
            x: number | string;
            y: number | string;
            width: number | string;
            height: number | string;
            z_index: number | null;
            image_url: string;
            object_fit: string | null;
            binding_config: unknown;
          }) => ({
            id: ie.id,
            type: "image" as const,
            x: parseFloat(ie.x.toString()),
            y: parseFloat(ie.y.toString()),
            width: parseFloat(ie.width.toString()),
            height: parseFloat(ie.height.toString()),
            z_index: ie.z_index ?? 0,
            image_url: ie.image_url,
            object_fit:
              (ie.object_fit as
                | "contain"
                | "cover"
                | "fill"
                | "none"
                | "scale-down") ?? "contain",
            binding_config: ie.binding_config as EditorElement["binding_config"],
          })
        ),
      ];

      setElements(loadedElements);
      setSelectedId(null);
      setMode("edit");
    } catch (err) {
      console.error("Unexpected error loading template:", err);
      alert("Failed to load template");
    }
  };

  // -------------------------
  // Save template (create or update)
  // -------------------------
  const saveTemplate = async (): Promise<void> => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    try {
      let templateId = currentTemplateId;

      if (mode === "create") {
        // create new template row
        const { data, error } = await supabase
          .from("templates")
          .insert({
            name: templateName,
            type: templateType,
            background_img_url: backgroundUrl,
          })
          .select()
          .single();

        if (error || !data) {
          throw error ?? new Error("Failed to create template");
        }
        templateId = data.id;
        setCurrentTemplateId(templateId);
      } else if (templateId) {
        // update metadata
        const { error } = await supabase
          .from("templates")
          .update({
            name: templateName,
            type: templateType,
            background_img_url: backgroundUrl,
          })
          .eq("id", templateId);

        if (error) throw error;

        // delete existing element rows for this template (we'll reinsert below)
        await supabase.from("text_elements").delete().eq("template_id", templateId);
        await supabase
          .from("image_elements")
          .delete()
          .eq("template_id", templateId);
      } else {
        throw new Error("Missing template id for update");
      }

      // insert elements
      for (const el of elements) {
        if (!templateId) continue; // type-safety guard

        if (el.type === "text") {
          await supabase.from("text_elements").insert({
            id: el.id,
            template_id: templateId,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            z_index: el.z_index,
            static_text: el.text ?? "",
            font_size: el.font_size ?? null,
            font: el.font ?? null,
            text_color: el.text_color ?? null,
            bg_color: el.bg_color ?? null,
            bg_transparency: el.bg_transparency ?? null,
            alignment: el.alignment ?? null,
            text_wrap: el.text_wrap ?? null,
            line_height: el.line_height ?? null,
            binding_config: el.binding_config ?? null,
          });
        } else if (el.type === "image") {
          await supabase.from("image_elements").insert({
            id: el.id,
            template_id: templateId,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            z_index: el.z_index,
            image_url: el.image_url ?? "",
            object_fit: el.object_fit ?? null,
            binding_config: el.binding_config ?? null,
          });
        }
      }

      alert("Template saved successfully!");
      setMode("grid");

      // refresh templates list
      const { data } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setTemplates(data as Template[]);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save template");
    }
  };

  // -------------------------
  // Render: grid mode shows template cards, otherwise editor UI
  // -------------------------
  if (mode === "grid") {
    return (
      <div className="h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Templates</h1>
            <button
              onClick={() => {
                setMode("create");
                setCurrentTemplateId(null);
                setTemplateName("");
                setTemplateType("certificate");
                setElements([]);
                setBackgroundUrl(null);
                setSelectedId(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-lg shadow p-4">
                <div className="aspect-video bg-gray-200 rounded mb-3 overflow-hidden">
                  {tpl.background_img_url ? (
                    <img
                      src={tpl.background_img_url}
                      alt={tpl.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No preview
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{tpl.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{tpl.type}</p>
                <button
                  onClick={() => loadTemplate(tpl.id)}
                  className="w-full py-2 bg-gray-900 text-white rounded hover:bg-black"
                >
                  Edit Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Editor state object to pass to child components
  const editorState: EditorState = {
    elements,
    setElements,
    selectedId,
    setSelectedId,
    backgroundUrl,
    setBackgroundUrl,
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode("grid")}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            ← Back to Templates
          </button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template Name"
            className="px-3 py-2 border rounded w-64"
          />
          <select
            value={templateType}
            onChange={(e) =>
              setTemplateType(e.target.value as "certificate" | "id_card")
            }
            className="px-3 py-2 border rounded"
          >
            <option value="certificate">Certificate</option>
            <option value="id_card">ID Card</option>
          </select>
        </div>
        <button
          onClick={saveTemplate}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Template
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — pass only the props it needs (make sure LeftSidebar's props match these) */}
        <LeftSidebar
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />

        


      <ZoomableCanvas
        elements={elements}
        setElements={setElements}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        backgroundUrl={backgroundUrl}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
      />






        {/* Right sidebar — controls for selected element & background */}
        <RightSidebar
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          backgroundUrl={backgroundUrl}
          setBackgroundUrl={setBackgroundUrl}
        />
      </div>
    </div>
  );
}