# ThinkTwice with Pausito - Project Description

## Overview

ThinkTwice is a Chrome extension that empowers users to make conscious purchasing decisions by creating a deliberate pause before completing online purchases. The extension detects checkout processes and intervenes with a 30-second reflection period, helping users combat impulse buying and manipulative e-commerce design patterns.

## Problem Statement

84% of Chilean consumers have made impulsive online purchases they later regret. E-commerce platforms employ psychological manipulation techniques known as "dark patterns" that exploit cognitive biases:

- False urgency timers
- Artificial scarcity ("Only 2 left!")
- Frictionless purchasing (one-click checkout)
- Persistent notifications exploiting FOMO

These practices lead to debt, financial stress, regret, and unhealthy consumption cycles that impact future generations.

## Solution

ThinkTwice is an AI-powered Chrome extension that:

1. **Detects automatically** when users are about to complete a purchase
2. **Creates a pause** with a 30-second mandatory reflection period
3. **Analyzes patterns** using AI to personalize interventions
4. **Empowers decisions** - doesn't block purchases, but ensures they're conscious choices

## How It Works

```
User navigates e-commerce sites (MercadoLibre, Amazon, Falabella, etc.)
↓
Clicks "Buy" or reaches checkout page
↓
ThinkTwice detects payment page and presents modal
↓
30-second pause + Pausito character + reflection prompts
↓
AI analyzes purchase history and provides personalized context
↓
User decides: continue or cancel purchase
```

## Technical Architecture

### Frontend - Chrome Extension (Manifest V3)

**Key Components:**
- `content.js` - Real-time checkout detector using 4 combined heuristics:
  - URL pattern analysis (`/checkout`, `/cart`, `/payment`)
  - Form field detection (credit card, CVV, billing address)
  - Text content analysis ("Complete Purchase", "Pay Now")
  - HTML selector matching for payment elements

- `background.js` - Service worker coordinator
- `popup.js` - User interface and settings management
- Detection precision: >70% confidence threshold for intervention

**Features:**
- Manifest V3 compliant
- Real-time detection using MutationObserver
- Supports dynamic single-page applications
- CORS-enabled API integration
- Persistent user settings

### Backend - AWS Lambda (Serverless)

**Technology Stack:**
- Node.js 20.x with TypeScript
- AWS Lambda for serverless compute
- API Gateway for REST endpoints
- CloudWatch for monitoring and logging
- Infrastructure as Code (AWS SAM)

**Capabilities:**
- Purchase pattern analysis
- AI-powered personalization
- Auto-scaling serverless architecture
- RESTful API for extension communication

### CI/CD Pipeline

- GitHub Actions for automated deployment
- Continuous integration and testing
- Automated releases to GitHub

## Key Features

### Smart Detection
- Multi-heuristic checkout page detection
- Support for major e-commerce platforms
- Dynamic page monitoring for SPA frameworks

### Personalized Intervention
- AI-driven analysis of purchase context
- User behavior pattern recognition
- Customized reflection prompts

### User Experience
- 30-second mandatory pause with Pausito character
- Toggle on/off from extension popup
- Non-blocking - users maintain full control

## Impact

### Individual Impact
- Estimated savings: $100,000 CLP/month per user
- Reduced financial stress and post-purchase regret
- Improved impulse control and healthy consumption habits

### Social Impact
- Combats dark patterns and psychological manipulation
- Passive financial education during shopping
- Breaks debt cycles affecting future generations

### Success Metrics
- Percentage of purchases canceled after intervention
- Accumulated savings for active users
- User satisfaction and retention rates

## Technology Stack

**Frontend:**
- Vanilla JavaScript (Chrome Extension)
- Manifest V3
- Chrome Storage API
- MutationObserver API

**Backend:**
- TypeScript
- Node.js 20.x
- AWS Lambda
- AWS SAM (Serverless Application Model)
- API Gateway

**Infrastructure:**
- AWS Cloud
- GitHub Actions (CI/CD)
- CloudWatch (Monitoring)

## Installation & Usage

### For End Users

1. Download the extension from [GitHub Releases](https://github.com/platanus-hack/platanus-hack-25-team-11/releases/latest)
2. Extract the zip file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked extension"
6. Select the extracted folder
7. Shop normally - ThinkTwice will intervene automatically at checkout

### For Developers

**Chrome Extension:**
```bash
git clone https://github.com/platanus-hack/platanus-hack-25-team-11.git
cd platanus-hack-25-team-11/chrome-extension
# Load unpacked extension in Chrome
```

**Backend:**
```bash
cd think-twice
npm install
npm run build
sam build
sam deploy --guided
```

## Project Structure

```
platanus-hack-25-team-11/
├── chrome-extension/          # Chrome Extension (Manifest V3)
│   ├── manifest.json         # Extension configuration
│   ├── content.js            # Checkout detector
│   ├── background.js         # Service worker
│   ├── popup.html/js         # User interface
│   ├── icons/                # Extension icons
│   └── videos/               # Pausito character videos
│
├── think-twice/              # AWS Lambda Backend
│   ├── src/index.ts         # Lambda handler
│   ├── template.yaml        # SAM Infrastructure
│   └── samconfig.toml       # Deployment config
│
└── .github/workflows/        # CI/CD Pipeline
    └── deploy.yml           # GitHub Actions
```

## Roadmap

### Phase 1: MVP (Current) ✓
- Functional Chrome extension
- Automatic checkout detection
- 30-second pause mechanism
- Serverless backend

### Phase 2: AI Personalization (Next 3 months)
- ML model for pattern analysis
- Adaptive interventions per user
- WhatsApp notifications
- Savings dashboard and metrics

### Phase 3: Expansion (6-12 months)
- Mobile app (iOS + Android)
- Integration with Chilean banks
- Predictive financial health analysis
- LATAM expansion

### Long-term Vision
- Global marketplace: Chile → LATAM → Worldwide
- Complete banking integration with real-time alerts
- Financial wellness ecosystem platform

## Team

**Team 11 - Platanus Hack 2025**

- Mitchel Jimenez - [@mitcheljimenez](https://github.com/mitcheljimenez)
- Luis Leiva - [@lileiva](https://github.com/lileiva)
- Andres Gonzalez - [@AndresGonzalez5](https://github.com/AndresGonzalez5)
- Verner Codoceo - [@vacodoceo](https://github.com/vacodoceo)

**Track:** Fintech + Digital Security
**Hackathon:** Platanus Hack 2025
**Submission:** November 23, 2025, 9:00 AM (Chile Time)

## License

MIT License - See LICENSE file for details

## Links

- **GitHub Repository:** https://github.com/platanus-hack/platanus-hack-25-team-11
- **Latest Release:** https://github.com/platanus-hack/platanus-hack-25-team-11/releases/latest
- **Download Extension:** https://github.com/platanus-hack/platanus-hack-25-team-11/releases/download/v1.0.0/think-twice-v1.0.0.zip

---

**ThinkTwice** - Because your money deserves a second thought. 💭💰

*Made with ❤️ by Team 11 in Chile 🇨🇱*
