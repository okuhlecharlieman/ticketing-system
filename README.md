
# Ticketing System – Next.js \& Firebase

A modern ticketing/support desk web application built in Next.js, using Firebase (Realtime Database, Auth) for backend, and Tailwind CSS for styling. It supports normal users and technicians, ticket filtering, comments, and responsive dark mode UI.

## Features

- **User Authentication** via Firebase Auth
- **Role-based access:** User, Technician
- **Ticket management:** Create, view, and resolve support tickets
- **Technician dashboard:** View and filter tickets by user
- **Commenting system:** Add and view comments per ticket
- **Dark mode toggle**
- **Responsive design** optimized for mobile and desktop


## Technology Stack

| Tech | Role |
| :-- | :-- |
| Next.js | Frontend framework |
| React | UI components |
| Firebase | Backend/Auth/Database |
| TailwindCSS | Styling |
| PM2 (deployment) | Node.js process manager |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/okuhlecharlieman/ticketing-system.git
cd ticketing-system
```


### 2. Install Dependencies

```bash
npm install
```


### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase and environment credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Do not commit `.env.local` to version control.**

### 4. Run the App in Development

```bash
npm run dev
```

- Visit [http://localhost:3000](http://localhost:3000)


## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Email/Password authentication** in Authentication settings.
3. Set up **Realtime Database**. Ensure database rules restrict reads/writes appropriately.
4. Add your app’s domain(s) to Firebase Auth’s allowed domains.

### Database Structure

Example paths:

- `/users/{uid}`: user details, `isTechnician` for role
- `/tickets/{ticketId}`: ticket data (`title`, `description`, `loggedByUid`, `loggedFor` (user ID or email), `status`, `createdAt`, etc.)
- `/tickets/{ticketId}/comments/{commentId}`: comment data (`author`, `text`, `timestamp`)


## Deployment

### To a Managed Server (e.g., Hetzner/KonsoleH)

- Build app as a **standalone** Next.js server:

```js
// next.config.js
module.exports = { output: "standalone" }
```

- Upload code to server and run install/build steps:

```
npm install
npm run build
```

- Use **PM2** to manage the Next.js server process:

```
pm2 start .next/standalone/server.js --name ticketing-system
```

- Configure reverse proxy via Apache/Nginx to route traffic to your Node.js port.
- Set up a cron job to resurrect PM2 on reboot.

Full details in [Hetzner Next.js guide] or see your hosting provider docs.

## Handover \& Maintenance

- Invite new developers to Firebase Console for admin access.
- Share repository and deployment credentials securely.
- Update documentation with any infrastructure or logic changes.
- Regularly audit Firebase security and app dependencies.


## Folder Structure

```plaintext
/
├── components/           // Reusable React components
├── context/              // Context providers (e.g. dark mode)
├── lib/                  // Firebase config and helpers
├── pages/                // Next.js routes
├── public/               // Static assets
├── styles/               // Tailwind/global styles
├── .env.example          // Environment variable template
├── README.md             // This file
```


## Common Commands

| Command | Description |
| :-- | :-- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start prod server |

## Contributing

PRs and issues welcome! Please open a pull request or create an issue for bug reports or feature requests.

## License

MIT – see [LICENSE](LICENSE) for details.

## Credits

Built and maintained by [okuhlecharlieman](https://github.com/okuhlecharlieman) and contributors.

: https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/


