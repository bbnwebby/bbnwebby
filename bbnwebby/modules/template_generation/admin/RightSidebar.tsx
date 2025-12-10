"use client";

import React from "react";

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

interface RightSidebarProps {
  elements: EditorElement[];
  setElements: (elements: EditorElement[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  elements, 
  setElements, 
  selectedId,
  setSelectedId,
  backgroundUrl, 
  setBackgroundUrl 
}) => {
  const selectedElement = elements.find((el) => el.id === selectedId);

  const updateSelected = (updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) =>
        el.id === selectedElement?.id ? { ...el, ...updates } : el
      )
    );
  };

  const deleteSelected = () => {
    setElements(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const addBinding = () => {
    const currentBindings = selectedElement?.binding_config || [];
    updateSelected({
      binding_config: [
        ...currentBindings,
        {
          source: "user_profiles",
          field: "",
          fallback: "",
          transform: undefined
        }
      ]
    });
  };

  const updateBinding = (index: number, updates: Partial<BindingConfig>) => {
    const currentBindings = selectedElement?.binding_config || [];
    const newBindings = [...currentBindings];
    newBindings[index] = { ...newBindings[index], ...updates };
    updateSelected({ binding_config: newBindings });
  };

  const removeBinding = (index: number) => {
    const currentBindings = selectedElement?.binding_config || [];
    updateSelected({
      binding_config: currentBindings.filter((_, i) => i !== index)
    });
  };

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">Properties</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Background Image URL</label>
          <input
            type="text"
            value={backgroundUrl || ''}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Properties</h2>
        <button
          onClick={deleteSelected}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <div className="space-y-3">
        {/* Position & Size */}
        <div>
          <label className="block text-sm font-medium mb-1">X Position</label>
          <input
            type="number"
            value={selectedElement.x}
            onChange={(e) => updateSelected({ x: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Y Position</label>
          <input
            type="number"
            value={selectedElement.y}
            onChange={(e) => updateSelected({ y: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Width</label>
          <input
            type="number"
            value={selectedElement.width}
            onChange={(e) => updateSelected({ width: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Height</label>
          <input
            type="number"
            value={selectedElement.height}
            onChange={(e) => updateSelected({ height: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Z Index</label>
          <input
            type="number"
            value={selectedElement.z_index}
            onChange={(e) => updateSelected({ z_index: parseInt(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Text Element Properties */}
        {selectedElement.type === "text" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea
                value={selectedElement.text || ""}
                onChange={(e) => updateSelected({ text: e.target.value })}
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Static text or preview text"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be replaced by bound data if bindings are configured
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="number"
                value={selectedElement.font_size || 16}
                onChange={(e) => updateSelected({ font_size: parseInt(e.target.value) || 16 })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <input
                type="text"
                value={selectedElement.font || "Poppins"}
                onChange={(e) => updateSelected({ font: e.target.value })}
                className="w-full border rounded p-2"
                placeholder="Poppins, Arial, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <input
                type="color"
                value={selectedElement.text_color || "#000000"}
                onChange={(e) => updateSelected({ text_color: e.target.value })}
                className="w-full p-1 h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <input
                type="color"
                value={selectedElement.bg_color || "#ffffff"}
                onChange={(e) => updateSelected({ bg_color: e.target.value })}
                className="w-full p-1 h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Background Transparency</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElement.bg_transparency || 0}
                onChange={(e) => updateSelected({ bg_transparency: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-600">{selectedElement.bg_transparency || 0}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={selectedElement.alignment || "left"}
                onChange={(e) => updateSelected({ alignment: e.target.value as "left" | "center" | "right" | "justify" })}
                className="w-full border rounded p-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Line Height</label>
              <input
                type="number"
                step="0.1"
                value={selectedElement.line_height || 1.2}
                onChange={(e) => updateSelected({ line_height: parseFloat(e.target.value) || 1.2 })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedElement.text_wrap || false}
                  onChange={(e) => updateSelected({ text_wrap: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Text Wrap</span>
              </label>
            </div>
          </>
        )}

        {/* Image Element Properties */}
        {selectedElement.type === "image" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={selectedElement.image_url || ""}
                onChange={(e) => updateSelected({ image_url: e.target.value })}
                className="w-full border rounded p-2"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Static image or preview image
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Object Fit</label>
              <select
                value={selectedElement.object_fit || "contain"}
                onChange={(e) => updateSelected({ object_fit: e.target.value as "contain" | "cover" | "fill" | "none" | "scale-down" })}
                className="w-full border rounded p-2"
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

        {/* Data Binding Configuration */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Data Bindings</h3>
            <button
              onClick={addBinding}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              + Add Binding
            </button>
          </div>

          {(!selectedElement.binding_config || selectedElement.binding_config.length === 0) && (
            <p className="text-xs text-gray-500 italic">
              No data bindings configured. Click Add Binding to connect this element to dynamic data.
            </p>
          )}

          {selectedElement.binding_config && selectedElement.binding_config.length > 0 && (
            <div className="space-y-4">
              {selectedElement.binding_config.map((binding, index) => (
                <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-700">Binding #{index + 1}</span>
                    <button
                      onClick={() => removeBinding(index)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Data Source</label>
                    <select
                      value={binding.source}
                      onChange={(e) => updateBinding(index, { 
                        source: e.target.value as "user_profiles" | "makeup_artists" 
                      })}
                      className="w-full border rounded p-1.5 text-sm"
                    >
                      <option value="user_profiles">User Profiles</option>
                      <option value="makeup_artists">Makeup Artists</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Field Name</label>
                    <input
                      type="text"
                      value={binding.field}
                      onChange={(e) => updateBinding(index, { field: e.target.value })}
                      className="w-full border rounded p-1.5 text-sm"
                      placeholder="e.g., full_name, email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Fallback Value</label>
                    <input
                      type="text"
                      value={binding.fallback || ""}
                      onChange={(e) => updateBinding(index, { fallback: e.target.value })}
                      className="w-full border rounded p-1.5 text-sm"
                      placeholder="Default if data missing"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Transform</label>
                    <select
                      value={binding.transform || ""}
                      onChange={(e) => updateBinding(index, { 
                        transform: e.target.value as "uppercase" | "lowercase" | "capitalize" | undefined 
                      })}
                      className="w-full border rounded p-1.5 text-sm"
                    >
                      <option value="">None</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Preview: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                        {`{{${binding.source}.${binding.field || '?'}}}`}
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};