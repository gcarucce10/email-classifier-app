# Email Classification and Automatic Response Application

## 📋 General Description
Full stack web application to automate reading, classification, and response suggestions for emails in the categories **Productive** and **Unproductive**. Uses NLP, Google Gemini, Flask (backend), and Next.js/React (frontend). Includes tests with real email examples.

---

## Context
Solution for companies, teams, or professionals dealing with a large volume of emails, automating triage and responses.

---

## Classification Categories
- **Productive:** Requires urgent action or response (e.g., requests, questions, updates).
- **Unproductive:** Does not require immediate action (e.g., congratulations, thank-you notes).

---

## Overview
Flask backend receives, preprocesses, and classifies emails, suggesting automatic responses via AI (Google Gemini). Next.js/React frontend provides a modern interface for sending, viewing, editing, and copying responses.

---

## Main Flows
1. User login and registration
1. Email submission (text or .txt/.pdf file)
2. Preprocessing (tokenization, stopwords, lemmatization)
3. Classification via Gemini (Productive/Unproductive + confidence)
4. Automatic response suggestion
5. Interaction: copy and edit response
6. Integrated email sending
7. Automatic classification of the user’s inbox

---

## Technologies
- **Backend:** Flask (Python Server), pdfminer.six, NLTK, spaCy
- **Database:** PostgreSQL (Data persistence), Flask-SQLAlchemy (Flask-Migrate for migrations)
- **AI/ML:** Google Gemini API (gemini-1.5-flash)
- **Frontend:** React, Next.js, TailwindCSS
- **Tests:** Real cases in `casos_de_teste/`

---

## How to Run
1. Clone the repository:
  ```bash
  git clone https://github.com/gcarucce10/email-classifier-app.git
  cd email-classifier-app
  ```
2. Create a Python virtual environment:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```
3. Install backend dependencies:
  ```bash
  pip install -r requirements.txt
  python -m spacy download pt_core_news_md
  ```
4. Start the project:
  ```bash
  ./start.sh
  ```
  Access locally at: http://localhost:3000

  Note: Environment variables must be configured for the Google Gemini API and other required credentials (e.g., email for password recovery and database connection). In a future update, deployment will be provided and this section may be disregarded.

> Node.js is required for the frontend to work.

---

## Project Structure
```
backend/
  app.py                # Main Flask backend
  gemini_client.py      # Google Gemini API integration
  preprocess.py         # Text preprocessing functions
  models.py             # Database entity models
  templates/            # HTML templates (Flask, backend testing)
  requirements.txt      # Python requirements
frontend/
  src/app/page.tsx      # Main Next.js/React page
  ...                   # Other frontend files (pages/components)
test_cases/             # Backend test cases (files)
  improdutivo.pdf       # Example of unproductive email in .pdf
  ...                   # Other test cases
README.md
start.sh                # Startup script
```
---


## Additional Features

- **Login:**
  - The application provides a dedicated login page, allowing users to authenticate securely.
  - Access to main features is restricted to authenticated users, ensuring privacy and usage control.

- **User Registration:**
  - Users must register on the platform to access services.
  - Registration includes name, email, password, and Gmail app password.

- **Password Recovery (Forgot Password):**
  - The application offers a password recovery feature, allowing users to request a reset via email if they forget their password.
  - The process is secure and follows best authentication practices.

- **Responses Page:**
  - After classification, users can view the suggested response, edit the text as needed, and copy it for external use.
  - A history of responses is displayed, making it easy to track interactions.

- **Integrated Email Sending:**
  - On the Responses page, the application allows direct email sending from the interface, using the generated or customized response.
  - Emails can be sent to specified recipients, integrating the classification and response flow with real communication.

- **Automatic Inbox Classification:**
  - The application can access the user's inbox (registered email address), automatically classifying received emails. This eliminates the manual work of pasting text or attaching files.

These features make the system complete for corporate use, integrating automation, response management, communication, security, and data control in a single platform.

---

