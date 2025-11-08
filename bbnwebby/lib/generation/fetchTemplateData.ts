// lib/generation/fetchTemplateData.ts
import { supabase } from '@/lib/supabaseClient'
import { Template, TextElement, ImageElement } from '@/types/types'

/**
 * Fetches full template data including text and image elements.
 * @param templateType 'id_card' | 'certificate'
 */
export async function fetchTemplateDataById(templateType: 'id_card' | 'certificate', id: string) {
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('type', templateType)
    .eq('id', id)
    .single()

  if (templateError || !template) throw new Error(templateError?.message || 'Template not found')

  const { data: textElements } = await supabase
    .from('text_elements')
    .select('*')
    .eq('template_id', template.id)

  const { data: imageElements } = await supabase
    .from('image_elements')
    .select('*')
    .eq('template_id', template.id)

  return {
    template,
    textElements: textElements ?? [],
    imageElements: imageElements ?? [],
  }
}
