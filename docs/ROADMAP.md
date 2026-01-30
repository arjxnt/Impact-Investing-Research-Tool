# Project Roadmap
## Impact Investing Market Research Tool

**Last Updated:** January 2025  
**View on GitHub:** [docs/ROADMAP.md](https://github.com/arjxnt/Impact-Investing-Research-Tool/blob/main/docs/ROADMAP.md)

---

## Overview

This roadmap outlines the development phases, milestones, and future enhancements for the Impact Investing Market Research Tool. Phases are organized by priority and dependencies.

---

## Phase 1: Foundation ✅ COMPLETE

**Timeline:** Completed  
**Focus:** Core platform, data model, and essential features

### Milestones
- [x] **M1.1** – Backend API (FastAPI) with CRUD for investments, climate risks, emissions, social impact, ESG
- [x] **M1.2** – Database schema (SQLite/PostgreSQL) with migrations
- [x] **M1.3** – Frontend (React + TypeScript) with routing and layout
- [x] **M1.4** – Investment management (add, edit, delete, list, detail view)
- [x] **M1.5** – Climate Risk page and assessment forms
- [x] **M1.6** – GHG Emissions page and tracking
- [x] **M1.7** – Social Impact page and scoring
- [x] **M1.8** – ESG page and scoring
- [x] **M1.9** – Portfolio Dashboard with key metrics
- [x] **M1.10** – Reports (portfolio summary, climate risk, impact)
- [x] **M1.11** – Seed data and Add Investment modal

### Deliverables
- Working full-stack application
- API documentation at `/docs`
- Setup and install scripts for Windows/Mac/Linux

---

## Phase 2: Analytics & Collaboration ✅ COMPLETE

**Timeline:** Completed  
**Focus:** Advanced analytics, collaboration, and data import

### Milestones
- [x] **M2.1** – Analytics page with charts and trends
- [x] **M2.2** – Peer benchmarking service
- [x] **M2.3** – Impact attribution and portfolio optimization
- [x] **M2.4** – Correlation analysis and Monte Carlo simulations
- [x] **M2.5** – Data import (CSV/Excel) for bulk entry
- [x] **M2.6** – User authentication (login/logout)
- [x] **M2.7** – Comments on investments
- [x] **M2.8** – Task management
- [x] **M2.9** – Audit log
- [x] **M2.10** – Version history
- [x] **M2.11** – Notification services

### Deliverables
- Analytics and benchmarking capabilities
- Collaboration features (comments, tasks, audit, version history)
- Data import modal and backend support

---

## Phase 3: Production Readiness & Polish 🔄 IN PROGRESS

**Timeline:** Q1–Q2 2025  
**Focus:** Deployment, stability, and UX refinement

### Milestones
- [ ] **M3.1** – Environment configuration wizard (interactive `configure_env.py`)
- [ ] **M3.2** – PostgreSQL production setup scripts and documentation
- [ ] **M3.3** – Comprehensive validation rules and error handling
- [ ] **M3.4** – API integration framework for external data providers
- [ ] **M3.5** – Report generation with configurable frequency
- [ ] **M3.6** – Loading and empty states across all pages
- [ ] **M3.7** – Responsive design polish for tablet/mobile
- [ ] **M3.8** – End-to-end and integration tests

### Deliverables
- Production deployment guide
- Stable, validated data flows
- Improved UX and error handling

---

## Phase 4: Enhanced Analytics & Reporting 📋 PLANNED

**Timeline:** Q2–Q3 2025  
**Focus:** Deeper analytics and reporting capabilities

### Milestones
- [ ] **M4.1** – Custom report templates
- [ ] **M4.2** – Export reports to PDF/Excel
- [ ] **M4.3** – Advanced scenario analysis (1.5°C, 2°C, 3°C+) with visualizations
- [ ] **M4.4** – Decarbonization pathway planning
- [ ] **M4.5** – Portfolio-level Monte Carlo UI
- [ ] **M4.6** – Peer benchmarking visualizations
- [ ] **M4.7** – Trend analysis and forecasting

### Deliverables
- Rich reporting and export options
- Scenario modeling UI
- Enhanced analytics visualizations

---

## Phase 5: Integrations & Scale 📋 PLANNED

**Timeline:** Q3–Q4 2025  
**Focus:** External integrations and scalability

### Milestones
- [ ] **M5.1** – ESG data provider integrations (e.g., MSCI, Sustainalytics)
- [ ] **M5.2** – Climate data API integrations
- [ ] **M5.3** – Multi-tenant / organization support
- [ ] **M5.4** – Role-based access control (RBAC)
- [ ] **M5.5** – Scheduled report generation and email delivery
- [ ] **M5.6** – Performance optimization for large portfolios (500+ investments)

### Deliverables
- Data provider integrations
- Multi-tenant architecture
- RBAC and scheduled reports

---

## Phase 6: Future Enhancements 💡 BACKLOG

**Timeline:** TBD  
**Focus:** Optional advanced features

### Ideas
- Mobile-responsive PWA
- Custom SDG weighting and scoring
- LP portal for limited partners
- Regulatory mapping (SFDR, EU Taxonomy)
- Natural language query for portfolio insights
- Integration with deal flow / CRM tools

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Phase complete |
| 🔄 | In progress |
| 📋 | Planned |
| 💡 | Backlog / ideas |

---

## How to Contribute

1. Review the [PRD](./PRD.md) for requirements context
2. Pick a milestone from the current or next phase
3. Open an issue or PR against the [GitHub repository](https://github.com/arjxnt/Impact-Investing-Research-Tool)
4. Update this roadmap when milestones are completed

---

## Links

- **Repository:** https://github.com/arjxnt/Impact-Investing-Research-Tool
- **PRD:** [docs/PRD.md](https://github.com/arjxnt/Impact-Investing-Research-Tool/blob/main/docs/PRD.md)
- **README:** [README.md](https://github.com/arjxnt/Impact-Investing-Research-Tool/blob/main/README.md)
