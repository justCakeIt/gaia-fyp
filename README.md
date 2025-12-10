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
- **React.js** (JavaScript library for building UI)

### **Backend**
- **Node.js + Express.js** (web server + routing)
- **Docker** for local containerised development

### **Database**
- **MySQL** (herbal knowledge base, conditions, recipes)

### **AI Components**
- NLP for condition–to–recommendation mapping  
- Template-based NLG (human-like explanations)  
- Light personalisation logic (rule-based for MVP)

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
npm install pug
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
