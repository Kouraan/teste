import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })

export const usePrrStore = defineStore('prr', {
  state: () => ({
    globalStats: null,
    paises: [],
    pilares: [],
    milestones: [],
    desembolsos: [],
    indicadoresComuns: [],
    cronologia: [],
    loading: false,
    erro: null,
  }),

  getters: {
    getPaisPorId: (state) => (id) => {
      const pais = state.paises.find((p) => p.id === id)
      if (!pais) return null

      const ms = state.milestones.filter((m) => m.paisId === id)
      const ds = state.desembolsos.filter((d) => d.paisId === id)

      const totalMs = ms.length
      const concluidos = ms.filter((m) => m.estado === 'concluido').length
      const totalDesembolsado = ds.reduce((s, d) => s + d.montante, 0)
      const pctDesembolsado = pais.alocacao > 0 ? (totalDesembolsado / pais.alocacao) * 100 : 0
      const pctMs = totalMs > 0 ? (concluidos / totalMs) * 100 : 0

      // Pedidos de pagamento ordenados
      const ordens = ['1.º', '2.º', '3.º', '4.º', '5.º', '6.º']
      const dsOrdenados = [...ds].sort((a, b) => a.data.localeCompare(b.data))
      const pedidos = dsOrdenados.map((d, i) => ({
        nome: `${ordens[i] ?? i + 1 + '.º'} pagamento`,
        data: d.data.replace('-', '/'),
        montante: `€${d.montante.toFixed(2)}B`,
        milestones: d.milestones ?? '—',
        estado: d.estado ?? 'Desembolsado',
      }))

      const totalPedidos = dsOrdenados.reduce((s, d) => s + d.montante, 0)

      // Milestones por pilar
      const porPilar = {}
      state.pilares.forEach((p) => {
        porPilar[p.id] = { total: 0, concluidos: 0 }
      })
      ms.forEach((m) => {
        if (porPilar[m.pilar]) {
          porPilar[m.pilar].total++
          if (m.estado === 'concluido') porPilar[m.pilar].concluidos++
        }
      })

      return {
        ...pais,
        stats: {
          totalDesembolsado: totalDesembolsado.toFixed(2),
          pctDesembolsado: pctDesembolsado.toFixed(1),
          concluidos,
          totalMs,
          pctMs: pctMs.toFixed(1),
        },
        pedidos,
        totalPedidos: {
          montante: `€${totalPedidos.toFixed(2)}B`,
          milestones: dsOrdenados.reduce((s, d) => s + (d.milestones ?? 0), 0),
        },
        msPorPilar: porPilar,
        desembolsosLinha: dsOrdenados.map((d) => ({ data: d.data, montante: d.montante })),
      }
    },

    estatsMilestones: (state) => {
      const total = state.milestones.length
      const concluidos = state.milestones.filter((m) => m.estado === 'concluido').length
      const emCurso = state.milestones.filter((m) => m.estado === 'em-curso').length
      const pendentes = state.milestones.filter((m) => m.estado === 'pendente').length

      const porPais = {}
      state.milestones.forEach((m) => {
        if (!porPais[m.pais]) porPais[m.pais] = { total: 0, concluidos: 0 }
        porPais[m.pais].total++
        if (m.estado === 'concluido') porPais[m.pais].concluidos++
      })

      const grafico = Object.entries(porPais)
        .map(([nome, s]) => ({ nome, pct: (s.concluidos / s.total) * 100 }))
        .sort((a, b) => b.pct - a.pct)

      return { total, concluidos, emCurso, pendentes, grafico }
    },

    resumoDesembolsos: (state) => {
      const totalAlocado = state.paises.reduce((s, p) => s + p.alocacao, 0)
      const totalDesembolsado = state.desembolsos.reduce((s, d) => s + d.montante, 0)

      const porPais = state.paises
        .map((p) => {
          const ds = state.desembolsos.filter((d) => d.paisId === p.id)
          const desembolsado = ds.reduce((s, d) => s + d.montante, 0)
          return {
            nome: p.nome,
            bandeira: p.bandeira,
            subvencoes: p.subvencoes,
            emprestimos: p.emprestimos,
            total: p.alocacao,
            desembolsado,
            taxa: p.alocacao > 0 ? (desembolsado / p.alocacao) * 100 : 0,
          }
        })
        .sort((a, b) => b.total - a.total)

      return {
        totalAlocado: totalAlocado.toFixed(0),
        totalDesembolsado: totalDesembolsado.toFixed(0),
        taxa: ((totalDesembolsado / totalAlocado) * 100).toFixed(1),
        porPais,
      }
    },
  },

  actions: {
    async carregarTudo() {
      this.loading = true
      try {
        const [gs, pa, pl, ms, ds, ic, cr] = await Promise.all([
          api.get('/globalStats'),
          api.get('/paises'),
          api.get('/pilares'),
          api.get('/milestones'),
          api.get('/desembolsos'),
          api.get('/indicadoresComuns'),
          api.get('/cronologia'),
        ])
        this.globalStats = gs.data
        this.paises = pa.data
        this.pilares = pl.data
        this.milestones = ms.data
        this.desembolsos = ds.data
        this.indicadoresComuns = ic.data
        this.cronologia = cr.data
      } catch (e) {
        this.erro = e.message
      } finally {
        this.loading = false
      }
    },
  },
})
