// ===== STORAGE & STATE MANAGEMENT =====
const Storage = {
    // Initialize localStorage with default values
    init() {
        if (!localStorage.getItem('oracleStats')) {
            localStorage.setItem('oracleStats', JSON.stringify({
                totalPredictions: 0,
                totalBlackouts: 0,
                survivalTime: 0,
                history: [],
                volume: 50,
                cutInterval: 15
            }));
        }
    },

    // Get all stats
    getStats() {
        return JSON.parse(localStorage.getItem('oracleStats')) || this.getDefault();
    },

    // Update stats
    updateStats(data) {
        const current = this.getStats();
        const updated = { ...current, ...data };
        localStorage.setItem('oracleStats', JSON.stringify(updated));
        return updated;
    },

    // Add to history
    addToHistory(prediction, timestamp = new Date().toLocaleTimeString()) {
        const stats = this.getStats();
        stats.history.unshift({ prediction, timestamp });
        // Keep only last 50 entries
        if (stats.history.length > 50) stats.history.pop();
        localStorage.setItem('oracleStats', JSON.stringify(stats));
    },

    // Clear history
    clearHistory() {
        const stats = this.getStats();
        stats.history = [];
        stats.totalPredictions = 0;
        stats.totalBlackouts = 0;
        stats.survivalTime = 0;
        localStorage.setItem('oracleStats', JSON.stringify(stats));
    },

    getDefault() {
        return {
            totalPredictions: 0,
            totalBlackouts: 0,
            survivalTime: 0,
            history: [],
            volume: 50,
            cutInterval: 15
        };
    }
};

// ===== AUDIO MANAGER =====
const AudioManager = {
    audioCtx: null,
    humOsc: null,
    humGain: null,
    masterGain: null,

    // Initialize audio context
    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.connect(this.audioCtx.destination);
            this.updateVolume(Storage.getStats().volume);
        }
    },

    // Resume audio context (required after user interaction)
    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    // Start continuous 50Hz electrical hum
    startHum() {
        this.init();
        if (!this.humOsc) {
            this.humOsc = this.audioCtx.createOscillator();
            this.humGain = this.audioCtx.createGain();

            this.humOsc.type = 'sawtooth';
            this.humOsc.frequency.setValueAtTime(50, this.audioCtx.currentTime);
            this.humGain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);

            this.humOsc.connect(this.humGain);
            this.humGain.connect(this.masterGain);
            this.humOsc.start();
        }
    },

    // Stop hum sound
    stopHum() {
        if (this.humGain) {
            this.humGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }
    },

    // Circuit trip sound (abrupt cutoff)
    playTripSound() {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } catch (e) {
            console.log('Audio play error:', e);
        }
    },

    // Restoration/recovery sound
    playRestoreSound() {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(65, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log('Audio play error:', e);
        }
    },

    // Crackling effect during blackout
    playCrackle() {
        if (!this.audioCtx) return;
        try {
            const bufferSize = this.audioCtx.sampleRate * 0.2;
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const source = this.audioCtx.createBufferSource();
            const gain = this.audioCtx.createGain();

            source.buffer = buffer;
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.02, this.audioCtx.currentTime + 0.2);

            source.connect(gain);
            gain.connect(this.masterGain);
            source.start();
        } catch (e) {
            console.log('Crackle error:', e);
        }
    },

    // Update master volume
    updateVolume(percentage) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(percentage / 100, this.audioCtx?.currentTime || 0);
        }
    }
};

