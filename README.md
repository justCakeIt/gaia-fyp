# G.a.i.A. — Green AI Alchemy 🌿🤖  
*A Natural Health Guidance Platform Powered by Artificial Intelligence*

---

## 📘 Project Overview

**G.a.i.A. (Green AI Alchemy)** is a wellness-focused web application designed to help users support their recovery naturally after receiving a confirmed medical diagnosis.  
Instead of giving medical diagnoses, the system provides **safe, research-based herbal blends, nutrition plans, lifestyle suggestions, and natural recovery routines**.

Using a curated herbal knowledge base combined with AI-driven personalisation, G.a.i.A. bridges the gap between traditional botanical wisdom and modern computer science.

---

## 🌿 Key Features

### 🔍 Condition Search (Post-Diagnosis Support)
Users enter the name of a medically confirmed condition (e.g., *fatty liver*, *mild inflammation*).  
The system returns structured natural support options (not medical treatment).

### 🌱 Herbal Mixtures & Preparation Guides
- Evidence-based herbs for each condition  
- Recipes for teas, decoctions, tinctures, and blends  
- Doses & safety guidance  
- Interactions & contraindications where applicable  

### 🍽️ Nutrition & Meal Plans
- Condition-aligned meal recommendations  
- Recipes that support recovery (e.g., high-fibre for fatty liver)  
- AI-generated weekly meal ideas  
- Optional shopping list creation  

### 📅 Daily Routine Builder
- AI-generated routine templates (e.g., “Morning Liver Support Routine”)  
- Reminders (take blend, prepare meal, drink infusion)  
- Progress tracking  

### 🤖 AI Personalisation Engine
- Tailors suggestions based on user habits  
- Learns user preferences over time  
- Generates recipe explanations with NLG templates  
- **Never** provides diagnoses — only supportive information  

### 📚 Herbal Knowledge Base (KB)
- Scientific references  
- Herbal actions, safety, and preparation methods  
- Structured MySQL database for fast retrieval  

### 🧩 Future Extensions (not part of MVP)
- Smartphone herbal recognition (image classifier)  
- Audio assistant for routines  
- User community features  

---

## 🎯 Target Audience

- Adults interested in **natural wellness support**  
- People who want **structured guidance** after a confirmed diagnosis  
- Anyone wanting **easy herbal recipes** and lifestyle routines  
- Users exploring **AI-driven health personalisation**  

---

## 🧠 Technology Stack

### **Frontend**
- **Next.js 16.1.6** with **React 19.2.3**
- **NextAuth ^4.24.13** for authentication (local + Google OAuth)
- TypeScript + Tailwind CSS 4

### **Backend**
- **Node.js + Express ^4.22.1** (web server + routing)
- **MySQL2 ^3.17.5** driver
- **Docker** for local containerised development

### **Database**
- **MySQL 8** (herbal knowledge base, conditions, recipes, users)

### **AI Components**
- NLP for condition–to–recommendation mapping  
- Template-based NLG (human-like explanations)  
- Light personalisation logic (rule-based for MVP)

### **CORS (local development)**

The backend permits requests from the following origins by default:
- `http://localhost:5173` (Vite)
- `http://localhost:3001` (Next.js dev)
- `http://localhost:3000` (backend)

Override by setting `CORS_ORIGIN=<comma-separated URLs>` in the root `.env`.

---

## 🚀 Getting Started

### ✔️ Prerequisites  
Ensure you have installed:

- **Node.js** → https://nodejs.org  
- **npm** or **yarn**  
- **Docker Desktop** → https://docs.docker.com/desktop/setup/install/windows-install/  

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/gaia-fyp
cd gaia-fyp
```

Install backend dependencies:

```bash
npm install
```

Start Docker containers:

```bash
docker-compose up
```

---

## ▶️ Running the App

Start the backend:

```bash
npm start
```

Then open:

- **App / Frontend:** http://localhost:3000  
- **phpMyAdmin:** http://localhost:8081  

(Use the credentials stored in your `.env` file.)

---

## 🧪 Testing

The backend has an integration test suite built with **Jest** and **Supertest**.

> **Requirement:** The MySQL Docker container must be running before tests are executed.
>
> ```bash
> docker compose up -d
> ```

Run all tests:

```bash
npm test
```

Tests are integration tests — they connect to the real database and clean up all created rows (test user, plan, plan items, reminders) after each run.

---

## ⚙️ Continuous Integration

Every push and pull request runs two parallel GitHub Actions jobs:

| Job | What it checks |
|-----|----------------|
| **Backend – integration tests** | Spins up a MySQL 8 service, applies schema and seed data, then runs `npm test` (Jest + Supertest, 38 tests) |
| **Frontend – lint & build** | Runs `npm run lint` (ESLint / Next.js rules) then `npm run build` (Next.js production build, 13 routes) |

**Run the same checks locally:**

```bash
# Backend tests — requires Docker MySQL container running
docker compose up -d
npm test

# Frontend lint + build
cd frontend
npm run lint
npm run build
```

---

## 🤝 Contributing

By contributing to this project, you agree to follow the  
**[Code of Conduct](CODE_OF_CONDUCT.md)**.

### 🧪 How to Contribute

1. **Fork the repository**  
2. Create a feature branch  
   ```bash
   git checkout -b feature-name
   ```
3. Make meaningful commits  
   ```bash
   git commit -m "Add: meaningful description"
   ```
4. Push your branch  
   ```bash
   git push origin feature-name
   ```
5. Open a **Pull Request**  

---

## 📄 License

This project is licensed under the **MIT License**.  
See the **[LICENSE](LICENSE)** file for details.

---

## 📬 Contact

For questions or suggestions, please open an **Issue** or contact:

📧 stadlerm@roehampton.ac.uk  
