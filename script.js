// Init AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    easing: "ease-in-out",
  });
  
  // Dark Mode
  function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark");
    localStorage.setItem("darkMode", body.classList.contains("dark") ? "enabled" : "disabled");
  }
  
  function applyDarkModePreference() {
    const mode = localStorage.getItem("darkMode");
    if (mode === "enabled") {
      document.body.classList.add("dark");
    }
  }
  
  // Notification toast
  function showToast(message, success = true) {
    const toast = document.createElement("div");
    toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);
  
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  
  // Affiche un popup explicatif
  function showCarbonPopup() {
    const popup = document.createElement("div");
    popup.className = "carbon-popup";
    popup.innerHTML = `
      <div class="popup-content">
        <h2>🌿 Comment est calculée l'empreinte carbone ?</h2>
        <p>L'empreinte carbone est estimée en multipliant la consommation moyenne d'énergie par transaction (kWh) par l'intensité carbone (~0.475 kg CO₂/kWh).</p>
        <p>Exemple : 700 kWh × 0.475 kg/kWh = 332.5 kg CO₂</p>
        <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Fermer</button>
      </div>
    `;
    document.body.appendChild(popup);
  }
  
  // Charge les données globales
  async function loadCryptoData() {
    const cryptoGrid = document.getElementById("crypto-grid");
    cryptoGrid.innerHTML = '<p>Chargement en cours...</p>';
    const energyData = await fetch("./data/energy-data.json").then(r => r.json());
  
    const cryptos = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
      .then(res => res.json())
      .then(data => data.filter(coin => energyData[coin.id]));
  
    cryptoGrid.innerHTML = ''; // clear
  
    cryptos.forEach(coin => {
      const info = energyData[coin.id];
      const kwh = info.kwh_per_txn;
      const co2 = (kwh * 0.475).toFixed(2);
  
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
        <p>Prix : $${coin.current_price.toLocaleString()}</p>
        <p>Mode : ${info.mode}
          <span class="tooltip" data-tooltip="Mechanism of consensus: ${info.mode === 'PoW' ? 'Proof of Work (énergivore)' : 'Proof of Stake (eco-friendly)'}">ⓘ</span>
          <small>(<a href="${info.source}" target="_blank">source</a>)</small>
        </p>
        <p>Conso/txn : ${kwh} kWh
          <span class="tooltip" data-tooltip="Conso moyenne estimée par transaction">ⓘ</span>
        </p>
        <p>Empreinte CO₂ : <strong>${co2} kg</strong>
          <span class="tooltip" data-tooltip="${kwh} × 0.475 = ${co2} kg CO₂">ⓘ</span>
          <button onclick="showCarbonPopup()" class="btn-primary" style="margin-left: 0.5rem; font-size: 0.8rem;">?</button>
        </p>
      `;
      cryptoGrid.appendChild(card);
    });
  }
  
  // Connexion MetaMask + analyse
  async function connectWallet() {
    const btn = document.querySelector('.btn-connect');
    btn.textContent = "⏳ Connexion...";
    btn.disabled = true;
  
    try {
      if (!window.ethereum) throw new Error("MetaMask requis");
  
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      document.getElementById("wallet-output").innerHTML = `<p>✅ Connecté : ${address}</p>`;
  
      const res = await fetch(`https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?key=ckey_docs`);
      const json = await res.json();
      const tokens = json.data.items;
      const energyData = await fetch("./data/energy-data.json").then(r => r.json());
  
      let totalCO2 = 0;
      let html = '<div class="grid">';
      const labels = [];
      const values = [];
  
      tokens.forEach(token => {
        const id = token.contract_ticker_symbol.toLowerCase();
        const match = Object.entries(energyData).find(([key]) => key.includes(id));
        if (match) {
          const [name, data] = match;
          const kwh = data.kwh_per_txn;
          const co2 = (kwh * 0.475).toFixed(3);
          totalCO2 += parseFloat(co2);
  
          labels.push(token.contract_ticker_symbol);
          values.push(parseFloat(co2));
  
          html += `
            <div class="card">
              <p><strong>${token.contract_name} (${token.contract_ticker_symbol})</strong></p>
              <p>Quantité : ${(token.balance / 10 ** token.contract_decimals).toFixed(4)}</p>
              <p>Mode : ${data.mode}</p>
              <p>Conso estimée : ${kwh} kWh</p>
              <p>Empreinte CO₂ : ${co2} kg</p>
              <p><a href="${data.source}" target="_blank">Source</a></p>
            </div>`;
        }
      });
  
      html += '</div>';
      html += `<h3>Total estimé : <strong>${totalCO2.toFixed(2)} kg CO₂</strong></h3>`;
      document.getElementById("wallet-output").innerHTML += html;
  
      const ctx = document.getElementById('walletChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#10b981', '#6ee7b7', '#065f46', '#34d399', '#059669']
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
  
      showToast("🔗 Wallet connecté avec succès !");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Erreur inconnue", false);
    } finally {
      btn.textContent = "🔌 Connect Wallet";
      btn.disabled = false;
    }
  }
  
  // Load everything on start
  window.addEventListener("DOMContentLoaded", () => {
    applyDarkModePreference();
    loadCryptoData();
    // Menu burger toggle
document.getElementById('burger').addEventListener('click', () => {
    document.getElementById('navbar-links').classList.toggle('show');
  });
  
  });
  