// ===== MAIN APP STATE & LOGIC =====
const App = {
    isPoweredOff: false,
    cutTimer: null,
    survivalTimer: null,
    survivalSeconds: 0,

    // Prediction options with confidence and colors
    predictions: [
        ["POWER MAY STAY ON", "72% confidence", "var(--green)"],
        ["POSSIBLE POWER CUT", "64% confidence", "var(--yellow)"],
        ["VERY LIKELY NOTHING HAPPENS", "91% confidence", "var(--green)"],
        ["CUT COULD HAPPEN RANDOMLY", "99% confidence", "var(--red)"],
        ["PLEASE CHARGE YOUR PHONE", "100% confidence", "var(--red)"]
    ],

    nextCutMessages: [
        "In approximately 17 minutes.",
        "Right in the middle of a phone call.",
        "Literally any second now.",
        "When your phone hits 2% battery.",
        "Whenever KSEB feels like it.",
        "During your important meeting.",
        "While you're taking a shower.",
        "Just after you charge your phone."
    ],

    // Generate random prediction
    predict() {
        const item = this.predictions[Math.floor(Math.random() * this.predictions.length)];
        const predictionEl = document.getElementById('prediction');
        const confidenceEl = document.getElementById('confidence');
        const nextCutEl = document.getElementById('nextCut');
        const accuracyEl = document.getElementById('accuracy');

        predictionEl.style.color = item[2];
        predictionEl.textContent = item[0];
        confidenceEl.textContent = item[1] + " • scientifically-ish calculated.";
        nextCutEl.textContent = this.nextCutMessages[Math.floor(Math.random() * this.nextCutMessages.length)];
        accuracyEl.textContent = (70 + Math.random() * 29).toFixed(1) + "%*";

        // Update stats
        const stats = Storage.getStats();
        stats.totalPredictions++;
        Storage.updateStats(stats);
        Storage.addToHistory(item[0]);

        UI.updateStats();
        UI.updateHistory();
    },

    // Update voltage display with fluctuations
    updateVoltage() {
        if (this.isPoweredOff) return;
        const v = Math.floor(185 + Math.random() * 55);
        let note = "(Normal)";
        if (v < 205) note = "(Brownout Risk)";
        if (v > 234) note = "(Surge Alert)";
        document.getElementById('voltage').innerHTML = 
            `${v}V <span style="font-size:10px;color:#7ba58c;">${note}</span>`;
    },

    // Kill power unexpectedly
    killPower() {
        if (this.isPoweredOff) return;
        this.isPoweredOff = true;
        clearTimeout(this.cutTimer);
        clearInterval(this.survivalTimer);

        AudioManager.playTripSound();
        AudioManager.stopHum();
        AudioManager.playCrackle();

        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);

        const blackout = document.getElementById('blackout');
        const blackoutMsg = document.getElementById('blackoutMsg');

        blackout.classList.add('dead');
        blackoutMsg.style.display = 'none';

        // Update stats
        const stats = Storage.getStats();
        stats.totalBlackouts++;
        stats.survivalTime += this.survivalSeconds;
        Storage.updateStats(stats);

        // Show message after a few seconds
        setTimeout(() => {
            if (this.isPoweredOff) {
                blackoutMsg.style.display = 'block';
                AudioManager.playCrackle();
            }
        }, 4000);

        UI.updateStats();
    },

    // Restore power
    restorePower() {
        if (!this.isPoweredOff) return;
        this.isPoweredOff = false;

        const blackout = document.getElementById('blackout');
        const app = document.getElementById('app');

        blackout.classList.remove('dead');
        AudioManager.playRestoreSound();
        AudioManager.startHum();

        // Power surge animation
        app.classList.remove('power-surge');
        void app.offsetWidth;
        app.classList.add('power-surge');

        this.survivalSeconds = 0;
        this.predict();
        this.scheduleNextCut();
        this.startSurvivalTimer();
    },

    // Schedule next random power cut
    scheduleNextCut() {
        clearTimeout(this.cutTimer);
        const stats = Storage.getStats();
        const minSeconds = 8;
        const maxSeconds = stats.cutInterval || 15;
        const randomSeconds = minSeconds * 1000 + Math.random() * (maxSeconds - minSeconds) * 1000;

        this.cutTimer = setTimeout(() => this.killPower(), randomSeconds);
    },

    // Track survival time
    startSurvivalTimer() {
        this.survivalSeconds = 0;
        this.survivalTimer = setInterval(() => {
            if (!this.isPoweredOff) {
                this.survivalSeconds++;
                UI.updateSurvivalStreak();
            }
        }, 1000);
    },

    // Initialize app
    initialize() {
        Storage.init();
        AudioManager.init();

        this.predict();
        this.scheduleNextCut();
        this.startSurvivalTimer();

        // Update voltage every 2.5 seconds
        setInterval(() => this.updateVoltage(), 2500);

        // Auto-restore after 20 seconds of blackout (for demo)
        // Uncomment to enable auto-restore
        // setInterval(() => {
        //     if (this.isPoweredOff) this.restorePower();
        // }, 20000);
    }
};

