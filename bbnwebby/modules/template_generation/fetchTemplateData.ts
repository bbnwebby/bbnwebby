// lib/generation/fetchTemplateData.ts
import { supabase } from '@/lib/supabaseClient'

/**
 * Fetches full template data including text and image elements.
 * @param templateType 'id_card' | 'certificate'
 */
export async function fetchTemplateDataById(templateType: 'id_card' | 'certificate', id: string) {
  const FILE = 'lib/generation/fetchTemplateData.ts'
  const FUNC = 'fetchTemplateDataById'
  console.log(`[${FILE} -> ${FUNC}] Starting fetch for templateType="${templateType}" and id="${id}"`)

  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('type', templateType)
    .eq('id', id)
    .single()

  if (templateError || !template) {
    console.error(`[${FILE} -> ${FUNC}] Template fetch error:`, templateError)
    throw new Error(templateError?.message || 'Template not found')
  }

  console.log(`[${FILE} -> ${FUNC}] Template fetched successfully:`, template)

  const { data: textElements, error: textError } = await supabase
    .from('text_elements')
    .select('*')
    .eq('template_id', template.id)

  if (textError) console.error(`[${FILE} -> ${FUNC}] Error fetching text elements:`, textError)
  else console.log(`[${FILE} -> ${FUNC}] Text elements fetched:`, textElements?.length ?? 0)

  const { data: imageElements, error: imageError } = await supabase
    .from('image_elements')
    .select('*')
    .eq('template_id', template.id)

  if (imageError) console.error(`[${FILE} -> ${FUNC}] Error fetching image elements:`, imageError)
  else console.log(`[${FILE} -> ${FUNC}] Image elements fetched:`, imageElements?.length ?? 0)

  console.log(`[${FILE} -> ${FUNC}] Returning combined template data`)

  return {
    template,
    textElements: textElements ?? [],
    imageElements: imageElements ?? [],
  }
}
