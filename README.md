# GenLayer Event Alarm System

A modern event alarm system for GenLayer community events. Track weekly events, set alarms, and never miss your favorite events.

![GenLayer Event Alarm](public/mascot-rocket.png)

## ✨ Features

- **📅 Weekly Event Schedule** - Complete schedule with countdown timers
- **🔔 Smart Alarms** - 3-level notifications (5 min, 1 min, start time)
- **🎮 Gaming Mode** - Neon dark theme with retro pixel aesthetics
- **☀️ Normal Mode** - Clean light theme
- **🌍 Bilingual** - Indonesian & English support
- **📱 Responsive** - Works on mobile, tablet, and desktop
- **🔔 Browser Notifications** - Desktop push notifications
- **📊 Admin Panel** - Manage events, roles, and announcements

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🔐 Admin Access

Access the admin panel with secret URL parameter:

```
https://your-domain.com/?admin=gl2024secret
```

Default admin password: `genlayer2024!`

## 📦 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Database**: Prisma + SQLite
- **State**: Zustand

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Deploy!

### Environment Variables

Create `.env` file:

```env
DATABASE_URL="file:./db/custom.db"
NEXT_PUBLIC_ADMIN_SECRET="your-secret-key"
```

## 📁 Project Structure

```
genlayer-event-alarm/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Utilities & data
│   └── hooks/            # Custom hooks
├── public/
│   ├── icons/            # Event icons
│   └── sounds/           # Notification sounds
├── prisma/               # Database schema
└── package.json
```

## 🎨 Themes

### Gaming Mode (Dark)
- Neon colors: Cyan, Magenta, Gold, Lime
- Pixel fonts: Press Start 2P, VT323
- Retro effects: CRT scanlines, glowing borders

### Normal Mode (Light)
- Clean white background
- Standard fonts
- Modern UI

## 📱 Features Detail

### Alarm System
- **5 minutes before**: Toast notification + browser notification
- **1 minute before**: Sound alert + popup modal
- **Event starts**: Full screen alarm

### Admin Panel
- Add/Edit/Delete events
- Manage roles and permissions
- Multiple running text announcements
- Import/Export JSON data

## 📄 License

MIT License - GenLayer Community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for GenLayer Community
