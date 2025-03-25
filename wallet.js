async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        document.querySelector('#wallet-output').innerHTML = `<p>✅ Connecté : ${address}</p>`;
        getWalletData(address);
      } catch (err) {
        alert("Erreur de connexion.");
      }
    } else {
      alert("MetaMask requis !");
    }
  }
  
  async function getWalletData(address) {
    const res = await fetch(`https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?key=ckey_docs`);
    const json = await res.json();
    const tokens = json.data.items;
    const energyData = await fetch("data/energy-data.json").then(r => r.json());
    const stats = estimateWalletCO2(tokens, energyData);
    renderWalletStats(stats);
  }
  