# REAL ESTATE INTELLIGENCE TAXONOMY
## Comprehensive Document Classification System

**Version:** 1.0  
**Status:** ACTIVE  
**Last Updated:** December 11, 2025  

---

## CLASSIFICATION HIERARCHY

### CATEGORY A: PROPERTY DOCUMENTS
#### A.1 Property Information Documents
- A.1.1 - Property Listing Sheet (MLS)
- A.1.2 - Property Appraisal Report
- A.1.3 - Property Inspection Report
- A.1.4 - Property Valuation Analysis
- A.1.5 - Comparative Market Analysis (CMA)

#### A.2 Property Images & Media
- A.2.1 - Property Photos (exterior)
- A.2.2 - Property Photos (interior)
- A.2.3 - Property Floor Plans
- A.2.4 - Drone Footage / Virtual Tour
- A.2.5 - Property Video Walkthrough

#### A.3 Title & Ownership Documents
- A.3.1 - Deed
- A.3.2 - Title Report
- A.3.3 - Lien Documents
- A.3.4 - HOA Documents
- A.3.5 - Ownership History

#### A.4 Property Condition Documents
- A.4.1 - Home Inspection Report
- A.4.2 - Pest Inspection Report
- A.4.3 - Foundation Report
- A.4.4 - Radon Test Report
- A.4.5 - Environmental Report

#### A.5 Permits & Compliance
- A.5.1 - Building Permits
- A.5.2 - Certificate of Occupancy
- A.5.3 - Compliance Certificates
- A.5.4 - Zoning Documents
- A.5.5 - HOA Compliance Letters

---

### CATEGORY B: TRANSACTION DOCUMENTS
#### B.1 Offer & Contract Documents
- B.1.1 - Purchase Agreement
- B.1.2 - Offer Letter
- B.1.3 - Counteroffer
- B.1.4 - Contract Amendment
- B.1.5 - Contingency Waiver

#### B.2 Financial Documents
- B.2.1 - Loan Estimate
- B.2.2 - Loan Approval Letter
- B.2.3 - Underwriting Conditions
- B.2.4 - Clear-to-Close Letter
- B.2.5 - Closing Disclosure

#### B.3 Escrow & Closing Documents
- B.3.1 - Earnest Money Receipt
- B.3.2 - Closing Cost Estimate
- B.3.3 - Title Insurance Commitment
- B.3.4 - Closing Statement
- B.3.5 - Settlement Statement

#### B.4 Post-Closing Documents
- B.4.1 - Recorded Deed
- B.4.2 - Title Insurance Policy
- B.4.3 - Closing Checklist
- B.4.4 - Warranty Documents
- B.4.5 - Keys & Access Documentation

---

### CATEGORY C: PROSPECT & LEAD DOCUMENTS
#### C.1 Lead Information
- C.1.1 - Lead Profile
- C.1.2 - Prospect Questionnaire
- C.1.3 - Buyer/Seller Assessment
- C.1.4 - Financial Prequalification
- C.1.5 - Preference Assessment

#### C.2 Communication Records
- C.2.1 - Email Correspondence
- C.2.2 - SMS Communication Log
- C.2.3 - Call Transcripts
- C.2.4 - Meeting Notes
- C.2.5 - Follow-up Records

#### C.3 Conversion Documents
- C.3.1 - Signed Agency Agreement
- C.3.2 - Buyer Representation Agreement
- C.3.3 - Seller Listing Agreement
- C.3.4 - Commission Agreement
- C.3.5 - Engagement Confirmation

---

### CATEGORY D: ANALYSIS & INTELLIGENCE DOCUMENTS
#### D.1 Market Analysis
- D.1.1 - Market Trend Report
- D.1.2 - Competitor Analysis
- D.1.3 - Price Trend Analysis
- D.1.4 - Investment Property Analysis
- D.1.5 - Market Forecast

#### D.2 Predictive Documents
- D.2.1 - Lead Conversion Prediction
- D.2.2 - Property Price Prediction
- D.2.3 - Market Timing Recommendation
- D.2.4 - Investment ROI Analysis
- D.2.5 - Churn Risk Assessment

#### D.3 Performance Analytics
- D.3.1 - Agent Performance Report
- D.3.2 - Pipeline Analysis
- D.3.3 - Revenue Attribution Report
- D.3.4 - Cost Analysis
- D.3.5 - KPI Dashboard

---

### CATEGORY E: COMPLIANCE & GOVERNANCE DOCUMENTS
#### E.1 Regulatory Documents
- E.1.1 - Disclosure Forms
- E.1.2 - Fair Housing Compliance
- E.1.3 - Privacy Policy Acknowledgment
- E.1.4 - Consent Forms
- E.1.5 - Regulatory Filing

