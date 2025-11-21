const symbolSelect = document.getElementById('symbol');
const ticksDiv = document.getElementById('ticks');
const freqDiv = document.getElementById('frequency');
const predictionDiv = document.getElementById('prediction');

let lastDigits = [];
let ws;

// Function to connect to Deriv WebSocket
function connectWebSocket(symbol) {
    if (ws) ws.close(); // Close previous connection
    ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

    ws.onopen = () => {
        ws.send(JSON.stringify({ ticks: symbol }));
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.tick) {
            const price = data.tick.ask;
            ticksDiv.innerText = `Price: ${price}`;
            updateFrequency(price);
            updatePrediction();
        }
    };
}

// Update last-digit frequency
function updateFrequency(price) {
    const lastDigit = price.toString().slice(-1);
    lastDigits.push(lastDigit);
    if (lastDigits.length > 50) lastDigits.shift(); // keep last 50 digits

    const counts = {};
    lastDigits.forEach(d => counts[d] = (counts[d] || 0) + 1);

    let html = '';
    for (let i = 0; i <= 9; i++) {
        html += `Digit ${i}: ${counts[i] || 0}<br>`;
    }
    freqDiv.innerHTML = html;
}

// Simple Matches prediction
function updatePrediction() {
    if (!lastDigits.length) return;
    const counts = {};
    lastDigits.forEach(d => counts[d] = (counts[d] || 0) + 1);

    // Pick the digit that appeared the least as prediction
    let minCount = Infinity, predictedDigit = '?';
    for (let i = 0; i <= 9; i++) {
        if ((counts[i] || 0) < minCount) {
            minCount = counts[i] || 0;
            predictedDigit = i;
        }
    }
    predictionDiv.innerText = `Predicted next last digit (Matches): ${predictedDigit}`;
}

// Event listener for symbol change
symbolSelect.addEventListener('change', () => {
    connectWebSocket(symbolSelect.value);
});

// Start default
connectWebSocket(symbolSelect.value);
