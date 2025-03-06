# Next.js Firebase Authentication

A complete authentication system with role-based access control using Next.js, Firebase Authentication, and Tailwind CSS.

## Features

- **Next.js App Router** with TypeScript and `src` directory structure
- **Firebase Authentication** with Phone Number OTP verification
- **Role-Based Access Control** for Admin and User roles
- **Protected Routes** with middleware-based redirection
- **Session Persistence** to keep users logged in
- **Responsive UI** with Tailwind CSS
- **React Firebase Hooks** for authentication state management

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Authentication enabled
- Phone authentication enabled in your Firebase project

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-username/next-firebase-auth.git
cd next-firebase-auth
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure Firebase**

Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
next-firebase-auth/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and Firebase setup
│   ├── middleware.ts      # Next.js middleware for route protection
│   └── types/             # TypeScript type definitions
└── ...                    # Config files
```

## Authentication Flow

1. User navigates to `/login`
2. User enters phone number for verification
3. Firebase sends SMS with OTP
4. User enters OTP to verify
5. On successful verification:
   - Admin users are redirected to `/dashboard/admin`
   - Regular users are redirected to `/dashboard/user`

## Role Management

In a production application, roles would typically be stored in a database like Firestore. This demo uses a simple mock database in the `AuthContext.tsx` file:

```typescript
// Mock database for user roles
const mockUserRoles: Record<string, UserRole> = {
  'admin-user-id': 'admin',
};

const defaultUserRole: UserRole = 'user';
```

Replace `'admin-user-id'` with the UID of your admin user after they have signed up.

## Firebase Emulator (Optional)

For development, you can use the Firebase Local Emulator Suite. The project is configured to connect to the emulator when in development mode.

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Initialize Firebase Emulator:

```bash
firebase init emulators
```

3. Start the emulator:

```bash
firebase emulators:start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.