// ===== UI MANAGER =====
const UI = {
    // Update stats display
    updateStats() {
        const stats = Storage.getStats();
        const survivalMins = Math.floor(stats.survivalTime / 60);
        const survivalSecs = stats.survivalTime % 60;

        document.getElementById('survivalStreak').textContent = 
            `${survivalMins}m ${survivalSecs}s`;
        document.getElementById('totalPredictions').textContent = stats.totalPredictions;
        document.getElementById('totalBlackouts').textContent = stats.totalBlackouts;
    },

    // Update survival streak (live)
    updateSurvivalStreak() {
        const secs = App.survivalSeconds;
        const mins = Math.floor(secs / 60);
        const remaining = secs % 60;
        document.getElementById('survivalStreak').textContent = `${mins}m ${remaining}s`;
    },

    // Update history log
    updateHistory() {
        const stats = Storage.getStats();
        const historyLog = document.getElementById('historyLog');

        if (stats.history.length === 0) {
            historyLog.innerHTML = '<div class="history-empty">No predictions yet. Click PREDICT to start.</div>';
            return;
        }

        historyLog.innerHTML = stats.history
            .map(item => `<div class="history-item">
                <strong>${item.prediction}</strong>
                <div style="font-size: 10px; color: #7ba58c; margin-top: 3px;">${item.timestamp}</div>
            </div>`)
            .join('');
    },

    // Open settings modal
    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
    },

    // Close settings modal
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    },

    // Share stats
    shareStats() {
        const stats = Storage.getStats();
        const mins = Math.floor(stats.survivalTime / 60);
        const secs = stats.survivalTime % 60;

        const message = `🔌 KSEB Power Cut Oracle Stats:
💡 Total Predictions: ${stats.totalPredictions}
⚡ Total Blackouts: ${stats.totalBlackouts}
⏱️ Survival Time: ${mins}m ${secs}s

Check your power destiny: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({ title: 'Power Cut Oracle', text: message });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(message).then(() => {
                alert('Stats copied to clipboard!');
            });
        }
    }
};

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Start audio on first interaction
    document.addEventListener('click', () => {
        AudioManager.init();
        AudioManager.resume();
        AudioManager.startHum();
    }, { once: true });

    document.addEventListener('touchstart', () => {
        AudioManager.init();
        AudioManager.resume();
        AudioManager.startHum();
    }, { once: true });

    // Predict button - 25% chance to kill power
    document.getElementById('predictBtn').addEventListener('click', () => {
        if (App.isPoweredOff) return;
        if (Math.random() < 0.25) {
            App.killPower();
        } else {
            App.predict();
        }
    });

    // Blackout click to restore
    document.getElementById('blackout').addEventListener('click', () => {
        App.restorePower();
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        UI.openSettings();
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        UI.closeSettings();
    });

    // Volume slider
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        const volume = e.target.value;
        document.getElementById('volumeValue').textContent = volume + '%';
        AudioManager.updateVolume(volume);
        const stats = Storage.getStats();
        stats.volume = volume;
        Storage.updateStats(stats);
    });

    // Cut interval slider
    document.getElementById('intervalSlider').addEventListener('input', (e) => {
        const interval = e.target.value;
        document.getElementById('intervalValue').textContent = `8-${interval}s`;
        const stats = Storage.getStats();
        stats.cutInterval = interval;
        Storage.updateStats(stats);
    });

    // Clear history button
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
            Storage.clearHistory();
            UI.updateStats();
            UI.updateHistory();
        }
    });

    // Share stats button
    document.getElementById('shareBtn').addEventListener('click', () => {
        UI.shareStats();
    });

    // Close modal when clicking outside
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            UI.closeSettings();
        }
    });

    // Initialize app
    App.initialize();
    UI.updateStats();
    UI.updateHistory();
});
