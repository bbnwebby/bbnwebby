// modules\template_generation\admin\RightSidebar.tsx
"use client";

import React from "react";
import { TableSchema } from "../types";
import * as Types from "../types";

// ========================================================
// PROPS
// ========================================================
interface RightSidebarProps {
  elements: Types.EditorElement[];
  setElements: React.Dispatch<React.SetStateAction<Types.EditorElement[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  backgroundUrl: string | null;
  setBackgroundUrl: React.Dispatch<React.SetStateAction<string | null>>;

  tables: TableSchema[];
  loadingSchema: boolean;
  schemaError: string | null;
}

// ========================================================
// COMPONENT
// ========================================================
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

      {/* Background */}
      <div className="mb-4">
        <label className="block mb-1">Background Image URL</label>
        <input
          type="text"
          className="border rounded p-1 w-full"
          value={backgroundUrl || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBackgroundUrl(e.target.value)
          }
          placeholder="https://example.com/bg.png"
        />
      </div>

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateElement("x", Number(e.target.value))
              }
            />

            <label className="block mt-2 mb-1">Y Position</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.y}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateElement("y", Number(e.target.value))
              }
            />
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="block mb-1">Width</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.width}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateElement("width", Number(e.target.value))
              }
            />

            <label className="block mt-2 mb-1">Height</label>
            <input
              type="number"
              className="border rounded p-1 w-full"
              value={selectedElement.height}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateElement("height", Number(e.target.value))
              }
            />
          </div>

          {/* Text options */}
          {selectedElement.type === "text" && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Text</label>
                <input
                  type="text"
                  className="border rounded p-1 w-full"
                  value={selectedElement.text || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateElement("text", e.target.value)
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Font Size</label>
                <input
                  type="number"
                  className="border rounded p-1 w-full"
                  value={selectedElement.font_size || 16}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateElement("font_size", Number(e.target.value))
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Text Color</label>
                <input
                  type="color"
                  className="border rounded p-1 w-full h-10"
                  value={selectedElement.text_color || "#000000"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateElement("text_color", e.target.value)
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Text Align</label>
                <select
                  className="border rounded p-1 mt-1 w-full"
                  value={selectedElement.alignment || "left"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
            </>
          )}

          {/* Bindings */}
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

            {(selectedElement.binding_config || []).map(
              (binding, index) => (
                <div
                  key={index}
                  className="border p-3 rounded mb-4 bg-gray-50 space-y-2"
                >
                  {/* Source table */}
                  <div>
                    <label className="block mb-1">Source Table</label>
                    <select
                      className="border rounded p-1 mt-1 w-full"
                      value={binding.source}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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

                  {/* Field */}
                  {binding.source && (
                    <div>
                      <label className="block mb-1">Field</label>
                      <select
                        className="border rounded p-1 mt-1 w-full"
                        value={binding.field}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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

                  {/* Fallback */}
                  <div>
                    <label className="block mb-1">Fallback</label>
                    <input
                      type="text"
                      className="border rounded p-1 w-full"
                      value={binding.fallback || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
              )
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