#### E.2 Audit & Compliance
- E.2.1 - Audit Trail Log
- E.2.2 - Compliance Checklist
- E.2.3 - Data Privacy Audit
- E.2.4 - Security Audit
- E.2.5 - Compliance Report

#### E.3 Governance
- E.3.1 - Access Control Log
- E.3.2 - User Permission Matrix
- E.3.3 - Change Log
- E.3.4 - System Health Report
- E.3.5 - Incident Report

---

### CATEGORY F: INTERNAL SYSTEM DOCUMENTS
#### F.1 Configuration & Setup
- F.1.1 - System Configuration Document
- F.1.2 - API Configuration
- F.1.3 - Database Schema
- F.1.4 - Integration Configuration
- F.1.5 - Security Configuration

#### F.2 Operational Documents
- F.2.1 - Runbook
- F.2.2 - Troubleshooting Guide
- F.2.3 - Operation Manual
- F.2.4 - Maintenance Schedule
- F.2.5 - Disaster Recovery Plan

#### F.3 Developer Documentation
- F.3.1 - API Documentation
- F.3.2 - Code Documentation
- F.3.3 - Architecture Diagram
- F.3.4 - Data Model
- F.3.5 - Integration Guide

---

## DOCUMENT STATE CLASSIFICATION

### STATE S: DOCUMENT STATES
- S.0 - DRAFT (Under creation, not final)
- S.1 - ACTIVE (Current, in use)
- S.2 - ARCHIVED (Historical, no longer active)
- S.3 - OBSOLETE (Superseded by newer version)
- S.4 - PENDING (Awaiting approval/signature)
- S.5 - EXECUTED (Signed/approved)

---

## DOCUMENT ID NUMBERING SYSTEM

### Format: `[CATEGORY]-[SUBCATEGORY]-[ITEM]-[VERSION]-[STATE]`

**Example:** `A.1.1-v2.3-S.1`
- Category: A (Property Documents)
- Subcategory: 1 (Property Information)
- Item: 1 (Property Listing Sheet)
- Version: 2.3 (2nd major, 3rd minor)
- State: S.1 (Active)

### Naming Convention:
```
A.1.1_PropertyListingSheet_MLS_v2.3_ACTIVE.pdf
├─ Category-Subcategory-Item: A.1.1
├─ Human Name: PropertyListingSheet_MLS
├─ Version: v2.3
└─ State: ACTIVE
```

---

## METADATA FIELDS FOR ALL DOCUMENTS

```json
{
  "documentId": "A.1.1-v2.3-S.1",
  "classification": "A.1.1",
  "categoryName": "Property Information Documents",
  "documentName": "Property Listing Sheet (MLS)",
  "version": "2.3",
  "state": "S.1",
  "created": "2025-12-01T10:00:00Z",
  "modified": "2025-12-11T14:30:00Z",
  "creator": "system",
  "owner": "real-estate-team",
  "format": "pdf",
  "fileSize": 2048000,
  "pages": 15,
  "relatedDocuments": ["A.1.2", "A.3.1", "B.1.1"],
  "tags": ["mls", "listing", "property", "active"],
  "retentionDays": 2555,
  "archived": false,
  "encrypted": true,
  "confidential": true,
  "auditTrail": []
}
```

---

## DOCUMENT LIFECYCLE

```
CREATION (D-CREATE)
    ↓
INGESTION (D-INGEST)
    ↓
INDEXING (D-INDEX)
    ↓
TRANSFORMATION (D-TRANSFORM)
    ↓
EVOLUTION (D-EVOLVE)
    ↓
SYNCHRONIZATION (D-SYNC)
    ↓
ARCHIVAL/DELETION
```

---

## INTEGRATION POINTS

### CRM Integration (Category B, C)
- Salesforce lead objects
- Deal pipeline tracking
- Activity logging

### Analytics Integration (Category D)
- BigQuery data warehouse
- ML model training
- Report generation

### Compliance Integration (Category E)
- Audit logging
- Security monitoring
- Regulatory tracking

### Storage Integration (All)
- Google Cloud Storage
- Document versioning
- Encryption & backup

---

## RETENTION SCHEDULES

| Category | Retention Period | Notes |
|----------|------------------|-------|
| A - Property | 7 years | Legal requirements |
| B - Transaction | 10 years | Financial & legal |
| C - Lead | 2 years | Lead generation |
| D - Analysis | 1 year | Historical reference |
| E - Compliance | 7 years | Regulatory requirement |
| F - System | 90 days | Operational logs |

---

## DOCUMENT ARCHIVAL POLICY

- **ACTIVE:** Documents in current use (S.1)
- **ARCHIVE:** Move to cold storage after retention period
- **DELETE:** Purge after legal hold period expires
- **IMMUTABLE:** All archived docs signed with hash for integrity

---

**This taxonomy ensures consistent document management across the enterprise system.**
