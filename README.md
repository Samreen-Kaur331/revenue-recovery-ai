# AI Revenue Recovery System

An AI-powered Revenue Recovery System that predicts the probability of recovering failed payments and recommends suitable recovery actions.

## Problem Statement

Failed payments can result in significant revenue loss for businesses.

Instead of treating every failed payment equally, this project uses Machine Learning to estimate the probability of payment recovery and classify failed payments into different risk levels.

Based on the predicted probability, the system recommends an appropriate recovery action.

## Solution

The system follows this workflow:

Failed Payment
       ↓
Feature Processing
       ↓
Random Forest Model
       ↓
Recovery Probability
       ↓
Risk Classification
       ↓
Recommended Action
       ↓
MySQL Database
       ↓
React Dashboard

## Features

- Failed payment analysis
- Revenue at risk calculation
- Recovery probability prediction
- Risk classification
- Recommended recovery action
- Failure reason analysis
- Payment method analysis
- Recovery results tracking
- Interactive React dashboard
- Flask REST APIs
- MySQL database integration
- AI Recovery Agent

## Machine Learning

The project uses a Random Forest Classifier.

Important features include:

- Amount
- Payment Method
- Failure Reason
- Failed Attempts
- Previous Successful Payments
- Days Since Last Payment
- Checkout Abandoned

The model predicts the probability of successful recovery.

### Risk Classification

| Recovery Probability | Risk Level | Recommended Action |
|---|---|---|
| >= 0.70 | High | Retry |
| >= 0.40 | Medium | Reminder |
| < 0.40 | Low | Stop |

## Dataset

The dataset contains 1000 payment records.

The system identifies failed payments and performs recovery analysis on them.

## Tech Stack

### Machine Learning
- Python
- Pandas
- NumPy
- Scikit-learn
- Random Forest

### Backend
- Python
- Flask
- Flask-CORS
- MySQL Connector

### Frontend
- React
- JavaScript
- Recharts
- CSS / Tailwind CSS

### Database
- MySQL
- MySQL Workbench

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/predict` | Predict recovery for one payment |
| POST | `/predict-all` | Predict all failed payments |
| GET | `/dashboard` | Dashboard statistics |
| GET | `/recovery-results` | Recovery prediction results |
| GET | `/failure-reasons` | Failure reason analysis |
| GET | `/payment-methods` | Payment method analysis |
| GET | `/model-status` | Check ML model status |
| GET | `/` | API health check |

## Project Structure

```text
AI-Revenue-Recovery/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── model/
│       └── recovery_model.pkl
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── notebooks/
│   └── 01_data_analysis.ipynb
│
├── database/
│   └── schema.sql
│
├── README.md
└── .gitignore