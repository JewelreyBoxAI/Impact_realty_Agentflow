# Impact Realty AI - Quick Start Guide

Get your multi-agent real estate platform up and running in minutes.

## 🚀 Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Supabase account** (free tier available)
- **OpenAI API key** (required for agents)
- **Git** for cloning the repository

## 📋 Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Impact2_redux

# Create Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

## 🔧 Step 2: Environment Configuration

### Backend Configuration

1. Copy the environment template:
```bash
cd backend
cp env.example .env
```

2. Edit `.env` with your configuration:

```env
# Required - Get from OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required - Create Supabase project at https://supabase.com
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Required - Generate a secure secret
SECRET_KEY=your-super-secret-key-change-this-in-production

# Optional - For production integrations
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token

BROKER_SUMO_API_KEY=your-broker-sumo-api-key

# Demo Mode (recommended for first run)
MOCK_MODE=true
```

### Frontend Configuration

1. Create frontend environment file:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🗄️ Step 3: Database Setup

### Option A: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to **SQL Editor**
4. Run the following SQL to create tables:

```sql
-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    company_id UUID,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) DEFAULT 'real_estate',
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    system_prompt TEXT,
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID,
    status VARCHAR(50) DEFAULT 'running',
    input_data JSONB,
    output_data JSONB,
    steps JSONB DEFAULT '[]',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    executed_by UUID REFERENCES users(id)
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    experience_years INTEGER,
    current_company VARCHAR(255),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    value DECIMAL(15,2),
    commission DECIMAL(15,2),
    property_address TEXT,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closing_date DATE
);

-- Health check table
CREATE TABLE IF NOT EXISTS health_check (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'healthy',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy');
```

### Option B: Python Script (Alternative)

```bash
cd backend
python scripts/init_database.py
```

## 🏃‍♂️ Step 4: Start the Application

### Start Backend (Terminal 1)

```bash
cd backend
# Make sure virtual environment is activated
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.3s
```

## 🎯 Step 5: Verify Installation

### Check Backend Health

Open your browser and visit:
- **API Health**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **System Status**: http://localhost:8000/api/v1/status

You should see JSON responses indicating the system is healthy.

### Check Frontend

Visit: http://localhost:3000

You should see the Impact Realty AI dashboard with:
- ✅ System status indicators
- 📊 Metrics cards
- 🤖 Agent status cards
- 📋 Workflow information

## 🧪 Step 6: Test the Platform

### Test Agent Execution

1. **Via API** (using curl or Postman):
```bash
curl -X POST http://localhost:8000/api/v1/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_type": "source_candidates",
    "params": {
      "job_requirements": {
        "experience_years": 3,
        "location": "Miami, FL"
      }
    }
  }'
```

2. **Via Frontend**: Click "Run Workflow" button on the dashboard

### Expected Response

```json
{
  "success": true,
  "workflow_id": "uuid-here",
  "status": "completed",
  "result": {
    "recruiting": {
      "success": true,
      "candidates_found": 2,
      "candidates": [...]
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**1. Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check environment variables
python -c "from core.config import settings; print('Config loaded successfully')"
```

**2. Database connection issues**
- Verify Supabase URL and keys in `.env`
- Check Supabase project is active
- Ensure tables are created (Step 3)

**3. Frontend build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

**4. Agent execution fails**
- Verify OpenAI API key is valid
- Check `MOCK_MODE=true` for testing without real integrations
- Review logs in terminal for specific errors

### Debug Mode

Enable detailed logging:

```env
# In backend/.env
DEBUG=true
LOG_LEVEL=DEBUG
```

## 🚀 Next Steps

### 1. Configure Real Integrations

Once basic setup works, configure real integrations:

```env
# Disable mock mode
MOCK_MODE=false

# Add real API keys
ZOHO_CLIENT_ID=your-real-zoho-client-id
BROKER_SUMO_API_KEY=your-real-broker-sumo-key
```

### 2. Customize Agents

Edit agent prompts and configurations:
- Backend: `backend/core/config.py` → `AgentConfig` class
- Frontend: Agent management interface (coming soon)

### 3. Add Custom Workflows

Create new workflows in:
- `backend/agents/supervisor.py` → Add new workflow types
- Frontend workflow builder (coming soon)

### 4. Deploy to Production

See `DEPLOYMENT.md` for production deployment guides:
- Docker containerization
- Cloud deployment (AWS, GCP, Azure)
- Environment-specific configurations

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Architecture Overview**: `README.md`
- **Agent Configuration**: `backend/core/config.py`
- **Frontend Components**: `frontend/components/`

## 🆘 Getting Help

If you encounter issues:

1. **Check logs** in both terminal windows
2. **Verify environment variables** are set correctly
3. **Test API endpoints** individually using the docs at `/docs`
4. **Review database tables** in Supabase dashboard

## 🎉 Success!

If you can see the dashboard and execute workflows, you're ready to start building with Impact Realty AI!

The platform is now running with:
- ✅ Multi-agent orchestration via LangGraph
- ✅ Supabase database integration
- ✅ Modern React frontend
- ✅ MCP-based integrations (mock mode)
- ✅ Real-time agent monitoring

Happy building! 🚀 