## 🚀 Two Ways to Run WasteWise AI

### Method 1: Full Stack (Recommended for Production)

**With Node.js backend (secure API key storage):**

1. Make sure Node.js 18+ is installed:
   ```bash
   node --version
   ```

2. Navigate to the wastewise folder and run:
   ```bash
   # Windows
   start.bat

   # Linux/Mac
   chmod +x start.sh
   ./start.sh
   ```

3. The script will install dependencies and start the server
4. Open **http://localhost:3000** in your browser

---

### Method 2: Standalone HTML (No Node.js Required)

**Direct browser use (for quick demo/hackathon):**

1. Open `wastewise/public/index.html` directly in your browser
2. You'll be prompted to enter your Groq API key on first use
3. The key is stored in localStorage (browser-only, not sent anywhere except Groq)

⚠️ **Note:** This method exposes your API key in the browser. Only use for local testing/demo.

---

## 🔑 Getting a Groq API Key

1. Visit https://console.groq.com
2. Sign up (free account)
3. Navigate to API Keys
4. Create a new key
5. Copy and use it in `.env` (Method 1) or browser prompt (Method 2)

---

## 📱 Features Checklist

✅ **ChatGPT-like conversation interface**  
✅ **5 specialized AI agents** (Route, Segregation, Grievance, Routing, Analytics)  
✅ **Municipal dashboard** (KPIs, ward performance, vehicles, complaints, alerts)  
✅ **Multilingual** (English, Hindi, Gujarati with auto-detection)  
✅ **Voice input** (Chrome/Edge browsers)  
✅ **Conversation history** (saved in browser)  
✅ **Demo data** (8 Gujarat wards with realistic municipal data)  
✅ **Secure** (API key server-side in Method 1)  
✅ **Mobile responsive**  
✅ **Dark civic-tech design**  

---

## 🧪 Testing Scenarios

### 1. Citizen Complaint (English)
> "Garbage has not been collected in my area for 3 days near Maninagar station"

**Expected:** Grievance Intake Agent classifies complaint, asks for ward/location if missing.

---

### 2. Citizen Complaint (Gujarati)
> "મારા વિસ્તારમાં ૩ દિવસથી કચરો લેવા ગાડી નથી આવી"

**Expected:** AI responds in Gujarati, classifies as missed collection complaint.

---

### 3. Route Optimization (Officer)
> "Optimize waste collection routes for Ward 7"

**Expected:** Route Optimization Agent suggests zone order, highlights missed collections.

---

### 4. Ward Analytics (Officer)
> "Show me Ward 4 performance this week"

**Expected:** Ward Analytics Agent provides KPIs, segregation data, complaints, efficiency metrics.

---

### 5. Segregation Compliance
> "Which wards have low segregation compliance?"

**Expected:** Segregation Compliance Agent lists wards below 70%, suggests awareness campaigns.

---

### 6. Circular Economy (Citizen)
> "How can I compost kitchen waste at home?"

**Expected:** Circular Economy Assistant provides practical composting guidance.

---

### 7. Dashboard Query
> "Show city-wide waste management overview"

**Expected:** Dashboard Analytics Agent summarizes total waste, vehicles, complaints, efficiency.

---

### 8. Collection Schedule
> "When does the garbage vehicle come in my ward?"

**Expected:** Collection Schedule Agent provides morning/evening timings, notes disruptions.

---

## 📦 Project Structure

```
wastewise/
├── server.js                    # Express backend + Groq API proxy
├── src/
│   ├── agents.js                # Agent orchestration, intent detection, context builder
│   └── demoData.js              # 8 Gujarat wards demo data (simulated)
├── public/
│   ├── index.html               # Main app shell
│   ├── style.css                # Dark civic-tech design system
│   ├── app.js                   # Frontend chat + dashboard logic
│   └── standalone.html          # Fallback for no-Node.js mode
├── package.json                 # Dependencies
├── .env.example                 # Template for API key
├── start.bat                    # Windows startup script
├── start.sh                     # Linux/Mac startup script
└── README.md                    # This file
```

---

## 🔒 Security Best Practices

### ✅ Production-Ready (Method 1 — Node.js backend)
- API key stored in `.env` file (never in frontend)
- Server-side Groq API calls only
- Rate limiting: 60 req/min per IP
- Input validation & sanitization
- Request size limits
- Conversation history capped at 20 messages

### ⚠️ Demo Only (Method 2 — Standalone HTML)
- API key stored in browser localStorage
- Direct browser → Groq API calls
- Suitable for hackathon demos & local testing
- **Do not deploy to public web without backend**

---

## 🛠 Troubleshooting

### "Node.js not found"
→ Install from https://nodejs.org/ (v18 or higher recommended)

### "npm install failed"
→ Try clearing cache: `npm cache clean --force` then re-run

### "Port 3000 already in use"
→ Change PORT in `.env` to 3001, 4000, etc.

### "Groq API error 401 Unauthorized"
→ Check your API key in `.env` — ensure it's valid and has no extra spaces

