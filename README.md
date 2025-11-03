# Dev Rudra Consultancy - Insurance Policy Management System

A comprehensive Next.js application for managing insurance policies, agents, and commissions.

## Features

### 1. User Management
- **Admin Users**: Full access to all features
- **Sub-Users**: Manage consultancy operations
- Role-based access control
- Firebase Authentication

### 2. Agent Management
- Add, edit, and delete agents
- Track agent information (name, contact, address)
- View agent commission details
- Agent-specific policy tracking

### 3. Insurance Provider Management
- Manage multiple insurance providers
- Configure rates (Agent Rate, Our Rate, TDS, GST)
- Track policies by provider

### 4. Vehicle Class Management
- Define vehicle categories
- Set commission rates per vehicle class
- Configure agent and company rates

### 5. Policy Management
- Create and manage insurance policies
- Automatic commission calculations
- Track policy holders
- Vehicle information management
- Financial details (Premium, GST, TDS, Commissions)

### 6. Dashboard & Analytics
- Real-time statistics
- Total policies, active policies, agents
- Revenue and commission tracking
- Recent policies overview

### 7. Expiring Policies
- View policies expiring soon (7/15/30/60/90 days)
- Send renewal reminders to customers
- Color-coded expiry indicators

### 8. Commission Tracking
- Agent-wise commission breakdown
- Total commissions earned
- Policy-wise commission details
- Financial summaries

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: Ant Design (antd)
- **State Management**: Redux Toolkit
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Styling**: Tailwind CSS
- **Date Handling**: Day.js
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devrudra-consultancy
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using bun
bun install
```

3. Configure Firebase:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_PROJECT_ID=your-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_APP_ID=your-app-id
NEXT_PUBLIC_MEASUREMENT_ID=your-measurement-id
```

4. Run the development server:
```bash
# Using npm
npm run dev

# Using bun
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
devrudra-consultancy/
├── app/                          # Next.js app router
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (dashboard)/             # Dashboard pages
│   │   ├── agents/
│   │   ├── insurance-providers/
│   │   ├── vehicle-classes/
│   │   ├── policies/
│   │   ├── users/
│   │   ├── expiring-policies/
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── client/                       # Client-side code
│   ├── components/              # React components
│   │   ├── common/             # Reusable components
│   │   ├── forms/              # Form components
│   │   └── FirebaseAuthProvider.tsx
│   ├── icons/                   # Icon components
│   ├── services/               # API services
│   │   └── firestore.service.ts
│   └── utils/                   # Utility functions
│       └── firebase/
├── lib/                         # Library code
│   └── redux/                   # Redux store
│       ├── slices/
│       ├── constants.ts
│       ├── store.ts
│       └── ReduxClientProvider.tsx
├── typescript/                  # TypeScript definitions
│   └── types.ts
└── public/                      # Static assets
```

## Features in Detail

### Commission Calculation

The system automatically calculates:
- **Total Commission**: Based on premium amount and commission rates
- **Agent Commission**: Amount payable to the agent
- **Our Profit**: Company's profit after agent commission
- **TDS Amount**: Tax deducted at source
- **GST Amount**: Goods and Services Tax
- **Profit After TDS**: Net profit after tax deduction

Formula:
```
Agent Commission = Premium Amount × Agent Rate / 100
Our Profit = Premium Amount × Our Rate / 100
TDS Amount = Our Profit × TDS Rate / 100
GST Amount = Premium Amount × GST Rate / 100
Profit After TDS = Our Profit - TDS Amount
Gross Amount = Premium Amount + GST Amount
```

### Expiring Policy Notifications

- Automatically identifies policies expiring within configurable timeframes
- Visual indicators (red for <= 7 days, orange for <= 15 days)
- Send reminder functionality for customer follow-ups
- Helps maintain policy renewal rates

### Agent Commission Tracking

- View all policies handled by each agent
- Total commission earned per agent
- Average commission per policy
- Detailed breakdown with summary tables

## Security

- Firebase Authentication for secure login
- Token-based authentication with auto-refresh
- Protected routes with authentication middleware
- Role-based access control

## Best Practices

1. **Code Organization**: Modular and clean component structure
2. **Type Safety**: Full TypeScript support
3. **Form Validation**: Ant Design form validations
4. **State Management**: Centralized Redux store
5. **Responsive Design**: Mobile-first approach with Tailwind CSS

## Future Enhancements

- PDF generation for policies and reports
- Email/SMS notifications for expiring policies
- Advanced analytics and reporting
- Multi-language support
- Document upload for policies
- Payment tracking and integration

## License

Private & Confidential - Dev Rudra Consultancy

## Support

For support, contact the development team or create an issue in the repository.
