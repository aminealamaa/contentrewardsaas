# Content Rewards SaaS

A platform that connects creators with clippers, allowing creators to reward community members for promoting their content through social media clips.

## 🌟 Features

### For Creators
- Create and manage campaigns
- Upload content videos
- Set reward rates per 1,000 views
- Set campaign budgets
- Track submissions and performance

### For Clippers
- Browse available campaigns
- Download and create clips
- Submit work with proof
- Track earnings and submission status
- View payout history

### For Admins
- Review all submissions
- Approve or reject submissions
- Mark payments as completed
- View platform statistics

## 🧩 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (for screenshots)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🗃️ Database Schema

### Tables

#### users
- `id` (UUID, primary key)
- `email` (string)
- `role` (enum: 'creator', 'clipper', 'admin')
- `created_at` (timestamp)

#### campaigns
- `id` (UUID, primary key)
- `creator_id` (UUID, foreign key to users)
- `title` (string)
- `description` (text)
- `video_url` (string)
- `reward_per_1000` (decimal)
- `budget` (decimal)
- `remaining_budget` (decimal)
- `status` (enum: 'active', 'paused')
- `created_at` (timestamp)

#### submissions
- `id` (UUID, primary key)
- `clipper_id` (UUID, foreign key to users)
- `campaign_id` (UUID, foreign key to campaigns)
- `platform` (string)
- `video_link` (string)
- `view_count` (integer)
- `screenshot_url` (string)
- `status` (enum: 'pending', 'approved', 'rejected')
- `payout_amount` (decimal)
- `is_paid` (boolean)
- `created_at` (timestamp)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd contentrewardsaas
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('creator', 'clipper', 'admin')) DEFAULT 'clipper',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  reward_per_1000 DECIMAL(10,2) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  remaining_budget DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clipper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  video_link TEXT NOT NULL,
  view_count INTEGER NOT NULL,
  screenshot_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  payout_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_submissions_clipper_id ON submissions(clipper_id);
CREATE INDEX idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage their campaigns" ON campaigns
  FOR ALL USING (auth.uid() = creator_id);

-- Submissions policies
CREATE POLICY "Clippers can view their submissions" ON submissions
  FOR SELECT USING (auth.uid() = clipper_id);

CREATE POLICY "Clippers can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = clipper_id);

CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

### 5. Set Up Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `screenshots`
3. Set the bucket to public
4. Add the following storage policy:

```sql
-- Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

-- Allow public access to screenshots
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');
```

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Pages & Routes

### Public Pages
- `/` - Landing page
- `/explore` - Browse available campaigns
- `/submit` - Submit work form
- `/auth` - Authentication page

### Authenticated Pages
- `/dashboard` - Redirects based on user role
- `/dashboard/creator` - Creator dashboard
- `/dashboard/clipper` - Clipper dashboard
- `/admin` - Admin dashboard

## 🔐 Authentication

The app uses Supabase Auth with the following features:
- Email/password authentication
- Google OAuth
- Role-based access control (creator, clipper, admin)
- User metadata for role storage

## 🎨 UI Components

The app uses a custom component library built with:
- TailwindCSS for styling
- Lucide React for icons
- Custom Button and Input components
- Responsive design

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔮 Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- Payment integration (Stripe, PayPal)
- Mobile app
- API for third-party integrations
- Advanced filtering and search
- Bulk operations for admins
- Email notifications
- Social media integration #   c o n t e n t r e w a r d s a a s  
 