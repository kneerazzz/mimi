# Mimi

**Mimi** is a comprehensive meme creation and sharing platform designed for the modern internet. It combines a high-performance infinite feed with a professional-grade browser-based image editor, allowing users to discover viral content and create their own memes using advanced layering tools.

## Key Features

### 🎨 Advanced Meme Studio
Unlike basic caption tools, the Mimi Editor is a full-featured canvas design tool.
* **Layer-Based Editing:** Add multiple text and image layers.
* **Drag & Drop:** Freely move, resize, and rotate elements on the canvas.
* **Rich Text Styling:** Control font family, size, color, stroke (outline), background bubbles, and shadows.
* **Smart Scaling:** Canvas resolution handling ensures exports look crisp regardless of screen size.
* **Template System:** Start from a blank canvas or use community templates.

### 🌊 Infinite Discovery Feed
* **Masonry Layout:** Pinterest-style grid optimized for visual content consumption.
* **Smart Caching:** Fast loading times with optimized image delivery.
* **Categories:** Filter by Trending, Latest, or Search specific keywords.
* **Interactive UI:** Like, save, and share functionality.
* **Cold Start Handling:** Custom loading states to handle server wake-up times gracefully.

### 👤 User Features
* **Profile Dashboard:** Manage created memes and saved collections.
* **Template Management:** Users can upload and privatize their own templates.
* **Secure Authentication:** JWT-based persistent login sessions.

---

## Technology Stack

### Frontend (Client)
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** React Hooks & Context API
* **Canvas Logic:** Native HTML5 Canvas API (Custom Hooks)
* **Icons:** Lucide React
* **Deployment:** Vercel

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ORM)
* **Storage:** Cloudinary (Image hosting & optimization)
* **Architecture:** MVC Pattern with RESTful API endpoints
* **Deployment:** Render

---

## Environment Variables

To run this project locally, you will need to configure the following environment variables.

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api



.env.local

    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    CLIENT_URL=http://localhost:3000
    EMAIL_USER="YOUR_EMAIL_ADDRESSS"
    EMAIL_PASS="YOUR_EMAIL_PASS"



BACKEND SETUP 
    cd backend
    npm install 
    npm run dev


FRONTEND SETUP
    cd frontend
    npm install
    npm run dev


FRONTEND BUILD COMMANDS
    cd frontend
    npm run build
    npm start