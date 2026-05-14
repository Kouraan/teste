<script>
export default {
  name: "MapView",
  data() {
    return {
      map: null,
      marker: null,
      polygon: null,
    };
  },
  mounted() {
    if (window.google && window.google.maps) {
      this.initMap();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          this.initMap();
        }
      }, 100);
    }
  },
  beforeUnmount() {
    this.map = null;
    this.marker = null;
    this.polygon = null;
  },
  methods: {
    initMap() {
      const center = { lat: 38.7223, lng: -9.1393 }; // Lisbon

      // Create map
      this.map = new window.google.maps.Map(this.$refs.mapContainer, {
        center,
        zoom: 13,
        mapTypeId: "roadmap",
      });

      // --- Marker (pin) ---
      this.marker = new window.google.maps.Marker({
        position: center,
        map: this.map,
        title: "Hello from Lisbon!",
      });

      const markerInfo = new window.google.maps.InfoWindow({
        content: "<strong>Hello from Lisbon!</strong>",
      });
      markerInfo.open(this.map, this.marker);

      // --- Polygon (area layer) ---
      const polygonCoords = [
        { lat: 38.725, lng: -9.15 },
        { lat: 38.725, lng: -9.13 },
        { lat: 38.715, lng: -9.13 },
        { lat: 38.715, lng: -9.15 },
      ];

      this.polygon = new window.google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });

      this.polygon.setMap(this.map);

      const polygonInfo = new window.google.maps.InfoWindow({
        content: "Example area layer",
        position: polygonCoords[0],
      });
      polygonInfo.open(this.map);
    },
  },
};
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 400px;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
