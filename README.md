# Mimi 🐱

**Mimi** is a comprehensive meme creation and sharing platform designed for the modern internet. It combines a high-performance infinite feed with a professional-grade browser-based image editor, allowing users to discover viral content and create their own memes using advanced layering tools.

---

## ✨ Key Features

### 🎨 Advanced Meme Studio

Unlike basic caption tools, the Mimi Editor is a full-featured canvas design tool.

- **Layer-Based Editing** — Add multiple text and image layers.
- **Drag & Drop** — Freely move, resize, and rotate elements on the canvas.
- **Rich Text Styling** — Control font family, size, color, stroke (outline), background bubbles, and shadows.
- **Smart Scaling** — Canvas resolution handling ensures exports look crisp regardless of screen size.
- **Template System** — Start from a blank canvas or use community templates.

### 🌊 Infinite Discovery Feed

- **Masonry Layout** — Pinterest-style grid optimized for visual content consumption.
- **Smart Caching** — Fast loading times with optimized image delivery.
- **Categories** — Filter by Trending, Latest, or search specific keywords.
- **Interactive UI** — Like, save, and share functionality.
- **Cold Start Handling** — Custom loading states to handle server wake-up times gracefully.

### 👤 User Features

- **Profile Dashboard** — Manage created memes and saved collections.
- **Template Management** — Upload and privatize your own templates.
- **Secure Authentication** — JWT-based persistent login sessions.

---

## 🛠 Technology Stack

### Frontend

| Tool | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS | Styling |
| React Hooks & Context API | State Management |
| HTML5 Canvas API | Canvas Logic (Custom Hooks) |
| Lucide React | Icons |
| Vercel | Deployment |

### Backend

| Tool | Purpose |
|---|---|
| Node.js + Express.js | Runtime & Framework |
| MongoDB + Mongoose | Database & ORM |
| Cloudinary | Image Hosting & Optimization |
| MVC + RESTful API | Architecture |
| Render | Deployment |

---

## ⚙️ Environment Variables

### Frontend — `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend — `backend/.env.local`

```bash
PORT=4000
CORS_ORIGIN=*

# MongoDB
MONGO_URL="YOUR_MONGODB_URL"

# Cloudinary
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"

# Auth
ACCESS_TOKEN_SECRET="YOUR_ACCESS_TOKEN_SECRET"
ACCESS_TOKEN_EXPIRY="1d"
REFRESH_TOKEN_SECRET="YOUR_REFRESH_TOKEN_SECRET"
REFRESH_TOKEN_EXPIRY="10d"

# Gemini AI
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-2025:generateContent"

# Email
EMAIL_USER="YOUR_EMAIL_ADDRESS"
EMAIL_PASS="YOUR_EMAIL_PASSWORD"
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance (local or Atlas)
- Cloudinary account

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 📦 Production Build

```bash
cd frontend
npm run build
npm start
```

---

## 📄 License

This project is open source. Feel free to fork, contribute, or use it as inspiration.