### Dashboard not loading
→ The server needs to be running. Check console for errors.

### Voice input not working
→ Voice recognition requires Chrome/Edge and HTTPS (or localhost). Check browser permissions.

---

## 🏗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Browser)                     │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Chat UI    │  │ Dashboard   │  │ Voice + i18n    │  │
│  │ (ChatGPT)  │  │ (KPIs/Ward) │  │ (EN/HI/GU)      │  │
│  └────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ API Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express + Node.js)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Agent Orchestrator                              │   │
│  │  • Intent Detection                              │   │
│  │  • Context Builder (inject demo data)           │   │
│  │  • System Prompt Generator                       │   │
│  └───────────────────┬─────────────────────────────┘   │
│                      ↓                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Specialized Agents                               │  │
│  │  1. Route Optimization                            │  │
│  │  2. Segregation Compliance                        │  │
│  │  3. Grievance Intake                              │  │
│  │  4. Municipal Routing                             │  │
│  │  5. Ward Analytics                                │  │
│  │  6. Circular Economy                              │  │
│  │  7. Collection Schedule                           │  │
│  │  8. Dashboard Analytics                           │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      ↓                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Groq LLM API (llama-3.3-70b-versatile)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Hackathon Judging Criteria Alignment

| Criteria | How WasteWise AI Addresses It |
|----------|-------------------------------|
| **Innovation** | 8 specialized AI agents orchestrated for municipal waste management — not generic chatbot |
| **Impact** | Direct citizen→govt communication, optimized routes, compliance tracking, data-driven decisions |
| **Technical Execution** | Full-stack app (React-like UI, Express backend, Groq LLM, agentic architecture, voice, i18n) |
| **Practicality** | Real Gujarat use case, demo data modeled on actual municipal structures, works offline (demo mode) |
| **User Experience** | ChatGPT-like interface, multilingual, voice input, mobile-responsive, officer dashboard |
| **Scalability** | Modular agent system, easily add new wards/agents/languages, cloud-deployable |

---

## 🌍 Real-World Deployment Considerations

To deploy this for an actual Gujarat municipal corporation:

1. **Replace demo data** with real ward data APIs
2. **Add authentication** (citizen login, officer login, role-based access)
3. **Connect to municipal backends** (complaint management system, vehicle GPS, waste sensors)
4. **Deploy to cloud** (Azure/AWS with Node.js + PostgreSQL/MongoDB)
5. **Mobile apps** (React Native wrapper for iOS/Android)
6. **Add SMS/WhatsApp integration** for citizens without smartphones
7. **AI model fine-tuning** on actual Gujarat municipal documents/FAQs
8. **Regulatory compliance** (data privacy, GDPR/Indian IT Act)

---

## 📚 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **LLM** | Groq API (Llama 3.3 70B) | Ultra-fast AI inference for agent responses |
| **Backend** | Node.js + Express | API server, rate limiting, security |
| **Frontend** | Vanilla JS + HTML/CSS | Zero build step, fast, simple |
| **Styling** | Custom dark civic-tech theme | Professional municipal interface |
| **Voice** | Web Speech API | Browser-native voice input (Chrome/Edge) |
| **i18n** | Auto-detect + manual selector | EN/HI/GU multilingual support |
| **Data** | JSON demo data | Realistic 8-ward Gujarat simulation |
| **Storage** | localStorage | Conversation history (client-side) |

---

## 💡 Future Enhancements

- [ ] **Real-time vehicle tracking** (GPS integration)
- [ ] **Waste bin IoT sensors** (fill-level monitoring)
- [ ] **Image recognition** (citizen photo upload → auto-classify complaint)
- [ ] **Predictive analytics** (forecast waste generation by ward)
- [ ] **Gamification** (citizen rewards for segregation compliance)
- [ ] **WhatsApp bot** (for low-smartphone-penetration areas)
- [ ] **Officer mobile app** (field data entry)
- [ ] **AI-generated reports** (weekly ward performance PDFs)
- [ ] **Multi-city support** (Ahmedabad, Surat, Vadodara, Rajkot)
- [ ] **Blockchain waste tracking** (circular economy supply chain)

---

## 🤝 Contributing

This is a hackathon demo project. For production deployment:
1. Fork the repo
2. Replace demo data with real APIs
3. Add authentication & authorization
4. Harden security (CSP, HTTPS, input validation)
5. Add unit tests & integration tests
6. Set up CI/CD pipeline

---

## 📄 License

Demo project for Gujarat Municipal Hackathon 2026.  
Built with IBM Bob. Not for commercial use without proper licensing.

---

## 🙏 Credits

- **LLM:** Groq (https://groq.com)
- **Data:** Simulated Gujarat municipal data
- **Framework:** Agentic AI architecture
- **Built by:** Team WasteWise AI

---

## 📞 Support

For demo/setup issues:
1. Check this README's troubleshooting section
2. Ensure Node.js 18+ is installed
3. Verify Groq API key is valid
4. Check browser console for errors

---

**Made with ♻ for a Cleaner Gujarat**
