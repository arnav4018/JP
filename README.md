# Job Portal - Professional Career Platform

A modern, full-featured job portal built with Next.js, featuring AI-powered skill matching, comprehensive user management, and professional design.

## 🚀 Features

### For Job Seekers
- **AI-Powered Job Matching** - Smart recommendations based on skills and preferences
- **Professional Profile Builder** - Comprehensive profiles with resume upload
- **Advanced Job Search** - Filter by location, salary, company, skills
- **Application Tracking** - Track application status and progress
- **Resume Builder** - Built-in resume creation tool
- **Skill Assessment** - Validate and showcase your skills

### For Recruiters  
- **Applicant Management** - View and manage job applications
- **Skill Matching Dashboard** - AI-powered candidate scoring
- **Job Posting Management** - Create and manage job listings
- **Candidate Search** - Advanced filtering and search capabilities
- **Application Analytics** - Track hiring metrics and insights

### For Administrators
- **User Management** - Manage job seekers, recruiters, and admins
- **Job Management** - Oversee all job postings and applications
- **Analytics Dashboard** - Platform usage and performance metrics
- **Content Moderation** - Review and approve job postings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom CSS Modules
- **State Management**: Zustand
- **Form Handling**: React Hook Form with validation
- **Icons**: Lucide React
- **Build Tools**: ESLint, TypeScript compiler
- **Animations**: Custom CSS animations with glass morphism effects

## 🎨 Design Features

- **Modern Glass Morphism UI** - Professional and contemporary design
- **Responsive Design** - Fully responsive across all devices
- **Dark/Light Theme Support** - Customizable theme system
- **Professional Typography** - Clean, readable font hierarchy
- **Smooth Animations** - Subtle animations that enhance UX
- **Accessibility Compliant** - WCAG guidelines compliance

## 📁 Project Structure

```
job-portal-project/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js 14 app directory
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI components
│   │   ├── services/            # API services and mock data
│   │   ├── store/               # Zustand state management
│   │   ├── styles/              # CSS modules and animations
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static assets
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arnav4018/JP.git
   cd JP
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🔧 Configuration

The project uses environment-based configuration. Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=JobPortal
```

## 📱 Pages & Features

### Public Pages
- **Homepage** (`/`) - Hero section with job search
- **Jobs** (`/jobs`) - Browse and search job listings  
- **Job Details** (`/jobs/[id]`) - Individual job posting details
- **Companies** (`/companies`) - Company directory
- **Login/Signup** (`/auth/*`) - Authentication pages

### Protected Pages  
- **Dashboard** (`/dashboard`) - User-specific dashboard
- **Profile** (`/profile`) - Profile management
- **Applications** (`/applications`) - Application tracking
- **Resume Builder** (`/resume-builder`) - Resume creation tool

### Admin Pages
- **Admin Dashboard** (`/admin`) - Platform overview
- **Job Management** (`/admin/jobs`) - Manage job postings
- **User Management** (`/admin/users`) - Manage users
- **Applicant Review** (`/admin/jobs/[id]/applicants`) - Review applications

## 🎯 Key Enhancements

- **Phase 5 Completion**: AI skill matching, form validation, performance optimization
- **Professional Design**: Clean, modern interface suitable for business use
- **Mobile-First**: Responsive design that works on all devices
- **Performance Optimized**: Image optimization, code splitting, caching
- **SEO Ready**: Proper meta tags, structured data, sitemap

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Arnav** - [GitHub Profile](https://github.com/arnav4018)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide React for the beautiful icons
- All contributors and testers

---

⭐ If you find this project helpful, please give it a star on GitHub!