# **💡 MimiBoard: Contextual AI Meme Generator**

## **🌟 Overview**

**MimiBoard** is a next-generation platform blending meme discovery with AI-powered creation. Users input real-life scenarios, and our system uses the **Gemini API** to analyze the emotional context, find the perfect template, and instantly generate a highly relatable meme.

The architecture is built for **persistence and performance**, solving the challenge of managing permanent user interactions on a volatile, transient content feed.

### **Core Value Proposition**

* **Contextual AI Matching:** Generate a meme based on your mood, not just random tags.  
* **Seamless Persistence:** User activity (Likes, Saves, Comments) is permanently retained, even when the source content expires from the cache.  
* **Progressive Editing:** Simple editing mode for speed, with an optional Advanced Editor for granular control.

## **🛠️ Technology Stack (Full-Stack MERN \+ AI)**

| Layer | Technology | Key Components |
| :---- | :---- | :---- |
| **Backend (API)** | Node.js (Express) | Asynchronous Controllers, Express Router, Cron Jobs |
| **Database** | MongoDB (Mongoose) | TTL Indices, Polymorphic Schemas (8 Models), Advanced Aggregation |
| **Frontend** | Next.js (React) | High-performance, SSR-capable User Interface |
| **AI/Tools** | **Google Gemini API** | Scenario analysis, Tag & Caption generation |
| **Data Source** | Reddit Public API | Content caching for the Discovery Feed |

## **🚀 Architectural Highlights**

MimiBoard's complexity lies in its dual content system and persistence management:

### **1\. Dual Content Architecture**

* **Transient Content (MemeFeedPost):** Content cached from Reddit that automatically **expires every 24 hours** via a TTL index.  
* **Permanent Content (CreatedMeme):** The single, long-term destination for all user-generated content and cloned permanent memes.

### **2\. Seamless User Persistence (Clone-on-Interaction)**

To prevent liked/saved content from disappearing when the cache expires, MimiBoard uses a robust persistence mechanism:

| User Action | System Logic | Result |
| :---- | :---- | :---- |
| **Anonymous Visit** | A permanent User document is created with a UUID and linked to the session cookie. | User activity is tracked even without registration. |
| **Like/Save MemeFeedPost** | The controller runs the **Clone-or-Find-and-Swap** helper. | The temporary post is cloned into a new **CreatedMeme** document (owned by a System ID), and the Like record is immediately switched to point to the **permanent CreatedMeme ID**. |
| **TTL Expiry** | The temporary MemeFeedPost is deleted. | The user's Like record is intact, pointing to the permanent clone. **History is preserved.** |

### **3\. AI Creation Pipeline (The Core Feature)**

1. User inputs a scenario (e.g., "When I try to use a new Mongoose hook...").  
2. The backend calls the Gemini API to get structured JSON output: {"tags": \["confusion", "struggle"\], "caption": "Me watching the docs."}.  
3. The system queries the **MemeTemplate** collection, matching the emotionTags against the template's manual tags.  
4. The best match is returned to the user for editing.

## **⚙️ Quick Start (Backend)**

1. Clone the repository and navigate to the server/ directory.  
2. Install dependencies: npm install  
3. Create a .env file with MONGODB\_URI, Auth Secrets, and GEMINI\_API\_KEY.  
4. Run the server: npm start (This will automatically start the caching job).