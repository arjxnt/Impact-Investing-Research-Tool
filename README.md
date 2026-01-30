# Impact Investing Market Research Tool

A comprehensive platform for analyzing social impact, climate risk, and sustainability factors across investment portfolios. Designed to support deal work and portfolio company engagement with a focus on climate change risk and greenhouse gas emissions management.

## Project Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)** – Goals, user stories, functional requirements, and glossary
- **[Project Roadmap](docs/ROADMAP.md)** – Development phases, milestones, and future enhancements

## Features

### Core Capabilities
- **Portfolio Management**: Track and manage investment portfolios with detailed company information
- **Advanced Analytics**: Peer benchmarking, portfolio optimization, impact attribution, correlation analysis, and Monte Carlo simulations
- **Climate Risk Assessment**: Analyze climate-related risks and opportunities for investments
- **GHG Emissions Tracking**: Monitor and report greenhouse gas emissions across portfolio companies
- **Social Impact Analysis**: Evaluate and score social impact metrics
- **ESG Scoring**: Comprehensive Environmental, Social, and Governance assessment
- **Performance Analytics**: Track responsible investing performance over time
- **Reporting & Visualization**: Generate detailed reports and interactive dashboards

### Key Modules

1. **Investment Research Module**
   - Company profiling and due diligence support
   - Industry analysis and benchmarking
   - Impact potential assessment

2. **Climate Risk Analyzer**
   - Physical risk assessment (floods, droughts, extreme weather)
   - Transition risk analysis (policy, technology, market shifts)
   - Scenario analysis and stress testing

3. **GHG Emissions Manager**
   - Scope 1, 2, and 3 emissions tracking
   - Emissions reduction target setting
   - Carbon footprint calculation
   - Decarbonization pathway planning

4. **Social Impact Scorer**
   - SDG alignment tracking
   - Stakeholder impact assessment
   - Community development metrics
   - Employment and labor standards

5. **ESG Integration**
   - Multi-framework support (GRI, SASB, TCFD)
   - Materiality assessment
   - Risk-return analysis

6. **Advanced Analytics & Benchmarking**
   - Peer benchmarking against sector/industry averages
   - Portfolio optimization with impact-risk-return analysis
   - Impact attribution for SDG contributions
   - Correlation analysis between ESG, climate, and financial metrics
   - Monte Carlo simulations for scenario modeling

## Technology Stack

- **Backend**: Python FastAPI
- **Frontend**: React with TypeScript
- **Database**: SQLite (production-ready schema)
- **Visualization**: Chart.js, Recharts
- **Styling**: Tailwind CSS

## Installation

**⚠️ Important**: Before running the application, you need to install Python 3.9+ and Node.js 18+.

### Quick Install

**Windows:**
```cmd
install_dependencies.bat
```

