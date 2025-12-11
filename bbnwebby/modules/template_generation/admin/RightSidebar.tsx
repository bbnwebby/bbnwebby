"use client";

import React from "react";
import * as Types from "../types";

interface RightSidebarProps {
  elements: Types.EditorElement[];
  setElements: React.Dispatch<React.SetStateAction<Types.EditorElement[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  backgroundUrl: string | null;
  setBackgroundUrl: React.Dispatch<React.SetStateAction<string | null>>;
  tables: Types.TableSchema[];
  loadingSchema: boolean;
  schemaError: string | null;
  templateName: string; // template name field
  setTemplateName: React.Dispatch<React.SetStateAction<string>>; // template name setter
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  elements,
  setElements,
  selectedId,
  setSelectedId,
  backgroundUrl,
  setBackgroundUrl,
  tables,
  loadingSchema,
  schemaError,
  templateName,
  setTemplateName,
}) => {
  const selectedElement =
    elements.find((el) => el.id === selectedId) || null;

  const updateElement = <K extends keyof Types.EditorElement>(
    key: K,
    value: Types.EditorElement[K]
  ) => {
    if (!selectedElement) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElement.id ? { ...el, [key]: value } : el
      )
    );
  };

  const updateBinding = (index: number, updated: Types.BindingConfig) => {
    if (!selectedElement) return;
    const list = [...(selectedElement.binding_config || [])];
    list[index] = updated;
    updateElement("binding_config", list);
  };

  const addBinding = () => {
    if (!selectedElement) return;
    const newBinding: Types.BindingConfig = {
      source: "",
      field: "",
      fallback: "",
    };
    updateElement("binding_config", [
      ...(selectedElement.binding_config || []),
      newBinding,
    ]);
  };

  const removeBinding = (index: number) => {
    if (!selectedElement) return;
    const updated = (selectedElement.binding_config || []).filter(
      (_, i) => i !== index
    );
    updateElement("binding_config", updated);
  };

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Properties</h2>

      {!selectedElement && (
        <div className="mb-4">
          <label className="block mb-1">Template Name</label>
          <input
            type="text"
            className="border rounded p-1 w-full"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>
      )}

      {!selectedElement && (
        <div className="mb-4">
          <label className="block mb-1">Background Image URL</label>
          <input
            type="text"
            className="border rounded p-1 w-full"
            value={backgroundUrl || ""}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://example.com/bg.png"
          />
        </div>
      )}

      {!selectedElement && (
        <p className="text-sm text-gray-500">
          Select an element to edit its properties.
        </p>
      )}

      {selectedElement && (
        <div>
          {/* Position */}
          <div className="mb-4">
            <label className="block mb-1">X Position</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.x}
              onChange={(e) => updateElement("x", Number(e.target.value))}
            />
            <label className="block mt-2 mb-1">Y Position</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.y}
              onChange={(e) => updateElement("y", Number(e.target.value))}
            />
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="block mb-1">Width</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.width}
              onChange={(e) => updateElement("width", Number(e.target.value))}
            />
            <label className="block mt-2 mb-1">Height</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.height}
              onChange={(e) => updateElement("height", Number(e.target.value))}
            />
          </div>

          {/* Z-index */}
          <div className="mb-4">
            <label className="block mb-1">Z Index</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.z_index || 0}
              onChange={(e) => updateElement("z_index", Number(e.target.value))}
            />
          </div>

          {/* Text Element */}
          {selectedElement.type === "text" && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Text</label>
                <textarea
                  className="border rounded p-1 w-full resize-none"
                  value={selectedElement.text || ""}
                  onChange={(e) => updateElement("text", e.target.value)}
                  rows={3}
                  placeholder="Enter text. Supports multi-line."
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Font</label>
                <input
                  type="text"
                  className="border rounded p-1 w-full"
                  value={selectedElement.font || "Poppins"}
                  onChange={(e) => updateElement("font", e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Font Size</label>
                <input
                  type="number"
                  className="border rounded p-1 w-full"
                  value={selectedElement.font_size || 14}
                  onChange={(e) => updateElement("font_size", Number(e.target.value))}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Text Color</label>
                <input
                  type="color"
                  className="border rounded p-1 w-full h-10"
                  value={selectedElement.text_color || "#000000"}
                  onChange={(e) => updateElement("text_color", e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Background Color</label>
                <input
                  type="color"
                  className="border rounded p-1 w-full h-10"
                  value={selectedElement.bg_color || "#ffffff"}
                  onChange={(e) => updateElement("bg_color", e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Background Transparency</label>
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  max={1}
                  className="border rounded p-1 w-full"
                  value={selectedElement.bg_transparency || 0}
                  onChange={(e) =>
                    updateElement("bg_transparency", Number(e.target.value))
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Text Align</label>
                <select
                  className="border rounded p-1 w-full"
                  value={selectedElement.alignment || "left"}
                  onChange={(e) =>
                    updateElement(
                      "alignment",
                      e.target.value as Types.EditorElement["alignment"]
                    )
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedElement.text_wrap || false}
                    onChange={(e) => updateElement("text_wrap", e.target.checked)}
                  />
                  Wrap Text
                </label>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Line Height</label>
                <input
                  type="number"
                  step={0.1}
                  className="border rounded p-1 w-full"
                  value={selectedElement.line_height || 1.2}
                  onChange={(e) =>
                    updateElement("line_height", Number(e.target.value))
                  }
                />
              </div>
            </>
          )}

          {/* Image Element */}
          {selectedElement.type === "image" && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Image URL</label>
                <input
                  type="text"
                  className="border rounded p-1 w-full"
                  value={selectedElement.image_url || ""}
                  onChange={(e) => updateElement("image_url", e.target.value)}
                />
              </div>

              {/* QR Text */}
              <div className="mb-4">
                <label className="block mb-1">QR Text</label>
                <input
                  type="text"
                  className="border rounded p-1 w-full"
                  value={selectedElement.qr_text || ""}
                  onChange={(e) => updateElement("qr_text", e.target.value)}
                  placeholder="Enter data to generate QR"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Object Fit</label>
                <select
                  className="border rounded p-1 w-full"
                  value={selectedElement.object_fit || "contain"}
                  onChange={(e) =>
                    updateElement(
                      "object_fit",
                      e.target.value as Types.EditorElement["object_fit"]
                    )
                  }
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
              </div>
            </>
          )}

          {/* Bindings Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Bindings</h3>
            {loadingSchema && (
              <p className="text-sm text-gray-500">Loading database schema…</p>
            )}
            {schemaError && (
              <p className="text-sm text-red-500">{schemaError}</p>
            )}
            <button
              onClick={addBinding}
              className="mb-3 px-3 py-1 rounded bg-blue-600 text-white text-sm"
            >
              Add Binding
            </button>
            {(selectedElement.binding_config || []).map((binding, index) => (
              <div
                key={index}
                className="border p-3 rounded mb-4 bg-gray-50 space-y-2"
              >
                <div>
                  <label className="block mb-1">Source Table</label>
                  <select
                    className="border rounded p-1 w-full"
                    value={binding.source}
                    onChange={(e) =>
                      updateBinding(index, {
                        ...binding,
                        source: e.target.value,
                        field: "",
                      })
                    }
                  >
                    <option value="">Select table</option>
                    {tables.map((t) => (
                      <option key={t.table_name} value={t.table_name}>
                        {t.table_name}
                      </option>
                    ))}
                  </select>
                </div>

                {binding.source && (
                  <div>
                    <label className="block mb-1">Field</label>
                    <select
                      className="border rounded p-1 w-full"
                      value={binding.field}
                      onChange={(e) =>
                        updateBinding(index, {
                          ...binding,
                          field: e.target.value,
                        })
                      }
                    >
                      <option value="">Select field</option>
                      {tables
                        .find((t) => t.table_name === binding.source)
                        ?.columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block mb-1">Fallback</label>
                  <input
                    type="text"
                    className="border rounded p-1 w-full"
                    value={binding.fallback || ""}
                    onChange={(e) =>
                      updateBinding(index, {
                        ...binding,
                        fallback: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  onClick={() => removeBinding(index)}
                  className="text-red-600 text-sm mt-2"
                >
                  Remove Binding
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
