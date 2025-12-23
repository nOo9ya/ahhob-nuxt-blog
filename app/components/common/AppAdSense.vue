<script setup lang="ts">
/**
 * AppAdSense.vue
 * Google AdSense 광고 단위 컴포넌트
 * 
 * 기능:
 * - 사이트 설정에 따라 광고 활성화 여부 확인
 * - Client ID가 있고 해당 영역(section)이 활성화된 경우 광고 표시
 * - AdSense 스크립트 동적 로드 (app.vue에서 전역 로드하더라도 안전 장치 포함)
 */

const props = defineProps<{
    section: 'header' | 'footer' | 'article_top' | 'article_bottom' | 'sidebar';
    slotId?: string; // 특정 Slot ID 강제 지정 가능
    format?: 'auto' | 'fluid' | 'rectangle';
    layoutKey?: string; // In-feed 등에서 사용
    className?: string;
}>();

// 사이트 설정 가져오기 (공개 API 사용)
const { data: settings } = await useFetch('/api/public/settings', {
    key: 'public-site-settings',
    transform: (res) => res // 그대로 사용
});

const isEnabled = computed(() => {
    if (!settings.value?.adsense_client_id) return false;
    
    // 섹션별 활성화 여부 체크
    const enabledMap = settings.value.adsense_enabled || {};
    return !!enabledMap[props.section as keyof typeof enabledMap];
});

const currentSlotId = computed(() => {
    if (props.slotId) return props.slotId;
    const slotsMap = settings.value?.adsense_slots || {};
    return slotsMap[props.section as keyof typeof slotsMap] || '';
});

const clientId = computed(() => settings.value?.adsense_client_id || '');

const adStyle = computed(() => ({
    display: 'block',
    ...(props.format === 'auto' ? {} : {})
}));

// 라우트 변경 시 강제 리렌더링을 위한 키
const route = useRoute();
const componentKey = computed(() => `${props.section}-${route.fullPath}`);

// 광고 푸시
onMounted(async () => {
    if (isEnabled.value && currentSlotId.value) {
        // DOM이 완전히 렌더링된 후 실행
        await nextTick();
        
        // 약간의 지연을 주어 안전하게 로드 (CSR 이슈 방지)
        setTimeout(() => {
            try {
                // 이미 광고가 로드된 상태인지 체크하는 로직이 필요할 수 있음
                const ads = document.querySelectorAll(`ins[data-ad-slot="${currentSlotId.value}"]`);
                const currentAd = ads[ads.length - 1]; // 현재 컴포넌트의 광고 슬롯
                
                if (currentAd && !currentAd.getAttribute('data-ad-status')) {
                    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                    (window as any).adsbygoogle.push({});
                }
            } catch (e) {
                console.error('AdSense Push Error:', e);
            }
        }, 100);
    }
});
</script>

<template>
    <div 
        v-if="isEnabled && currentSlotId" 
        :class="['adsense-container my-4', className]"
        :key="componentKey"
    >
        <!-- 개발 환경/관리자 모드에서는 플레이스홀더 표시 (선택 사항) -->
        <!-- 여기선 실제 광고 코드 출력 -->
        <ins class="adsbygoogle"
             :style="adStyle"
             :data-ad-client="clientId"
             :data-ad-slot="currentSlotId"
             :data-ad-format="format || 'auto'"
             :data-full-width-responsive="true"></ins>
        
        <div class="text-[10px] text-gray-400 text-center mt-1">Advertisement</div>
    </div>
</template>

<style scoped>
.adsense-container {
    min-height: 100px; /* CLS 방지용 최소 높이 */
    background: rgba(0,0,0,0.02); /* 영역 확인용 약한 배경 */
}
</style>
