function createCryptoCard(coin, energyData) {
    const kwh = energyData[coin.id]?.kwh_per_txn || 0;
    const intensity = 0.475;
    const co2 = (kwh * intensity).toFixed(4); // en kg CO₂

  
    return `
      <div class="card">
        <h2>${coin.name} (${coin.symbol.toUpperCase()})</h2>
        <p>💰 Prix : $${coin.current_price.toLocaleString()}</p>
        <p>⚡ Consommation estimée : ${kwh} kWh</p>
        <p>🌿 Empreinte CO₂ : <strong>${co2} kg</strong>/txn</p>
      </div>
    `;
  }
  