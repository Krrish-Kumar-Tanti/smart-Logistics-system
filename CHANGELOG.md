# Changelog

All notable changes to the VeloCity AI submission, newest first. Dates are commit dates (IST).

## 2026-11-13 — Swap Matchmaker Hardening

- Hardened `POST /api/swaps/match`, the last unguarded POST endpoint: donor coordinates, velocity, units and search radius are now validated, returning `400` instead of propagating `NaN` coordinates through the Haversine ranking (which silently matched every candidate at "NaN distance" — 29 tests).

## 2026-11-10 — API Hardening

- Hardened the triage endpoints: `POST /api/inventory/evaluate` and `POST /api/scan/shelf` now validate batch counters and edge-CV scores, returning `400` instead of silently downgrading malformed/`NaN` telemetry to a GREEN band (27 tests).

## 2026-11-08 — API Documentation

- Documented the live FSO NFI evaluation endpoint: request/response contract, `.env` template, and `curl` examples (`docs/api-examples.md`).

## 2026-11-07 — CI

- Added a GitHub Actions workflow running the VeloCity AI test suite on push (21 tests, risk engine + boundary coverage).

## 2026-11-06 — Live NFI Endpoint

- `POST /api/fso/evaluate` exposes the tri-band risk engine over the REST gateway for live FSO (Field Sales Officer) NFI evaluation.

## 2026-11-05 — Presentation Assets

- Added KPI chart assets (impact, leakage, tri-band projections), the editable PPTX deck, and chart/deck generator scripts.
- Repo hygiene: normalized trailing newlines across docs and API files.

## 2026-11-04 — Executive Suite + API Gateway

- Added the executive presentation suite (5-slide HTML → PDF), the REST API gateway scaffolding, and `docs/deliverables-guide.md`.
- Added `docs/executive-summary.md` and expanded risk-engine boundary test coverage.

## 2026-11-03 — Core Engine + Simulation

- Implemented the core tri-band risk engine, shared models (`packages/shared`), and the 40-store territory seed simulation.

## 2026-11-02 — Design + Scaffold

- Linked the Figma design file in the page map; both P01–P13 (app) and W01–W09 (web) flows are built.
- Initial repo configuration: system README (pages, architecture, risk engine, simulation strategy), OSS reference research, and project scaffold.
