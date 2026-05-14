<script>
import { Line, Bar, Pie } from 'vue-chartjs';

export default {
  components: {
    Line,
    Bar,
    Pie
  },
  data() {
    return {
      lineData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [10, 20, 15, 30, 25, 40],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
        ],
      },
      lineOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
      barData: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: 'Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      },
      barOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
      pieData: {
        labels: ['Chrome', 'Firefox', 'Edge'],
        datasets: [
          {
            label: 'Browser Share',
            data: [65, 20, 15],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 206, 86, 0.7)',
            ],
          },
        ],
      },
      pieOptions: {
        responsive: true,
        maintainAspectRatio: false,
      }
    }
  }
}
</script>

<template>
  <div>
    <h2>Line Chart</h2>
    <Line :data="lineData" :options="lineOptions" />

    <h2>Bar Chart</h2>
    <Bar :data="barData" :options="barOptions" />

    <h2>Pie Chart</h2>
    <Pie :data="pieData" :options="pieOptions" />
  </div>
</template>

<style scoped>
h2 {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

canvas {
  max-height: 300px;
}
</style>
