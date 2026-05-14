import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

export const useApiStore = defineStore('api', {
  state: () => ({
    pillars: [],
    countries: [],
    milestones: [],
    disbursements: [],
    indicators: [],
    timelineEvents: [],
    globalStats: null,
    loading: false,
    error: null
  }),
  getters: {
    getCountryById: (state) => (id) => {
      const country = state.countries.find(c => c.id === id)
      if (!country) return null

      // Calculate dynamic stats from raw data
      const countryMilestones = state.milestones.filter(m => m.country === id)
      const countryDisbursements = state.disbursements.filter(d => d.country === id)

      const totalMilestones = countryMilestones.length
      const completedMilestones = countryMilestones.filter(m => m.status === 'completed').length
      const milestonesPct = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

      const totalDisbursed = countryDisbursements.reduce((sum, d) => sum + d.amount, 0)
      const disbursedPct = country.stats.allocation > 0 ? (totalDisbursed / country.stats.allocation) * 100 : 0

      // Group milestones by pillar for chart
      const pillarCounts = {}
      state.pillars.forEach(p => { pillarCounts[p.id] = { total: 0, completed: 0 } })
      countryMilestones.forEach(m => {
        if (pillarCounts[m.pillar]) {
          pillarCounts[m.pillar].total++
          if (m.status === 'completed') pillarCounts[m.pillar].completed++
        }
      })

      // Build payment requests from actual disbursements (single source of truth)
      const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']
      const sortedDisb = [...countryDisbursements].sort((a, b) => a.date.localeCompare(b.date))
      const paymentRequests = sortedDisb.map((d, i) => ({
        name: `${ordinals[i] ?? (i + 1) + 'th'} payment`,
        date: d.date.replace('-', ' / '),
        amount: `€${d.amount.toFixed(2)}B`,
        milestones: d.milestones ?? '—',
        status: d.status ?? 'Disbursed'
      }))

      const paymentTotalAmount = sortedDisb.reduce((sum, d) => sum + d.amount, 0)
      const paymentTotal = {
        amount: `€${paymentTotalAmount.toFixed(2)}B`,
        milestones: sortedDisb.reduce((sum, d) => sum + (d.milestones ?? 0), 0)
      }

      return {
        ...country,
        calculatedStats: {
          milestonesPct: milestonesPct.toFixed(1),
          milestonesCount: `${completedMilestones}/${totalMilestones}`,
          totalDisbursed: totalDisbursed.toFixed(2),
          disbursedPct: disbursedPct.toFixed(1)
        },
        pillarGroupedMilestones: pillarCounts,
        paymentRequests,
        paymentTotal
      }
    },
    getMilestonesStats: (state) => {
      const total = state.milestones.length
      const completed = state.milestones.filter(m => m.status === 'completed').length
      const inProgress = state.milestones.filter(m => m.status === 'in-progress').length
      const pending = state.milestones.filter(m => m.status === 'pending').length

      // Group by country for chart
      const countryStats = {}
      state.milestones.forEach(m => {
        if (!countryStats[m.country]) countryStats[m.country] = { total: 0, completed: 0 }
        countryStats[m.country].total++
        if (m.status === 'completed') countryStats[m.country].completed++
      })

      const chartData = Object.entries(countryStats).map(([name, stats]) => ({
        name,
        pct: (stats.completed / stats.total) * 100
      })).sort((a, b) => b.pct - a.pct)

      return {
        total, completed, inProgress, pending,
        chartLabels: chartData.map(d => d.name),
        chartValues: chartData.map(d => d.pct)
      }
    },
    getDisbursementsSummary: (state) => {
      const totalAllowed = state.countries.reduce((sum, c) => sum + c.stats.allocation, 0)
      const totalDisbursed = state.disbursements.reduce((sum, d) => sum + d.amount, 0)
      
      const countryData = state.countries.map(c => {
        const countryDisb = state.disbursements.filter(d => d.country === c.id)
        const disbursed = countryDisb.reduce((sum, d) => sum + d.amount, 0)
        return {
          country: c.name,
          flag: c.flag,
          grants: c.stats.grants,
          loans: c.stats.loans,
          total: c.stats.allocation,
          disbursed: disbursed,
          rate: (disbursed / c.stats.allocation) * 100
        }
      }).sort((a, b) => b.total - a.total)

      return {
        totalAllowed: totalAllowed.toFixed(0),
        totalDisbursed: totalDisbursed.toFixed(0),
        rate: ((totalDisbursed / totalAllowed) * 100).toFixed(1),
        countries: countryData
      }
    }
  },
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [p, c, m, d, i, g, t] = await Promise.all([
          api.get('/pillars'),
          api.get('/countries'),
          api.get('/milestones'),
          api.get('/disbursements'),
          api.get('/indicators'),
          api.get('/globalStats'),
          api.get('/timelineEvents')
        ])
        this.pillars = p.data
        this.countries = c.data
        this.milestones = m.data
        this.disbursements = d.data
        this.indicators = i.data
        this.globalStats = g.data
        this.timelineEvents = t.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async fetchCountries() {
      this.loading = true
      try {
        const response = await api.get('/countries')
        this.countries = response.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async fetchPillars() {
      this.loading = true
      try {
        const response = await api.get('/pillars')
        this.pillars = response.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async fetchMilestones() {
      try {
        const response = await api.get('/milestones')
        this.milestones = response.data
      } catch (e) {
        this.error = e.message
      }
    },
    async fetchDisbursements() {
      try {
        const response = await api.get('/disbursements')
        this.disbursements = response.data
      } catch (e) {
        this.error = e.message
      }
    },
    async fetchIndicators() {
      try {
        const response = await api.get('/indicators')
        this.indicators = response.data
      } catch (e) {
        this.error = e.message
      }
    },
    async fetchGlobalStats() {
      try {
        const response = await api.get('/globalStats')
        this.globalStats = response.data
      } catch (e) {
        this.error = e.message
      }
    },
    async fetchTimeline() {
      try {
        const response = await api.get('/timelineEvents')
        this.timelineEvents = response.data
      } catch (e) {
        this.error = e.message
      }
    }
  }
})
