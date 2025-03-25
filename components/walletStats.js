function estimateWalletCO2(tokens, energyData) {
    let totalCO2 = 0;
    const tokenBreakdown = [];
  
    tokens.forEach(token => {
      const id = token.contract_ticker_symbol.toLowerCase();
      const match = Object.entries(energyData).find(([key]) => key.includes(id));
      if (match) {
        const [name, data] = match;
        const kwh = data.kwh_per_txn || 0;
        const co2 = kwh * 0.475;
        totalCO2 += co2;
        tokenBreakdown.push({
          name: token.contract_name,
          symbol: token.contract_ticker_symbol,
          amount: token.balance / 10 ** token.contract_decimals,
          kwh: kwh,
          co2: co2.toFixed(3),
          mode: data.mode || 'N/A',
          source: data.source
        });
      }
    });
  
    return { totalCO2: totalCO2.toFixed(3), tokens: tokenBreakdown };
  }
  
  function renderWalletStats(stats) {
    const container = document.querySelector("#wallet-output");
    container.innerHTML += `<h3>🌿 Empreinte estimée : <strong>${stats.totalCO2} kg CO₂</strong></h3>`;
  
    stats.tokens.forEach(token => {
      container.innerHTML += `
        <div class="card" style="margin-top:10px">
          <p><strong>${token.name} (${token.symbol})</strong></p>
          <p>🔢 Montant : ${token.amount.toFixed(4)}</p>
          <p>⚙️ Mode : ${token.mode}</p>
          <p>⚡ Consommation estimée : ${token.kwh} kWh</p>
          <p>🌿 Empreinte : ${token.co2} kg CO₂</p>
          <p><a href="${token.source}" target="_blank">🔗 Source</a></p>
        </div>
      `;
    });
  }
  