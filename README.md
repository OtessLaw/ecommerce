# Luxury Fashion E-Commerce Platform (Antigravity Atelier)

Production-ready, enterprise-grade luxury clothing and fashion e-commerce platform combining aesthetics from **Zara, Nike, H&M, ASOS, and Apple**.

Built with **React 18, Vite, Tailwind CSS, Express.js, MongoDB (Mongoose), JWT, Paystack, Cloudinary, and Arkesel SMS**.

---

## 🌟 Key Features

- **Luxury Gold & Matte Black Aesthetics**: Dynamic glassmorphism cards, auto-sliding hero banners, custom gold typography & scrollbars.
- **Paystack Pop Payment Gateway**: Server-side transaction initialization and cryptographic verification to prevent double payment claims.
- **Arkesel SMS Integration**: Automated real-time SMS alerts to customers upon checkout and order fulfillment status updates.
- **Cloudinary Image Gallery**: High-resolution image zoom, color swatch switcher, and size selector.
- **Executive Admin & Staff Portal**: Live analytics dashboard with revenue charts, low stock alerts, inventory catalog manager, and order status updates.
- **Customer Portal**: Order history with live 4-step progress tracker, saved addresses, wishlist grid, and printable invoices.
- **One-Click Demo Credentials**: Instant login buttons for Admin, Staff, and Customer testing without registration hassle.

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies

```bash
npm run install:all
```

### 2. Start Backend Server (Port 5000)

```bash
npm run dev:backend
```

### 3. Start Frontend Development Server (Port 5173)

```bash
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Account Credentials

Click the **One-Click Sign In** buttons on the Login page (`/login`) or use:

- **Admin Account**: `admin@luxury.com` / `password123`
- **Staff Account**: `staff@luxury.com` / `password123`
- **Customer Account**: `customer@luxury.com` / `password123`

---

## 🌐 Deployment Instructions

### Backend (Render / Heroku)
1. Push `backend/` repository to GitHub.
2. Create a Web Service on Render, setting root directory to `backend`.
3. Set Environment variables (`MONGO_URI`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `ARKESEL_API_KEY`).
4. Build command: `npm install`, Start command: `node server.js`.

### Frontend (Vercel)
1. Import repository to Vercel, setting root directory to `frontend`.
2. Framework Preset: **Vite**.
3. Deploy!
