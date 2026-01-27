# Vega Internal Chat & Task Management System - Requirements Specification

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Target Audience:** Mobile Development Team & QC Team

---

## Document Overview

This specification document describes the requirements and implementation details of the **Vega Internal Chat & Task Management System** (Web version). The purpose is to provide:

- **For Mobile Team:** Complete technical specifications to develop iOS/Android apps with feature parity
- **For QC Team:** Comprehensive test scenarios, expected behaviors, and edge cases

---

## Table of Contents

1. [System Overview](./01-system-overview.md)
2. [Authentication & Authorization](./02-authentication.md)
3. [Chat & Messaging Features](./03-chat-messaging.md)
4. [Task Management Features](./04-task-management.md)
5. [File Management Features](./05-file-management.md)
6. [Group & Member Management](./06-group-management.md)
7. [Real-time Communication (SignalR)](./07-realtime-signalr.md)
8. [API Reference](./08-api-reference.md)
9. [Data Models](./09-data-models.md)
10. [Test Scenarios (QC)](./10-test-scenarios.md)

---

## Quick Reference

### Project Information

- **Project Name:** Quoc-Nam-Phase-1A
- **Type:** Internal Enterprise Communication & Task Management Portal
- **Primary Tech Stack:** React 19, TypeScript, SignalR, TanStack Query
- **Backend APIs:** Microservices architecture (Chat, Task, File, Identity)

### Key Features Summary

| Feature | Description | Priority |
|---------|-------------|----------|
| Real-time Messaging | Group chat with text, images, files | Critical |
| Task Management | Create, assign, track tasks with checklists | Critical |
| File Sharing | Upload, preview, watermarked thumbnails | High |
| Member Management | Add/remove members, role-based permissions | High |
| Message Pinning | Pin important messages to conversation | Medium |
| Message Starring | Star messages for personal reference | Medium |
| Typing Indicators | Real-time typing status | Low |

### User Roles

- **Admin (ADM):** System administrators - full access
- **Leader (Lead):** Team leaders - can assign tasks, monitor team
- **Staff (MBR):** Regular members - can chat and complete tasks

---

## Development Environment

### API Endpoints (Development)

- **Chat API:** `https://vega-chat-api-dev.allianceitsc.com`
- **Identity API:** `https://vega-identity-api-dev.allianceitsc.com`
- **Task API:** `https://vega-task-api-dev.allianceitsc.com`
- **File API:** `https://vega-file-api-dev.allianceitsc.com`
- **SignalR Hub:** `https://vega-chat-api-dev.allianceitsc.com/hubs/chat`

### Production Endpoints

- **Chat API:** `https://vega-chat-api-prod.allianceitsc.com`
- **Identity API:** `https://vega-identity-api-prod.allianceitsc.com`
- **Task API:** `https://vega-task-api-prod.allianceitsc.com`
- **File API:** `https://vega-file-api-prod.allianceitsc.com`
- **SignalR Hub:** `https://vega-chat-api-prod.allianceitsc.com/hubs/chat`

---

## Document Conventions

### For Mobile Developers

- All API endpoints include request/response examples
- TypeScript types are provided - can be mapped to Kotlin/Swift
- SignalR events are documented with payload structures
- Business logic and validation rules are explicitly stated

### For QC Team

- Test scenarios marked with severity: **Critical**, **High**, **Medium**, **Low**
- Expected behaviors documented for positive and negative cases
- Edge cases and error scenarios included
- Performance criteria specified where applicable

---

## Next Steps

1. **Start with:** [System Overview](./01-system-overview.md) - Understand the architecture and user flows
2. **For API Implementation:** [API Reference](./08-api-reference.md) - Complete endpoint documentation
3. **For Testing:** [Test Scenarios](./10-test-scenarios.md) - QC test cases and validation rules

---

## Document Maintenance

This document is auto-generated from the Web codebase and should be updated whenever:
- New features are added
- API contracts change
- Business rules are modified
- Bugs are discovered and fixed

**Maintainer:** Development Team
**Review Cycle:** Every sprint/release
