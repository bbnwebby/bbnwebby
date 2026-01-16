// app/bbn_directors/page.tsx

import DirectorGridWithFilters from "@/components/shared/bbn/BbnDirectorsGrid";




export default function AboutPage() {
  return (
    <div className="p-10 space-y-10">
    <DirectorGridWithFilters/>
    </div>
  )
}