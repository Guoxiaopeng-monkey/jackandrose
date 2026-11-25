class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const endTimeStr = this.getAttribute('end-time');

    if (!endTimeStr) {
      console.warn('No end time provided for countdown timer');
      return;
    }

    try {
      this.endTime = new Date(endTimeStr).getTime();
      if (isNaN(this.endTime)) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      console.error('Invalid end time format:', error);
      return;
    }

    this.render();
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  disconnectedCallback() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: inherit;
        }
        :host(.pdp-timer){
          margin-bottom:10px;
        }
        :host(.pdp-timer) .time-value,
        :host(.pdp-timer) .time-label,
        :host(.pdp-timer) .separator,
        :host(.pdp-timer) .end-time {
          font-size: 20px;
          font-weight: 500;
        }
        :host(.pdp-timer) .time-unit {
          align-items: center;
        }
        .countdown-timer {
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 30px;
        }
        .time-unit {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.1rem;
        }
        .time-value {
          font-size: 1em;
          font-weight: 500;
          color: #FF6a00;
          transition: transform 0.2s ease;
          line-height: 1;
        }
        .time-value:hover {
          transform: translateY(-2px);
        }
        .time-label {
          font-size: 1em;
          color: #FF6a00;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: 0.05rem;
          line-height: 1;
          font-weight: 500;
        }
        .separator {
          color: #FF6a00;
          font-weight: 500;
          font-size: 1em;
          margin: 0 0.05rem;
        }
        .end-time {
          color: #FF6a00;
          font-weight: 500;
          margin-right: 8px;
        }
        @media screen and (max-width: 768px) {
          .time-value {
            font-size: 0.85em;
          }
          .time-label {
            font-size: 0.85em;
          }
          .separator {
            font-size: 0.85em;
            display:none;
          }
          :host(.pdp-timer) .time-value,
          :host(.pdp-timer) .time-label,
          :host(.pdp-timer) .separator,
          :host(.pdp-timer) .end-time {
            font-size: 16px;
            font-weight: 500;
          }
          .countdown-timer {
            gap: 2px;
          }
          .time-unit {
            gap: 0px;
          }
          .end-time {
            font-size: 0.85em;
          }
        }
      </style>
      <div class="countdown-timer">
      <span class="end-time">Ends in</span>
        <div class="time-unit">
          <span class="time-value" id="days">00</span>
          <span class="time-label">d</span>
        </div>
        <span class="separator">:</span>
        <div class="time-unit">
          <span class="time-value" id="hours">00</span>
          <span class="time-label">h</span>
        </div>
        <span class="separator">:</span>
        <div class="time-unit">
          <span class="time-value" id="minutes">00</span>
          <span class="time-label">m</span>
        </div>
        <span class="separator">:</span>
        <div class="time-unit">
          <span class="time-value" id="seconds">00</span>
          <span class="time-label">s</span>
        </div>
      </div>
    `;
  }

  updateTimer() {
    const now = new Date().getTime();
    const distance = this.endTime - now;

    if (distance < 0) {
      this.style.display = 'none';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.shadowRoot.getElementById('days').textContent = String(days).padStart(2, '0');
    this.shadowRoot.getElementById('hours').textContent = String(hours).padStart(2, '0');
    this.shadowRoot.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    this.shadowRoot.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }
}

// 注册自定义元素
customElements.define('countdown-timer', CountdownTimer); 