**Mac/Linux:**
```bash
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### Manual Install

See [INSTALL_GUIDE.md](INSTALL_GUIDE.md) for detailed installation instructions.

### Quick Start (After Prerequisites Installed)

**Windows:**
- Run `start-backend.bat` in one terminal
- Run `start-frontend.bat` in another terminal

**Mac/Linux:**
- Run `./start-backend.sh` in one terminal
- Run `./start-frontend.sh` in another terminal

### Manual Setup

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. **Add Investments**: Import or manually add companies to your portfolio
2. **Assess Climate Risk**: Run climate risk assessments for each investment
3. **Track Emissions**: Input and monitor GHG emissions data
4. **Analyze Impact**: Review social impact scores and ESG ratings
5. **Generate Reports**: Create comprehensive reports for stakeholders

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Features in Detail

### Investment Portfolio Management
- Add, edit, and track investments with comprehensive company information
- Filter investments by sector, region, and status
- View detailed investment profiles with all associated metrics
- Track investment performance and value over time

### Climate Risk Assessment
- **Physical Risk Analysis**: Assess exposure to floods, droughts, extreme weather, sea-level rise, and heat stress
- **Transition Risk Analysis**: Evaluate policy, technology, market, and reputation risks
- **Scenario Analysis**: Model impacts under 1.5°C, 2°C, and 3°C+ scenarios
- **Risk Scoring**: Automated risk level calculation (Low, Medium, High, Critical)
- **Opportunity Identification**: Track climate adaptation and mitigation opportunities
- **Risk Management**: Document mitigation strategies and management plans

### GHG Emissions Tracking
- **Scope 1, 2, and 3 Emissions**: Comprehensive tracking of all emission scopes
- **Emissions Intensity Metrics**: Calculate per-revenue and per-employee intensity
- **Historical Trends**: Track emissions over time with trend analysis
- **Reduction Targets**: Set and monitor emissions reduction targets
- **Portfolio Aggregation**: View total portfolio emissions and breakdown by scope
- **Verification Tracking**: Record verification status and methodology

### Social Impact Analysis
- **SDG Alignment**: Track alignment with UN Sustainable Development Goals
- **Employment Metrics**: Monitor jobs created, wages, and labor standards
- **Community Impact**: Measure communities served and local procurement
- **Beneficiary Tracking**: Count beneficiaries and underserved populations reached
- **Diversity & Inclusion**: Assess gender, racial/ethnic, and leadership diversity
- **Safety & Health**: Track workplace safety scores and health programs
- **Impact Scoring**: Automated composite impact score calculation

### ESG Performance
- **Comprehensive Scoring**: Environmental, Social, and Governance pillar scores
- **Detailed Sub-scores**: Climate change, resource use, labor practices, governance structure, etc.
- **Framework Alignment**: Track GRI, SASB, and TCFD alignment
- **Material Risk Assessment**: Identify and track material ESG risks
- **Trend Analysis**: Monitor score changes over time
- **Risk-Return Integration**: Analyze ESG performance alongside financial metrics

### Analytics & Reporting
- **Portfolio Dashboard**: Real-time overview of key portfolio metrics
- **Performance Trends**: Track ESG, climate risk, and impact scores over time
- **Sector & Region Analysis**: Distribution analysis across portfolio
- **Top Performers**: Identify best-performing investments
- **Improvement Areas**: Flag investments needing attention
- **Comprehensive Reports**: Generate portfolio summary, climate risk, and impact reports

## API Endpoints

### Investments
- `GET /api/investments` - List all investments
- `POST /api/investments` - Create new investment
- `GET /api/investments/{id}` - Get investment details
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment

### Climate Risk
- `GET /api/climate-risks` - List climate risk assessments
- `POST /api/climate-risks` - Create climate risk assessment
- `GET /api/investments/{id}/climate-analysis` - Get comprehensive climate analysis

### GHG Emissions
- `GET /api/ghg-emissions` - List emissions records
- `POST /api/ghg-emissions` - Record emissions
- `GET /api/investments/{id}/emissions-summary` - Get emissions summary
- `GET /api/portfolio/emissions-dashboard` - Portfolio emissions dashboard

### Social Impact
- `GET /api/social-impacts` - List social impact assessments
- `POST /api/social-impacts` - Create social impact assessment
- `GET /api/investments/{id}/social-impact-score` - Get impact score

### ESG Scores
- `GET /api/esg-scores` - List ESG scores
- `POST /api/esg-scores` - Create/update ESG score
- `GET /api/investments/{id}/esg-analysis` - Get ESG analysis

### Analytics
- `GET /api/portfolio/analysis` - Comprehensive portfolio analysis
- `GET /api/portfolio/dashboard` - Portfolio dashboard data
- `GET /api/reports/portfolio-summary` - Portfolio summary report
- `GET /api/reports/climate-risk-report` - Climate risk report
- `GET /api/reports/impact-report` - Social impact report

## Database Schema

The application uses SQLite with the following main tables:
- `investments` - Core investment information
- `climate_risks` - Climate risk assessments
- `ghg_emissions` - Greenhouse gas emissions data
- `social_impacts` - Social impact assessments
- `esg_scores` - ESG performance scores

## Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Configuration

Before running the application, configure your environment variables:

### Quick Setup

**Option 1: Interactive Configuration (Recommended)**
```bash
cd backend
python configure_env.py
```

**Option 2: Manual Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

See [backend/ENV_CONFIGURATION.md](backend/ENV_CONFIGURATION.md) for complete documentation.

### Essential Variables

**Development (SQLite - Default):**
- No configuration needed, or set: `DATABASE_URL=sqlite:///./impact_investing.db`

**Production (PostgreSQL):**
- `DATABASE_URL=postgresql+psycopg2://user:password@host:5432/impact_investing`

## Production Deployment

### Database Setup

For production, PostgreSQL is recommended. See [backend/database_setup.md](backend/database_setup.md) for detailed instructions.

**Quick PostgreSQL Setup:**

1. Install PostgreSQL (if not already installed)
2. Run the setup script:
   - **Windows**: `backend\setup_postgres.ps1`
   - **Mac/Linux**: `bash backend/setup_postgres.sh`
3. Configure environment variables:
   ```bash
   cd backend
   python configure_env.py
   ```
   Or manually create `.env` with:
   ```env
   DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/impact_investing
   ```
4. Initialize the database: `python backend/init_db.py`

### Application Deployment

1. Set up PostgreSQL database (see above)
2. Configure environment variables in `backend/.env`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Initialize database: `python backend/init_db.py`
5. Build frontend: `cd frontend && npm run build`
6. Serve frontend build with a web server (nginx, etc.)
7. Deploy backend with a production ASGI server:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

## License

MIT

