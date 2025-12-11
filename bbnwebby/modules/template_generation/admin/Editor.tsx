// modules\template_generation\admin\Editor.tsx

"use client";

import React, { JSX, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ZoomableCanvas } from "./Canvas";
import { LeftSidebar } from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import * as Types from "../types";

export default function TemplateEditor(): JSX.Element {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode"); // "create" | "edit" | null
  const templateIdParam = searchParams.get("template_id"); // string | null

  // Editor state
  const [elements, setElements] = useState<Types.EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // Template metadata
  const [templateName, setTemplateName] = useState<string>("");
  const [templateType, setTemplateType] = useState<"certificate" | "id_card">("certificate");

  // Canvas
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });


  // Adjust canvas size when background changes
  useEffect(() => {
    if (!backgroundUrl) {
      setCanvasSize({ width: 800, height: 600 });
      return;
    }

    const img = new Image();
    img.onload = () => setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => setCanvasSize({ width: 800, height: 600 });
    img.src = backgroundUrl;
  }, [backgroundUrl]);

  // Load single template for editing
  const loadTemplate = async (templateId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*, text_elements(*), image_elements(*)")
        .eq("id", templateId)
        .single();

      if (error || !data) throw error ?? new Error("Failed to load template");

      setCurrentTemplateId(data.id);
      setTemplateName(data.name);
      setTemplateType(data.type);
      setBackgroundUrl(data.background_img_url);

      const loadedElements: Types.EditorElement[] = [
        ...(data.text_elements as Types.TextElementRow[]).map((te) => ({
          id: te.id,
          type: "text" as const,
          x: Number(te.x),
          y: Number(te.y),
          width: Number(te.width),
          height: Number(te.height),
          z_index: te.z_index ?? 0,
          text: te.static_text ?? "",
          font_size: te.font_size ?? 16,
          font: te.font ?? "Arial",
          text_color: te.text_color ?? "#000000",
          bg_color: te.bg_color ?? "#ffffff",
          bg_transparency: te.bg_transparency ?? 0,
          alignment: te.alignment ?? "left",
          text_wrap: te.text_wrap ?? false,
          line_height: te.line_height ?? 1.2,
          binding_config: te.binding_config ?? [],
        })),
        ...(data.image_elements as Types.ImageElementRow[]).map((ie) => ({
          id: ie.id,
          type: "image" as const,
          x: Number(ie.x),
          y: Number(ie.y),
          width: Number(ie.width),
          height: Number(ie.height),
          z_index: ie.z_index ?? 0,
          image_url: ie.image_url ?? undefined,
          object_fit: ie.object_fit ?? "contain",
          binding_config: ie.binding_config ?? [],
        })),
      ];

      setElements(loadedElements);
      setSelectedId(null);

    } catch (err) {
      console.error("Failed to load template:", err);
      alert("Failed to load template");
    }
  };

  // Detect URL changes and set mode/state accordingly
  useEffect(() => {
    if (modeParam === "edit" && templateIdParam) {
      // Only reload if the template is different
      if (templateIdParam !== currentTemplateId) {
        loadTemplate(templateIdParam);
      }
    } else if (modeParam === "create") {

      setElements([]);
      setBackgroundUrl(null);
      setSelectedId(null);
      setCurrentTemplateId(null);
      setTemplateName("");
      setTemplateType("certificate");
    }
  }, [modeParam, templateIdParam]);

  // Schema fetch
  const [tables, setTables] = useState<Types.TableSchema[]>([]);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const { data, error } = await supabase.rpc("get_schema");
        if (error) {
          setSchemaError("Failed to load schema");
        } else {
          setTables(data as Types.TableSchema[]);
        }
      } catch (err) {
        console.error(err);
        setSchemaError("Unexpected schema error");
      } finally {
        setLoadingSchema(false);
      }
    };
    fetchSchema();
  }, []);

  // Save template
// Save template to Supabase
// Save template to Supabase
const saveTemplate = async (): Promise<void> => {
  if (!templateName.trim()) {
    alert("Please enter a template name");
    return;
  }

  try {
    // 1️⃣ Upsert the template itself
    const { data: templateData, error: templateError } = await supabase
      .from("templates")
      .upsert(
        {
          id: currentTemplateId ?? undefined,
          name: templateName,
          type: templateType,
          background_img_url: backgroundUrl ?? null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (templateError || !templateData) throw templateError ?? new Error("Failed to save template");

    const templateId = templateData.id;

    // 2️⃣ Prepare text elements
    const textElements = elements
      .filter((el) => el.type === "text")
      .map((el) => ({
        id: el.id,
        template_id: templateId,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        z_index: el.z_index ?? 0,
        static_text: el.text ?? "",
        font: el.font ?? "Poppins",
        font_size: el.font_size ?? 14,
        text_color: el.text_color ?? "#000000",
        bg_color: el.bg_color ?? "#ffffff",
        bg_transparency: el.bg_transparency ?? 0,
        alignment: el.alignment ?? "left",
        text_wrap: el.text_wrap ?? false,
        line_height: el.line_height ?? 1.2,
        binding_config: el.binding_config ?? [],
      }));

    // 3️⃣ Prepare image elements
    const imageElements = elements
      .filter((el) => el.type === "image")
      .map((el) => ({
        id: el.id,
        template_id: templateId,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        z_index: el.z_index ?? 0,
        image_url: el.image_url ?? "",
        object_fit: el.object_fit ?? "contain",
        binding_config: el.binding_config ?? [],
      }));

    // 4️⃣ Upsert text elements
    if (textElements.length > 0) {
      const { error: textError } = await supabase
        .from("text_elements")
        .upsert(textElements, { onConflict: "id" });

      if (textError) throw textError;
    }

    // 5️⃣ Upsert image elements
    if (imageElements.length > 0) {
      const { error: imageError } = await supabase
        .from("image_elements")
        .upsert(imageElements, { onConflict: "id" });

      if (imageError) throw imageError;
    }

    alert("Template saved successfully!");
    setCurrentTemplateId(templateId);
  } catch (err: unknown) {
    console.error("Save failed:", err);
    if (err instanceof Error) alert(`Save failed: ${err.message}`);
    else alert("Save failed: unknown error");
  }
};





  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
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

        <RightSidebar
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          backgroundUrl={backgroundUrl}
          setBackgroundUrl={setBackgroundUrl}
          tables={tables}
          loadingSchema={loadingSchema}
          schemaError={schemaError}
        />
      </div>

      {/* Save Button */}
      <div className="p-4 bg-gray-50 flex justify-end">
        <button
          onClick={saveTemplate}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}
