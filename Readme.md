
### 📌 Project Description

This **Video Streaming Backend Project** was built as part of a structured learning path from the YouTube channel **Chai aur Code**.

After walking through the implementation of the **User Controller** in detail, the Hitesh sir assigned a hands-on task to complete all the remaining controllers independently — including Video, Tweet, Playlist, Comment, Subscription, and Like controllers. I successfully completed the task, gaining deeper backend skills through this real-world project simulation.

The tech stack used:

* **Node.js** + **Express.js**
* **MongoDB** with **Mongoose**
* **JWT** for authentication
* **Cloudinary** for media file uploads
* **Multer** for handling multipart form data

---

🗂️ Folder Structure

```
backend_project/
│
├── src/
│   ├── config/                 # MongoDB & Cloudinary config
│   ├── controllers/           # All controller logic
│   ├── middlewares/           # Auth, multer, error handlers
│   ├── models/                # Mongoose models (User, Video, Tweet, etc.)
│   ├── routes/                # Express route files
│   ├── utils/                 # Utility functions (token gen, cloud uploads)
│   └── index.js               # App entry point
│
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
