// index.js

const baseUrl = "https://tempapi20231112174409.azurewebsites.net/api/measurments";

Vue.createApp({
  data() {
    return {
      measurements: [],
      displayedMeasurements: [],
      latestMeasurement: {},
      itemsPerPage: 5,
      currentPage: 1,
      totalPages: 1,
      startDate: null,
      endDate: null,
      temperatureChartData: [],
      chartOptions: {},
    };
  },
  methods: {
    async helperGetAndShow(url) {
      try {
        const response = await axios.get(url);
        this.measurements = await response.data;

        // Sort measurements array in descending order based on ID
        this.measurements.sort((a, b) => b.id - a.id);

        // Set the latestMeasurement to the first element (highest ID) of the sorted measurements array
        this.latestMeasurement = this.measurements.length > 0 ? this.measurements[0] : {};

        // Convert ISO strings back to Date objects and format without milliseconds
        this.measurements.forEach(measurement => {
          measurement.time = this.formatDateTime(measurement.time);
        });

        // Update totalPages based on the number of items and items per page
        this.totalPages = Math.ceil(this.measurements.length / this.itemsPerPage);

        // Update displayedMeasurements based on the current page
        this.updateDisplayedMeasurements();
      } catch (ex) {
        alert(ex.message);
      }
    },
    async getAllMeasurements() {
      // Reset measurements to its original state
      await this.helperGetAndShow(baseUrl);
    },
    formatDateTime(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour12: false,
      });
    },
    startDataRefresh() {
      this.refreshInterval = setInterval(() => {
        this.getAllMeasurements();
      }, 60000);
    },
    stopDataRefresh() {
      clearInterval(this.refreshInterval);
    },
    updateDisplayedMeasurements() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedMeasurements = this.measurements.slice(startIndex, endIndex);
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updateDisplayedMeasurements();
      }
    },
    firstPage() {
      if (this.currentPage > 1) {
        this.currentPage = 1;
        this.updateDisplayedMeasurements();
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateDisplayedMeasurements();
      }
    },
    lastPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage = this.totalPages;
        this.updateDisplayedMeasurements();
      }
    },
    renderTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        const temperatureData = this.generateTemperatureChartData();
    
        new Chart(ctx, {
            type: 'line',
            data: temperatureData,
        });
    },
    

    generateTemperatureChartData() {
        const labels = this.measurements.map(measurement => measurement.time);
        const data = this.measurements.map(measurement => measurement.temperature);
    
        return {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                borderColor: 'rgb(75, 192, 192)',
                data: data,
            }],
        };
    },
    
  },
  mounted() {
    this.getAllMeasurements().then(() => {
        this.renderTemperatureChart();
        this.generateTemperatureChartData(); // Corrected function name
    });
    this.startDataRefresh();
},

  beforeUnmount() {
    this.stopDataRefresh();
  },
}).mount("#app");
