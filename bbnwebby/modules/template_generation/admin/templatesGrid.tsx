// modules\template_generation\admin\templatesGrid.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function TemplateGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadTemplates = async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading templates:", error);
        return;
      }

      setTemplates(data as Template[]);
    };

    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((tpl) =>
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (templateId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("template_id", templateId);
    newParams.set("mode", "edit");
    router.push(`/admin?tab=templates&${newParams.toString()}`);
  };

  const handleCreateClick = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("mode", "create");
    router.push(`/admin?tab=templates&${newParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Templates</h2>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Template
        </button>
      </div>

      <input
        type="text"
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="border rounded-lg shadow-sm bg-white p-3 flex flex-col"
          >
            <div className="relative w-full h-80 bg-gray-100 rounded overflow-hidden">
              {tpl.background_img_url ? (
                <Image
                  src={tpl.background_img_url}
                  alt={tpl.name}
                  fill
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No image
                </div>
              )}
            </div>

            <p className="mt-3 font-semibold">{tpl.name}</p>

            <button
              onClick={() => handleEditClick(tpl.id)}
              className="mt-3 px-3 py-2 bg-gray-900 text-white text-center rounded hover:bg-black"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
