## 📁 Struktura Projektu Next.js 15.5

frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local
├── .env.example
├── jsconfig.json # Path mapping
├── public/
│ ├── favicon.ico
│ ├── logo.png
│ └── icons/
└── src/
├── app/ # Next.js App Router
│ ├── layout.js # Root layout
│ ├── page.js # Home page
│ ├── globals.css # Global styles
│ ├── (auth)/ # Auth route group
│ │ ├── layout.js # Auth layout
│ │ ├── login/
│ │ │ └── page.js
│ │ └── register/
│ │ └── page.js
│ ├── (dashboard)/ # Protected routes group
│ │ ├── layout.js # Dashboard layout
│ │ ├── dashboard/
│ │ │ └── page.js
│ │ ├── positions/
│ │ │ ├── page.js
│ │ │ ├── [id]/
│ │ │ │ └── page.js
│ │ │ ├── open/
│ │ │ │ └── page.js
│ │ │ └── closed/
│ │ │ └── page.js
│ │ ├── cash-operations/
│ │ │ ├── page.js
│ │ │ └── [id]/
│ │ │ └── page.js
│ │ ├── orders/
│ │ │ ├── page.js
│ │ │ └── [id]/
│ │ │ └── page.js
│ │ ├── analytics/
│ │ │ └── page.js
│ │ └── import/
│ │ └── page.js
│ └── api/ # API routes (for client-side calls)
│ └── proxy/
│ └── [...path]/
│ └── route.js
├── components/
│ ├── ui/ # Reusable UI components
│ │ ├── Button.jsx
│ │ ├── Input.jsx
│ │ ├── Card.jsx
│ │ ├── Table.jsx
│ │ ├── Modal.jsx
│ │ ├── Badge.jsx
│ │ ├── LoadingSpinner.jsx
│ │ ├── Toast.jsx
│ │ └── index.js # Barrel exports
│ ├── forms/ # Form components
│ │ ├── LoginForm.jsx
│ │ ├── RegisterForm.jsx
│ │ ├── PositionForm.jsx
│ │ ├── CashOperationForm.jsx
│ │ └── OrderForm.jsx
│ ├── layout/ # Layout components
│ │ ├── AppLayout.jsx
│ │ ├── Sidebar.jsx
│ │ ├── Header.jsx
│ │ ├── Navigation.jsx
│ │ └── ProtectedRoute.jsx
│ ├── features/ # Feature-specific components
│ │ ├── Dashboard/
│ │ │ ├── StatsCards.jsx
│ │ │ ├── PortfolioChart.jsx
│ │ │ └── RecentActivity.jsx
│ │ ├── Positions/
│ │ │ ├── PositionsList.jsx
│ │ │ ├── PositionCard.jsx
│ │ │ └── PositionDetails.jsx
│ │ ├── CashOperations/
│ │ │ ├── OperationsList.jsx
│ │ │ └── OperationCard.jsx
│ │ └── Analytics/
│ │ ├── PerformanceChart.jsx
│ │ ├── AllocationChart.jsx
│ │ └── StatsSummary.jsx
│ └── providers/ # Context providers
│ ├── AppProviders.jsx # Main providers wrapper
│ ├── AuthProvider.jsx # Authentication context
│ ├── QueryProvider.jsx # React Query provider
│ └── ToastProvider.jsx # Toast notifications
├── contexts/ # React contexts
│ ├── AuthContext.js
│ ├── ToastContext.js
│ └── ThemeContext.js
├── hooks/ # Custom hooks
│ ├── useAuth.js
│ ├── useApi.js
│ ├── useLocalStorage.js
│ ├── useDebounce.js
│ ├── queries/ # React Query hooks
│ │ ├── usePositions.js
│ │ ├── useCashOperations.js
│ │ ├── useOrders.js
│ │ └── useAnalytics.js
│ └── mutations/ # React Query mutations
│ ├── useCreatePosition.js
│ ├── useUpdatePosition.js
│ └── useDeletePosition.js
├── lib/ # Utility libraries
│ ├── api.js # HTTP client setup
│ ├── auth.js # Auth utilities
│ ├── utils.js # General utilities
│ ├── constants.js # App constants
│ ├── validations.js # Zod schemas
│ └── storage.js # LocalStorage utilities
├── styles/ # Additional styles
│ ├── components.css # Component-specific styles
│ └── utilities.css # Utility classes
