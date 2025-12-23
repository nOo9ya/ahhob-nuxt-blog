<script setup lang="ts">
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const props = defineProps<{
    data: Array<{ date: string; count: number }>;
}>();

const chartData = computed(() => {
    // 날짜 포맷팅 및 데이터 매핑
    const labels = props.data.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const values = props.data.map(d => d.count);

    return {
        labels,
        datasets: [
            {
                label: 'Visitors',
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo-500 with opacity
                borderColor: '#6366f1', // Indigo-500
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                borderWidth: 2,
                fill: true,
                tension: 0.4, // Smooth curve
                data: values
            }
        ]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false // 심플함을 위해 범례 숨김
        },
        tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: (context: any) => ` ${context.parsed.y} Visitors`
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: { size: 11 },
                color: '#9ca3af'
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: '#f3f4f6',
                borderDash: [4, 4]
            },
            ticks: {
                stepSize: 1, // 방문자 수는 정수여야 함
                font: { size: 11 },
                color: '#9ca3af'
            },
            border: { display: false }
        }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    }
};
</script>

<template>
    <div class="w-full h-full min-h-[300px]">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>
