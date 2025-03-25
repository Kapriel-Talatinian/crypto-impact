function generateChart(cryptoNames, co2Values) {
    const ctx = document.getElementById('co2Chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cryptoNames,
        datasets: [{
          label: 'Empreinte CO₂ (kg/transaction)',
          data: co2Values,
          backgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  