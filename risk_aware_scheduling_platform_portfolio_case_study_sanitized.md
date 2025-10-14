# Risk‑Aware Scheduling Platform (MVP)
**Role:** Architecture + Product Management + Project Management  
**Timeframe:** 2025  
**Scope:** MVP for a web platform that combines deterministic scheduling with stochastic risk analytics for project plans.

> This case study is intentionally sanitized. It presents approach, decisions, and outcomes without disclosing proprietary internals or vendor specifics.

---

## Problem
Organizations plan in classic Gantt tools but struggle to quantify schedule risk. Leaders want:  
- A clear baseline schedule  
- Visual risk overlays (e.g., P80 dates, variance bands)  
- Simple UX that supports phase/milestone visibility and critical path focus

**Constraints:** small team, fast demo timeline, zero‑touch hosting, export‑ready visuals.

---

## Solution Overview
A web application that:
- Captures projects and tasks (durations, dependencies, completion status)
- Computes a deterministic baseline (CPM)
- Runs probabilistic risk analysis (e.g., Monte Carlo, diffusion‑style overlays)  
- Renders a clean Gantt with phases/milestones and optional critical‑path highlighting

### High‑Level Architecture (C4 L1–L2 simplified)
```
User → Web App (React/TypeScript)
          ↕ HTTPS/JSON
      Backend API (orchestration, validation)
          ↕ Data persistence
        Database (projects, results)
          ↕ External Engines (baseline calc + analytics)
```
**Notes:**
- Stateless services for easy horizontal scaling
- Async jobs for longer analytics, with simple polling UI
- Read‑through cache for repeated analytics with identical inputs

---

## Key Decisions
- **MVP‑first**: minimize dependencies, keep containers stateless, push heavy compute to external engines.
- **Schema discipline**: separate **user input** (tasks) from **calculated results** (baseline, analytics).  
- **Visualization standards**: consistent task schema across all analytics overlays.  
- **UX choices**: phase banding, milestone markers, restrained critical path line (no visual clutter).  
- **Exportability**: predictable DOM/CSS to allow high‑quality chart exports.

---

## Results (MVP metrics)
- Project load: ~<2s for typical plans (10–50 tasks)  
- Baseline calculation: typically <3s  
- Analytics run: returns first status in ~2s; cache hits render instantly  
- Demo conversion: supports stakeholder walk‑through from project edit → baseline → analytics → export

*(Figures are directional and environment‑dependent.)*

---

## Roadmap (select highlights)
- **Now:** MVP demo, feedback loop, usability polish (task editing + overlays)  
- **Next:** real‑time progress updates for analytics; configurable phase rolls‑up; lightweight auth for trials  
- **Later:** advanced caching and collaboration features; multi‑project views; role‑based access

---

## My Contributions
- **Architecture:** defined layered design, component responsibilities, and async analytics approach  
- **Product:** built MVP scope, sequencing, and acceptance criteria; prioritized demo‑critical UX  
- **PM:** backlog, risk log, and decision records; coordinated iterations across UI and engines  
- **Delivery:** standardized data schema; implemented normalized overlays; ensured export‑friendly Gantt

---

## Lessons Learned
- Keep analytics overlays visually consistent and minimal; reduce cognitive load.  
- Normalize **once** at orchestration boundaries; it pays off across charts and views.  
- Make caching explicit in the product story (faster demos, repeatability) without exposing internals.

---

## Public‑Safe Disclosure Rules (applied here)
- No concrete endpoint names, code snippets, or vendor IDs  
- No infrastructure screenshots or credentials  
- Generalize technology references; avoid version pinning  
- Present approximate performance envelopes, not benchmarks  
- Describe patterns (e.g., read‑through cache) without keys or TTL specifics

---

## One‑pager Visual Aid (verbal)
**Slide 1:** Problem → Solution → Outcomes  
**Slide 2:** Simplified C4 (context + containers)  
**Slide 3:** Gantt with phase bands + milestone markers + subtle critical path  
**Slide 4:** Risk overlays (P80 markers) and takeaways  
**Slide 5:** Roadmap + my role

