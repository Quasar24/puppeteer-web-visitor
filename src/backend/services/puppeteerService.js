const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const EventEmitter = require('events');

puppeteer.use(StealthPlugin());

class PuppeteerService extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isPaused = false;
    this.shouldStop = false;
    this.currentVisit = 0;
    this.totalVisits = 0;
    this.startTime = null;
    this.stats = {
      successful: 0,
      errors: 0,
      totalTime: 0
    };
    this.config = {
      url: 'https://landing-dukkecord.andres-duque.com/',
      visits: 50,
      monitor1Width: 1920,
      monitor2PositionX: 1920 + 100,
      monitor2PositionY: 50,
      minDelay: 3000,
      maxDelay: 7000,
      minWaitBetween: 1000,
      maxWaitBetween: 3000,
      headless: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  getConfig() {
    return { ...this.config };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentVisit: this.currentVisit,
      totalVisits: this.totalVisits,
      progress: this.totalVisits > 0 ? (this.currentVisit / this.totalVisits) * 100 : 0,
      stats: { ...this.stats },
      estimatedTimeRemaining: this.calculateEstimatedTime(),
      startTime: this.startTime
    };
  }

  calculateEstimatedTime() {
    if (!this.isRunning || this.currentVisit === 0) return null;
    
    const elapsed = Date.now() - this.startTime;
    const avgTimePerVisit = elapsed / this.currentVisit;
    const remaining = this.totalVisits - this.currentVisit;
    return Math.round((remaining * avgTimePerVisit) / 1000); // seconds
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    if (this.isRunning) {
      throw new Error('Service is already running');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this.currentVisit = 0;
    this.totalVisits = this.config.visits;
    this.startTime = Date.now();
    this.stats = { successful: 0, errors: 0, totalTime: 0 };

    this.emit('started', this.getStatus());
    this.emit('log', { type: 'info', message: `Starting ${this.totalVisits} visits to ${this.config.url}`, timestamp: new Date() });

    try {
      for (let i = 1; i <= this.totalVisits; i++) {
        if (this.shouldStop) break;
        
        // Wait if paused
        while (this.isPaused && !this.shouldStop) {
          await this.delay(100);
        }
        
        if (this.shouldStop) break;

        this.currentVisit = i;
        this.emit('visitStarted', { visit: i, status: this.getStatus() });
        
        const visitStartTime = Date.now();
        await this.performVisit(i);
        const visitTime = Date.now() - visitStartTime;
        this.stats.totalTime += visitTime;

        // Wait between visits
        if (i < this.totalVisits && !this.shouldStop) {
          const waitTime = Math.random() * (this.config.maxWaitBetween - this.config.minWaitBetween) + this.config.minWaitBetween;
          this.emit('log', { type: 'info', message: `Waiting ${Math.round(waitTime)}ms before next visit`, timestamp: new Date() });
          await this.delay(waitTime);
        }
      }
    } catch (error) {
      this.emit('error', error);
      this.emit('log', { type: 'error', message: `Service error: ${error.message}`, timestamp: new Date() });
    } finally {
      this.isRunning = false;
      this.emit('completed', this.getStatus());
      this.emit('log', { type: 'info', message: 'Automation completed', timestamp: new Date() });
    }
  }

  async performVisit(visitNumber) {
    let browser;
    try {
      this.emit('log', { type: 'info', message: `🧭 Starting visit ${visitNumber}`, timestamp: new Date() });
      
      browser = await puppeteer.launch({
        headless: this.config.headless,
        defaultViewport: null,
        args: [
          '--window-size=1280,800',
          `--window-position=${this.config.monitor2PositionX},${this.config.monitor2PositionY}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      
      await page.goto(this.config.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Scroll automático
      await page.evaluate(() => {
        return new Promise(resolve => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight/10) {
              clearInterval(timer);
              resolve();
            }
          }, 300);
        });
      });

      const waitTime = Math.random() * (this.config.maxDelay - this.config.minDelay) + this.config.minDelay;
      await this.delay(waitTime);
      
      this.stats.successful++;
      this.emit('visitCompleted', { visit: visitNumber, success: true, status: this.getStatus() });
      this.emit('log', { type: 'success', message: `✅ Visit ${visitNumber} completed successfully`, timestamp: new Date() });
      
    } catch (error) {
      this.stats.errors++;
      this.emit('visitCompleted', { visit: visitNumber, success: false, error: error.message, status: this.getStatus() });
      this.emit('log', { type: 'error', message: `❌ Error in visit ${visitNumber}: ${error.message}`, timestamp: new Date() });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  pause() {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }
    this.isPaused = true;
    this.emit('paused', this.getStatus());
    this.emit('log', { type: 'info', message: 'Automation paused', timestamp: new Date() });
  }

  resume() {
    if (!this.isRunning || !this.isPaused) {
      throw new Error('Service is not paused');
    }
    this.isPaused = false;
    this.emit('resumed', this.getStatus());
    this.emit('log', { type: 'info', message: 'Automation resumed', timestamp: new Date() });
  }

  stop() {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }
    this.shouldStop = true;
    this.isPaused = false;
    this.emit('stopped', this.getStatus());
    this.emit('log', { type: 'info', message: 'Automation stopped by user', timestamp: new Date() });
  }

  reset() {
    if (this.isRunning) {
      throw new Error('Cannot reset while service is running');
    }
    this.currentVisit = 0;
    this.totalVisits = 0;
    this.startTime = null;
    this.stats = { successful: 0, errors: 0, totalTime: 0 };
    this.emit('reset', this.getStatus());
    this.emit('log', { type: 'info', message: 'Service reset', timestamp: new Date() });
  }
}

module.exports = PuppeteerService;