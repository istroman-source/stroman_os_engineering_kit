# Reference Architecture

```mermaid
graph TD
  UI[Next.js Web Application] --> APP[Application Services]
  APP --> AUTH[Authorization Service]
  APP --> DB[(PostgreSQL)]
  APP --> JOBS[Job Queue]
  APP --> STORE[Storage Adapter]
  JOBS --> AI[AI Provider Adapters]
  JOBS --> EXT[External Integration Adapters]
  APP --> SEARCH[Search Service]
  AI --> RUNS[Versioned Analysis Runs]
  RUNS --> EVIDENCE[Evidence References]
  EVIDENCE --> DB
```

## Dependency rule
Domain modules do not import provider SDKs. Adapters implement contracts owned by the application or domain boundary. UI code does not perform authorization decisions.

## Initial deployment
A modular monolith is preferred for the MVP: one Next.js application, one worker process, PostgreSQL, object storage, and a queue. Extract services only after measured pressure.
