<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler
} from 'chart.js'
import { Pie, Bar, Line } from 'vue-chartjs'
import ExportButton from '../components/ExportButton.vue'

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Filler
)

const route = useRoute()
const store = useApiStore()
const { loading, milestones, disbursements } = storeToRefs(store)

const countryId = computed(() => route.params.country || 'Portugal')
const country = computed(() => store.getCountryById(countryId.value))

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  store.fetchAll()
})

const doughnutData = computed(() => {
  if (!country.value?.pillar_allocation) return null
  const pa = country.value.pillar_allocation
  const labels = []
  const data = []
  const backgroundColor = []
  
  store.pillars.forEach(p => {
    if (pa[p.id]) {
      labels.push(p.name)
      data.push(pa[p.id])
      backgroundColor.push(p.color)
    }
  })

  return {
    labels,
    datasets: [{
      backgroundColor,
      data,
      borderWidth: 0
    }]
  }
})

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyle: 'rectRounded',
        padding: 16,
        font: { size: 11, family: 'Inter' }
      }
    },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
      }
    }
  }
}

// Chart.js plugin to draw percentage labels on pie slices
const pieLabelsPlugin = {
  id: 'pieLabels',
  afterDatasetDraw(chart) {
    const { ctx, data } = chart
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0)
    chart.getDatasetMeta(0).data.forEach((arc, i) => {
      const value = data.datasets[0].data[i]
      const pct = Math.round((value / total) * 100)
      const angle = (arc.startAngle + arc.endAngle) / 2
      const r = (arc.innerRadius + arc.outerRadius) / 2
      const x = arc.x + Math.cos(angle) * r
      const y = arc.y + Math.sin(angle) * r
      ctx.save()
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      ctx.fillText(`${pct}%`, x, y)
      ctx.restore()
    })
  }
}

ChartJS.register(pieLabelsPlugin)

const pillarBreakdown = computed(() => {
  if (!country.value?.pillar_allocation) return []
  const pa = country.value.pillar_allocation
  return store.pillars
    .filter(p => pa[p.id])
    .map(p => ({
      name: p.name,
      color: p.color,
      pct: pa[p.id],
      share: pa[p.id] + '%',
      amount: '€' + ((pa[p.id] / 100) * country.value.stats.allocation).toFixed(1) + 'B'
    }))
})

// Cumulative Disbursements Line Chart
const lineChartData = computed(() => {
  const countryDisb = disbursements.value
    .filter(d => d.country === countryId.value)
    .sort((a, b) => a.date.localeCompare(b.date))
  
  let cumulative = 0
  return {
    labels: countryDisb.map(d => d.date),
    datasets: [{
      label: 'Cumulative (€B)',
      data: countryDisb.map(d => {
        cumulative += d.amount
        return cumulative
      }),
      borderColor: '#155DFC',
      backgroundColor: 'rgba(21,93,252,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#155DFC',
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  }
})

// Milestones & Targets by Pillar Bar Chart
const milestonesChartData = computed(() => {
  if (!country.value?.pillarGroupedMilestones) return { labels: [], datasets: [] }
  const pg = country.value.pillarGroupedMilestones
  const labels = []
  const totalData = []
  const completedData = []
  const backgroundColors = []
  const completedColors = []

  store.pillars.forEach(p => {
    if (pg[p.id] && pg[p.id].total > 0) {
      labels.push(p.name.split(' ').join('\n'))
      totalData.push(pg[p.id].total)
      completedData.push(pg[p.id].completed)
      backgroundColors.push(p.color + '44')
      completedColors.push(p.color)
    }
  })

  return {
    labels,
    datasets: [
      { label: 'Total', backgroundColor: backgroundColors, data: totalData, borderRadius: 4 },
      { label: 'Completed', backgroundColor: completedColors, data: completedData, borderRadius: 4 }
    ]
  }
})

const paymentRequests  = computed(() => country.value?.paymentRequests  ?? [])
const paymentTotal     = computed(() => country.value?.paymentTotal     ?? { amount: '—', milestones: 0 })
const keyReforms       = computed(() => country.value?.keyReforms       ?? [])
const keyInvestments   = computed(() => country.value?.keyInvestments   ?? [])
const outputIndicators = computed(() => country.value?.outputIndicators ?? [])

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => `€${ctx.parsed.y}B` } }
  },
  scales: {
    y: {
      beginAtZero: false,
      min: 0,
      ticks: { callback: v => `€${v}B`, font: { size: 11 } },
      grid: { color: '#F1F5F9' }
    },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } }
  }
}

const milestonesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, padding: 16, font: { size: 11 } }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { beginAtZero: true, ticks: { stepSize: 5, font: { size: 11 } }, grid: { color: '#F1F5F9' } }
  }
}

// Values in db.json stats are already in billions (e.g. 19.3 = €19.3B)
const formatCurrency = (val) => {
  if (val === null || val === undefined) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return val
  if (n >= 1000) return `€${(n / 1000).toFixed(1)}T`
  if (n >= 1) return `€${n.toFixed(1)}B`
  if (n > 0) return `€${(n * 1000).toFixed(0)}M`
  return '—'
}

const statusClass = (status) => {
  if (status === 'Disbursed') return 'status-disbursed'
  if (status === 'Submitted') return 'status-submitted'
  return 'status-pending'
}

const countryDisbForExport = computed(() => {
  return disbursements.value
    .filter(d => d.country === countryId.value)
    .map(d => ({
      Date: d.date,
      Amount_EB: d.amount,
      Description: d.description || ''
    }))
})

const milestonesByPillarForExport = computed(() => {
  if (!country.value?.pillarGroupedMilestones) return []
  const pg = country.value.pillarGroupedMilestones
  return store.pillars
    .filter(p => pg[p.id] && pg[p.id].total > 0)
    .map(p => ({
      Pillar: p.name,
      Total: pg[p.id].total,
      Completed: pg[p.id].completed,
      Completion_Rate: ((pg[p.id].completed / pg[p.id].total) * 100).toFixed(1) + '%'
    }))
})
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-eu-blue mb-4"></div>
    <p class="text-slate-500">Loading country data...</p>
  </div>

  <div v-else-if="!country" class="text-center py-20">
    <h1 class="text-2xl font-bold text-slate-800">Country not found</h1>
    <RouterLink to="/" class="text-eu-blue hover:underline mt-4 inline-block">Back to Overview</RouterLink>
  </div>

  <div v-else class="country-dashboard">

    <div class="page-content">

      <!-- ── Hero Section ── -->
      <section class="hero-section">
        <div class="hero-inner">
          <div class="hero-flag">
            <span class="flag-emoji">{{ country.flag }}</span>
          </div>
          <div class="hero-info">
            <div class="hero-title-row">
              <h1 class="hero-country">{{ country.name }}</h1>
              <span class="hero-badge">{{ country.badge }}</span>
            </div>
            <p class="hero-plan-name">{{ country.plan_name || 'Plano de Recuperação e Resiliência (PRR)' }}</p>
            <div class="hero-meta">
              <span>Plan approved: <strong>{{ country.plan_approved }}</strong></span>
              <span class="meta-sep">·</span>
              <span>Last updated: <strong>{{ country.last_updated }}</strong></span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Stats Grid ── -->
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Total RRF Allocation</p>
          <p class="stat-value text-eu-blue">{{ formatCurrency(country.stats.allocation) }}</p>
          <p class="stat-sub">{{ country.stats.gdp_share }} of GDP (2023)</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Grants</p>
          <p class="stat-value" style="color:#2D7D46">{{ formatCurrency(country.stats.grants) }}</p>
          <p class="stat-sub">Non-repayable</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Loans</p>
          <p class="stat-value" style="color:#E07B39">{{ formatCurrency(country.stats.loans) }}</p>
          <p class="stat-sub">Repayable support</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Disbursed</p>
          <p class="stat-value" style="color:#6C3D8E">{{ formatCurrency(country.calculatedStats.totalDisbursed) }}</p>
          <p class="stat-sub">{{ country.calculatedStats.disbursedPct }}% of allocation</p>
        </div>
      </div>

      <!-- ── Progress Bars ── -->
      <div class="progress-grid">
        <div class="progress-card">
          <div class="progress-header">
            <span class="progress-title">Disbursement Progress</span>
            <span class="progress-pct blue">{{ country.calculatedStats.disbursedPct }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill blue" :style="{ width: country.calculatedStats.disbursedPct + '%' }"></div>
          </div>
          <div class="progress-footer">
            <span>{{ formatCurrency(country.calculatedStats.totalDisbursed) }} disbursed</span>
            <span>{{ formatCurrency(country.stats.allocation) }} total</span>
          </div>
        </div>
        <div class="progress-card">
          <div class="progress-header">
            <span class="progress-title">Milestones &amp; Targets</span>
            <span class="progress-pct orange">{{ country.calculatedStats.milestonesPct }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill orange" :style="{ width: country.calculatedStats.milestonesPct + '%' }"></div>
          </div>
          <div class="progress-footer">
            <span>{{ country.calculatedStats.milestonesCount }} completed</span>
            <span>Total agreed milestones</span>
          </div>
        </div>
      </div>

      <!-- ── Pillar Quick Summary ── -->
      <div class="pillars-grid">
        <div class="pillar-card green">
          <div class="pillar-icon">🌿</div>
          <div class="pillar-info">
            <p class="pillar-name green">Green Transition</p>
            <p class="pillar-pct">{{ country.pillar_allocation?.green ?? 38 }}%</p>
            <p class="pillar-sub green">Minimum 37% required</p>
          </div>
          <span class="pillar-badge green">✓ Target met</span>
        </div>
        <div class="pillar-card blue">
          <div class="pillar-icon">💻</div>
          <div class="pillar-info">
            <p class="pillar-name blue">Digital Transformation</p>
            <p class="pillar-pct">{{ country.pillar_allocation?.digital ?? 22 }}%</p>
            <p class="pillar-sub blue">Minimum 20% required</p>
          </div>
          <span class="pillar-badge blue">✓ Target met</span>
        </div>
        <div class="pillar-card purple">
          <div class="pillar-icon">👥</div>
          <div class="pillar-info">
            <p class="pillar-name purple">Social Cohesion</p>
            <p class="pillar-pct">{{ country.pillar_allocation?.['social-cohesion'] ?? 27 }}%</p>
            <p class="pillar-sub purple">Minimum 35% required</p>
          </div>
        </div>
      </div>

      <!-- ── About the Recovery Plan ── -->
      <section class="about-section">
        <div class="about-header">
          <span class="about-icon">📄</span>
          <h2 class="section-title">About the Recovery Plan</h2>
        </div>
        <p class="about-body">{{ country.about }}</p>
        <div class="repowereu-banner">
          <span class="repowereu-icon">⚡</span>
          <div>
            <p class="repowereu-title">REPowerEU Chapter Included</p>
            <p class="repowereu-body">{{ country.repowereu }}</p>
          </div>
        </div>
      </section>

      <!-- ── Cumulative Disbursements ── -->
      <div id="country-disbursements-chart" class="full-chart-card bg-white relative">
        <div class="chart-card-header">
          <div class="chart-title-group">
            <span class="chart-title-icon">📈</span>
            <h3 class="chart-title">Cumulative Disbursements (€ Billion)</h3>
          </div>
          <ExportButton targetId="country-disbursements-chart" :data="countryDisbForExport" :filename="'Disbursements_' + country.id" />
        </div>
        <div class="line-chart-wrap">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
        <p class="chart-footnote">* Based on disbursements under assessed payment requests. Planned future disbursements not shown.</p>
      </div>

      <!-- ── Milestones & Targets by Pillar ── -->
      <div id="country-milestones-chart" class="full-chart-card bg-white relative">
        <div class="chart-card-header">
          <div class="chart-title-group">
            <span class="chart-title-icon">🎯</span>
            <h3 class="chart-title">Milestones &amp; Targets by Pillar</h3>
          </div>
          <ExportButton targetId="country-milestones-chart" :data="milestonesByPillarForExport" :filename="'Milestones_' + country.id" />
        </div>
        <div class="bar-chart-wrap">
          <Bar :data="milestonesChartData" :options="milestonesChartOptions" />
        </div>
        <p class="chart-footnote">* Based on milestones assessed under payment requests.</p>
      </div>

      <!-- ── Payment Requests ── -->
      <div class="table-card">
        <div class="chart-card-header">
          <div class="chart-title-group">
            <span class="chart-title-icon">💳</span>
            <h3 class="chart-title">Payment Requests</h3>
          </div>
        </div>
        <table class="payment-table">
          <thead>
            <tr>
              <th>REQUEST</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>MILESTONES</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in paymentRequests" :key="req.name">
              <td class="req-name">{{ req.name }}</td>
              <td class="req-date">{{ req.date }}</td>
              <td class="req-amount">{{ req.amount }}</td>
              <td class="req-milestones">{{ req.milestones }}</td>
              <td><span :class="['status-badge', statusClass(req.status)]">{{ req.status }}</span></td>
            </tr>
            <tr class="total-row">
              <td colspan="2"><strong>Total disbursed</strong></td>
              <td class="req-amount"><strong>{{ paymentTotal.amount }}</strong></td>
              <td colspan="2" class="total-note">{{ paymentTotal.milestones }} milestones assessed</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Key Reforms & Investments ── -->
      <div class="reforms-investments-grid">
        <div class="reforms-card">
          <h3 class="section-title">Key Structural Reforms</h3>
          <ul class="reforms-list">
            <li v-for="reform in keyReforms" :key="reform" class="reform-item">
              <span class="reform-dot blue"></span>
              <span>{{ reform }}</span>
            </li>
          </ul>
        </div>
        <div class="investments-card">
          <h3 class="section-title">Key Investments</h3>
          <ul class="investments-list">
            <li v-for="inv in keyInvestments" :key="inv.desc" class="investment-item">
              <span class="inv-bullet">✦</span>
              <span class="inv-amt">{{ inv.amt }}</span>
              <span class="inv-desc">— {{ inv.desc }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- ── Common Output Indicators ── -->
      <div class="indicators-section">
        <h3 class="section-title">Common Output Indicators</h3>
        <div class="indicators-grid">
          <div v-for="ind in outputIndicators" :key="ind.label" class="indicator-card">
            <div class="ind-icon">{{ ind.icon }}</div>
            <div class="ind-value">{{ ind.value }}</div>
            <div class="ind-unit">{{ ind.unit }}</div>
            <div class="ind-label">{{ ind.label }}</div>
          </div>
        </div>
        <p class="chart-footnote">Common indicators track progress against the RRF Regulation's output targets. Data reported by the Member State as of end-2023.</p>
      </div>

      <p class="page-footnote">Data source: European Commission Recovery and Resilience Scoreboard. Figures are indicative and subject to revision. All monetary amounts in current prices. Last updated: January 2026.</p>

    </div><!-- /page-content -->

  </div><!-- /country-dashboard -->
</template>

<style scoped>
/* ── Reset & Base ── */
.country-dashboard {
  font-family: 'Inter', system-ui, sans-serif;
  background: #F8FAFC;
  min-height: 100vh;
  color: #1E293B;
}

/* ── Page Content ── */
.page-content {
  max-width: 1151px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

/* ── Hero ── */
.hero-section {
  background: linear-gradient(135deg, #003399 0%, #1A56DB 100%);
  padding: 32px 36px;
  margin: 0 0 24px;
}
.hero-inner {
  display: flex;
  align-items: center;
  gap: 20px;
}
.flag-emoji {
  font-size: 42px;
  line-height: 1;
}
.hero-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.hero-country {
  color: #fff;
  font-size: 32px;
  font-weight: 900;
  margin: 0;
}
.hero-badge {
  background: #FFD617;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 5px;
}
.hero-plan-name {
  color: #BEDBFF;
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 6px;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8EC5FF;
  font-size: 13px;
}
.hero-meta strong { color: #fff; }
.meta-sep { opacity: 0.5; }

/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.stat-card {
  padding: 20px 22px;
  border-right: 1px solid #F1F5F9;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card:last-child { border-right: none; }
.stat-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748B;
}
.stat-value {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}
.text-eu-blue { color: #155DFC; }
.stat-sub {
  font-size: 11px;
  color: #94A3B8;
  margin-top: 2px;
}

/* ── Progress Bars ── */
.progress-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.progress-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.progress-title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}
.progress-pct {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}
.progress-pct.blue { color: #155DFC; }
.progress-pct.orange { color: #E17100; }
.progress-track {
  height: 10px;
  background: #F1F5F9;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 1s ease;
}
.progress-fill.blue { background: linear-gradient(90deg, #6C3D8E, #155DFC); }
.progress-fill.orange { background: #E17100; }
.progress-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94A3B8;
}

/* ── Pillars ── */
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.pillar-card {
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}
.pillar-card.green { background: #F0FAF2; border: 1px solid #D1F0D9; }
.pillar-card.blue  { background: #EEF4FF; border: 1px solid #D1E1FF; }
.pillar-card.purple{ background: #F9F5FF; border: 1px solid #E9D7FE; }
.pillar-icon { font-size: 26px; margin-top: 2px; }
.pillar-info { flex: 1; }
.pillar-name { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }
.pillar-name.green  { color: #2D7D46; }
.pillar-name.blue   { color: #155DFC; }
.pillar-name.purple { color: #9810FA; }
.pillar-pct { font-size: 28px; font-weight: 900; color: #1E293B; line-height: 1; }
.pillar-sub { font-size: 10px; margin-top: 4px; }
.pillar-sub.green  { color: #2D7D46; }
.pillar-sub.blue   { color: #155DFC; }
.pillar-sub.purple { color: #9810FA; }
.pillar-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.pillar-badge.green  { background: #fff; border: 1px solid #D1F0D9; color: #2D7D46; }
.pillar-badge.blue   { background: #fff; border: 1px solid #D1E1FF; color: #155DFC; }

/* ── About Section ── */
.about-section {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.about-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.about-icon { font-size: 20px; }
.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1E293B;
  margin: 0;
}
.about-body {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.7;
  text-align: justify;
  margin-bottom: 18px;
}
.repowereu-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #FFFBEA;
  border: 1px solid #FEF0C7;
  border-radius: 10px;
  padding: 14px 18px;
}
.repowereu-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.repowereu-title { font-weight: 700; font-size: 13px; color: #B54708; margin-bottom: 3px; }
.repowereu-body  { font-size: 12px; color: #B54708; }

/* ── Charts Row ── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.chart-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}
.chart-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-title-icon { font-size: 16px; }
.doughnut-wrap {
  height: 280px;
  position: relative;
}

/* Pillar Breakdown Table */
.breakdown-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.breakdown-row {
  display: grid;
  grid-template-columns: 10px 160px 1fr 60px 40px;
  align-items: center;
  gap: 10px;
}
.breakdown-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.breakdown-name {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.breakdown-bar-wrap {
  height: 6px;
  background: #F1F5F9;
  border-radius: 99px;
  overflow: hidden;
}
.breakdown-bar {
  height: 100%;
  border-radius: 99px;
  transition: width 1s ease;
}
.breakdown-amount {
  font-size: 12px;
  font-weight: 700;
  color: #1E293B;
  text-align: right;
}
.breakdown-share {
  font-size: 12px;
  font-weight: 800;
  text-align: right;
}

/* ── Full Width Charts ── */
.full-chart-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.line-chart-wrap {
  height: 240px;
  position: relative;
  margin-bottom: 8px;
}
.bar-chart-wrap {
  height: 260px;
  position: relative;
  margin-bottom: 8px;
}
.chart-footnote {
  font-size: 11px;
  color: #94A3B8;
  margin: 0;
  font-style: italic;
}
.page-footnote {
  font-size: 11px;
  color: #94A3B8;
  font-style: italic;
  text-align: center;
  padding: 16px 0 0;
}

/* ── Payment Table ── */
.table-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}
.payment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.payment-table thead tr {
  border-bottom: 2px solid #F1F5F9;
}
.payment-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 10px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.payment-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #F8FAFC;
  color: #334155;
}
.req-name { font-weight: 500; color: #1E293B; }
.req-date { color: #64748B; }
.req-amount { font-weight: 700; color: #155DFC; }
.req-milestones { text-align: center; }
.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 5px;
}
.status-disbursed { background: #F0FAF2; color: #2D7D46; border: 1px solid #D1F0D9; }
.status-submitted  { background: #EEF4FF; color: #155DFC; border: 1px solid #D1E1FF; }
.status-pending    { background: #F8FAFC; color: #64748B; border: 1px solid #E2E8F0; }
.total-row td { font-weight: 600; background: #F8FAFC; border-top: 2px solid #E2E8F0; }
.total-note { color: #94A3B8; font-size: 11px; }

/* ── Key Reforms & Investments ── */
.reforms-investments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.reforms-card, .investments-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.reforms-card .section-title,
.investments-card .section-title {
  margin-bottom: 16px;
}
.reforms-list, .investments-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.reform-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #475569;
}
.reform-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.reform-dot.blue { background: #155DFC; }
.investment-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12.5px;
  color: #475569;
}
.inv-bullet { color: #E17100; font-size: 10px; margin-top: 3px; flex-shrink: 0; }
.inv-amt { font-weight: 700; color: #1E293B; white-space: nowrap; }
.inv-desc { color: #475569; }

/* ── Output Indicators ── */
.indicators-section {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.indicators-section .section-title { margin-bottom: 20px; }
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}
.indicator-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.ind-icon { font-size: 22px; margin-bottom: 6px; }
.ind-value { font-size: 24px; font-weight: 900; color: #1E293B; line-height: 1; }
.ind-unit  { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.ind-label { font-size: 12px; color: #64748B; margin-top: 4px; }

/* ── Official Resources ── */
.resources-section {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.resources-section .section-title { margin-bottom: 16px; }
.resources-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 12px;
}
.resource-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.resource-card:hover { border-color: #155DFC; box-shadow: 0 2px 8px rgba(21,93,252,0.08); }
.resource-icon { font-size: 22px; flex-shrink: 0; }
.resource-title { font-size: 13px; font-weight: 700; color: #155DFC; margin-bottom: 3px; }
.resource-desc  { font-size: 12px; color: #64748B; }


</style>
