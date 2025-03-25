document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("crypto-list");
    const energyData = await fetch("./data/energy-data.json").then(res => res.json());
  
    const cryptos = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
      .then(res => res.json())
      .then(data => data.filter(coin => energyData[coin.id]));
  
    const co2Labels = [];
    const co2Values = [];
  
    cryptos.forEach(coin => {
      container.innerHTML += createCryptoCard(coin, energyData);
      const kwh = energyData[coin.id].kwh_per_txn;
      co2Labels.push(coin.name);
      co2Values.push((kwh * 0.475).toFixed(2));
    });
  
    generateChart(co2Labels, co2Values);
  });
  