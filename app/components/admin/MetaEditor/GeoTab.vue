<template>
    <div class="space-y-6">
        <div class="bg-indigo-50 p-4 rounded-lg flex items-start gap-3">
            <svg class="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <div class="text-sm text-indigo-800">
                <p class="font-semibold mb-1">Generative Engine Optimization (GEO)</p>
                <p>AI 검색 엔진(ChatGPT, Perplexity 등)이 콘텐츠를 잘 이해하고 인용할 수 있도록 돕는 구조화된 데이터입니다.</p>
            </div>
        </div>

        <!-- AI Summary -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">AI Summary</label>
            <textarea
                v-model="modelValue.geoMeta.summary"
                rows="4"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                placeholder="AI가 이 글을 어떻게 요약하면 좋을지 3-4문장으로 작성하세요. (비워두면 에디터 내용에서 자동 추출됩니다)"
            ></textarea>
        </div>

        <!-- Key Takeaways -->
        <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Key Takeaways (핵심 요약)</label>
             <div class="space-y-2">
                 <div v-for="(item, index) in modelValue.geoMeta.keyTakeaways" :key="index" class="flex gap-2">
                     <span class="shrink-0 flex items-center justify-center w-6 h-full text-indigo-500 font-bold">•</span>
                     <input 
                        v-model="modelValue.geoMeta.keyTakeaways[index]" 
                        type="text" 
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Key point..."
                     />
                     <button @click="removeTakeaway(index)" class="text-gray-400 hover:text-red-500 p-2">&times;</button>
                 </div>
                 <button 
                    @click="addTakeaway" 
                    class="ml-8 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    + Add Key Takeaway
                 </button>
             </div>
             <p class="text-xs text-gray-500 mt-2 ml-8">글의 핵심 내용을 3~5개 정도 리스트 형태로 제공하면 AI 인용 확률이 높아집니다.</p>
        </div>

        <!-- Relevant Entities (Keywords) -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Relevant Entities (관련 키워드/엔티티)</label>
            <div class="flex flex-wrap gap-2 mb-2 p-1 bg-white border border-gray-200 rounded-lg min-h-[42px]">
                 <span v-for="(entity, index) in modelValue.geoMeta.relevantEntities" :key="index" class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 text-xs font-medium flex items-center gap-1">
                     {{ entity }}
                     <button @click="removeEntity(index)" class="hover:text-indigo-900">&times;</button>
                 </span>
                 <input 
                    v-model="entityInput" 
                    @keydown.enter.prevent="addEntity"
                    @keydown.space.prevent="addEntity"
                    type="text" 
                    class="flex-1 min-w-[100px] text-sm outline-none bg-transparent px-1"
                    placeholder="Type & Enter..."
                 />
            </div>
             <p class="text-xs text-gray-500">이 글과 관련된 인물, 회사, 제품, 기술명 등을 입력하세요.</p>
        </div>
        
        <!-- Citations -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Citations (인용/출처)</label>
             <div class="space-y-3">
                 <div v-for="(citation, index) in modelValue.geoMeta.citations" :key="index" class="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <div class="flex-1 space-y-2">
                         <input 
                            v-model="citation.title" 
                            type="text" 
                            class="w-full px-3 py-1.5 border border-gray-200 rounded text-sm bg-white placeholder-gray-400"
                            placeholder="Source Title"
                         />
                         <input 
                            v-model="citation.url" 
                            type="text" 
                            class="w-full px-3 py-1.5 border border-gray-200 rounded text-sm bg-white placeholder-gray-400 font-mono text-xs"
                            placeholder="https://example.com/source"
                         />
                     </div>
                     <button @click="removeCitation(index)" class="self-start text-gray-400 hover:text-red-500 p-1">&times;</button>
                 </div>
                 <button 
                    @click="addCitation" 
                    class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    + Add Citation
                 </button>
             </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: {
        geoMeta: {
            summary: string;
            keyTakeaways: string[];
            relevantEntities: string[];
            citations: { title: string; url: string }[];
        };
    };
}>();

// Initialize arrays if undefined (safety check)
if (!props.modelValue.geoMeta.keyTakeaways) props.modelValue.geoMeta.keyTakeaways = [];
if (!props.modelValue.geoMeta.relevantEntities) props.modelValue.geoMeta.relevantEntities = [];
if (!props.modelValue.geoMeta.citations) props.modelValue.geoMeta.citations = [];

const entityInput = ref('');

const addTakeaway = () => {
    props.modelValue.geoMeta.keyTakeaways.push('');
};

const removeTakeaway = (index: number) => {
    props.modelValue.geoMeta.keyTakeaways.splice(index, 1);
};

const addEntity = () => {
    const val = entityInput.value.trim();
    if (val && !props.modelValue.geoMeta.relevantEntities.includes(val)) {
        props.modelValue.geoMeta.relevantEntities.push(val);
    }
    entityInput.value = '';
};

const removeEntity = (index: number) => {
     props.modelValue.geoMeta.relevantEntities.splice(index, 1);
};

const addCitation = () => {
    props.modelValue.geoMeta.citations.push({ title: '', url: '' });
};

const removeCitation = (index: number) => {
    props.modelValue.geoMeta.citations.splice(index, 1);
};
</script>
