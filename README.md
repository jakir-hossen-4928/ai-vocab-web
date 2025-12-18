# AI Vocabulary App📚

A modern, AI-powered vocabulary learning application designed to help Bengali speakers master English vocabulary, specifically tailored for IELTS Band 7+ preparation.

## 🚀 Features

### 🤖 AI-Powered Content Generation
- **OpenAI Integration**: Powered by GPT-4o for intelligent vocabulary generation
- **OpenRouter Support**: Alternative AI provider with multiple model options
- **One-Click Auto-fill**: Enter an English word and automatically generate:
  - Bangla Meaning
  - English Definition
  - Part of Speech
  - Bangla Phonetic Pronunciation
  - Detailed Explanation
  - Synonyms & Antonyms (Band 7+ level)
  - Example Sentences (English with Bangla translation)
  - Verb Forms (for verbs only)
  - Related Words

### 📖 Vocabulary Management
- **Interactive Cards**: Beautifully designed vocabulary cards with flip/expand interactions
- **Smart Search & Filtering**:
  - Filter by Part of Speech
  - Filter by Favorites
  - Real-time text search
  - URL-based search parameters
- **Audio Pronunciation**: Built-in Text-to-Speech for correct pronunciation
- **Favorites System**: Save and manage your favorite words
- **PDF Export**: Export vocabulary lists to PDF for offline study
- **Bulk Upload**: Import multiple words via CSV/JSON with template support
- **Duplicate Detection**: Smart duplicate management with merge capabilities
- **Conditional Verb Forms**: Verb conjugations displayed only for verbs

### 💬 AI Chat Features
- **Vocabulary Chat**: Interactive AI conversations about specific words
- **Context Learning**: Get detailed explanations and usage examples
- **Session Management**: Track and review chat history
- **Token Usage Tracking**: Monitor AI API usage and costs

### 🎴 Flashcards
- **Interactive Learning**: Swipe-based flashcard system
- **Progress Tracking**: Monitor your learning progress
- **Spaced Repetition**: Optimized for memory retention

### 🌐 Online Dictionary
- **Free Dictionary API**: Fallback search for words not in local database
- **Google Translate Integration**: Quick translations
- **Cambridge Dictionary Widget**: Direct access to Cambridge definitions

### 📚 Resources Gallery
- **Visual Learning**: Curated grammar rules and cheat sheets
- **Admin Management**: Easy upload and organization of learning resources
- **Category Organization**: Browse resources by topic

### 🔔 Push Notifications
- **Firebase Cloud Messaging**: Hourly vocabulary reminders
- **Custom Scheduling**: Personalized notification preferences
- **PWA Support**: Native-like notifications on all devices

### 🔐 User System
- **Google Authentication**: Secure and fast sign-in
- **Role-Based Access**:
  - **Admins**: Full CRUD operations, user management, bulk operations
  - **Users**: Browse, search, favorite, and learn
  - **Guest Mode**: Limited exploration without sign-in
- **Profile Management**: Track learning statistics and AI usage

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Mode Support**: Easy on the eyes for extended study sessions
- **Smooth Animations**: Powered by Framer Motion
- **PWA Support**: Installable as a native app
- **Offline Capability**: IndexedDB caching for offline access
- **Network Status**: Real-time connection monitoring

### 🛠️ Admin Features
- **Add/Edit Vocabulary**: Comprehensive form with AI auto-fill
- **Bulk Upload**: CSV/JSON import with validation
- **Duplicate Manager**: Smart detection and merging
- **User Management**: View and manage user accounts
- **Resources Manager**: Upload and organize learning materials
- **API Key Setup**: Configure OpenAI/OpenRouter credentials

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6

### Backend & Services
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging
- **AI Services**:
  - OpenAI API (GPT-4o)
  - OpenRouter (Multiple models)
- **External APIs**:
  - Free Dictionary API
  - Google Translate

### Additional Libraries
- **PDF Generation**: html2pdf.js
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Local Storage**: IndexedDB (Dexie.js)
- **Form Handling**: React Hook Form
- **Date Utilities**: date-fns

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project
- OpenAI API Key or OpenRouter API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jakir-hossen-4928/AI-Vocabulary-Web-App.git
   cd AI-Vocabulary-Web-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key

   # OpenAI Configuration (Optional)
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Configure Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /vocabularies/{document=**} {
         allow read: if true;
         allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }

       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }

       match /notificationTokens/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📱 PWA Installation

The app can be installed as a Progressive Web App:
1. Visit the deployed URL
2. Click the install prompt in your browser
3. Enjoy native-like experience with offline support

## 🔑 API Key Setup

Users can configure their own AI API keys:
1. Navigate to Settings → AI API Setup
2. Choose provider (OpenAI or OpenRouter)
3. Enter your API key
4. Select preferred model
5. Keys are stored securely in browser localStorage

## 📊 Features Breakdown

### For Learners
- Browse 1000+ vocabulary words
- Search and filter by criteria
- Save favorites for quick access
- Practice with flashcards
- Chat with AI about word usage
- Get push notifications for daily practice
- Export study materials to PDF
- Access offline with PWA

### For Admins
- Add vocabulary with AI assistance
- Bulk upload from CSV/JSON
- Manage duplicates intelligently
- Upload learning resources
- Monitor user activity
- Configure system settings

## 🌟 Key Improvements

### Data Integrity
- Conditional verb forms (only for verbs)
- Smart duplicate detection and merging
- Firestore validation to prevent undefined values
- Robust error handling

### User Experience
- Mobile-responsive design
- Smooth animations and transitions
- Real-time search with URL parameters
- Network status monitoring
- Offline capability with IndexedDB

### Performance
- Lazy loading and code splitting
- Optimized bundle size
- Efficient state management with React Query
- IndexedDB caching for faster loads

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Jakir Hossen**
- GitHub: [@jakir-hossen-4928](https://github.com/jakir-hossen-4928)

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- Firebase for backend services
- Shadcn UI for beautiful components
- The React and TypeScript communities

---

Made with ❤️ for IELTS learners
