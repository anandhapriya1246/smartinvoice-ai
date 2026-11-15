# SmartInvoice AI – Project Setup, Architecture & Development Guide

## 1. Project Overview

**Project Name:** SmartInvoice AI – AI-Powered Invoice Processing System

**Project Objective:** Build an application that automatically uploads invoices, extracts information using OCR, uses an AI/LLM to understand the extracted text, validates invoice details, and stores the structured information in a database.

### Why are we building this project?

In a traditional business process, employees manually read invoices and enter information such as:

- Invoice number
- Invoice date
- Due date
- Vendor and customer details
- Item descriptions
- Quantity and unit price
- Subtotal
- Tax
- Total amount

This process takes time and can lead to human errors.

SmartInvoice AI aims to automate this process.

### Overall application workflow

1. User uploads an invoice through the React application.
2. Node.js backend receives the request.
3. Backend communicates with the Python OCR service.
4. PaddleOCR extracts text from the invoice.
5. An LLM converts the extracted text into structured JSON.
6. Backend validates the extracted information.
7. MongoDB stores the structured invoice data.
8. React displays the extracted invoice information to the user.
9. User can review or correct information when necessary.

---

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Node.js | Backend JavaScript runtime |
| Express.js | Backend API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modelling |
| Python 3.13 | OCR service programming language |
| FastAPI | Python API framework |
| PaddlePaddle | Deep learning framework required by PaddleOCR |
| PaddleOCR | Extracts text from invoice images |
| LLM | Understands OCR text and structures invoice data |
| REST API | Communication between application services |

---

## 3. Project Folder Structure

The project is organized into separate frontend, backend, and OCR services.

```text
smartinvoice-ai/
│
├── client/                 # React frontend
│
├── server/                 # Node.js + Express backend
│   ├── config/
│   │   └── db.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── .env
│   └── server.js
│
└── ocr-service/            # Python OCR service
    ├── venv/
    ├── uploads/
    ├── main.py
    ├── ocr.py
    ├── test_ocr.py
    └── requirements.txt
```

The exact folders may grow as we add the remaining features.

---

# PART A – Initial Project Setup

## 4. Creating the React Client

**Purpose:** React is responsible for the application's user interface.

It allows users to upload invoices, view processing results, and review extracted invoice information.

### Step 1: Create the project

Open Windows PowerShell and navigate to your project location.

```powershell
cd D:\priya
```

Create a React project using Vite:

```powershell
npm create vite@latest smartinvoice-ai -- --template react
```

Navigate into the project:

```powershell
cd smartinvoice-ai
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

React development URL:

```text
http://localhost:5173
```

**Note:** These are the initial project creation commands. Since your project already exists, you do not need to create it again.

---

## 5. Creating a MongoDB Atlas Account

**Purpose:** MongoDB stores the extracted invoice information.

### Setup steps

1. Visit https://www.mongodb.com/atlas
2. Create a MongoDB Atlas account.
3. Create a project.
4. Create a database cluster.
5. Create a database user with a username and password.
6. Configure Network Access to allow your development machine.
7. Open the cluster and select Connect.
8. Select Drivers.
9. Choose Node.js.
10. Copy the MongoDB connection URI.

Example URI format:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/smartinvoice
```

Replace the username and password placeholders with your actual database credentials.

**Security:** Never share your real MongoDB password or commit it to GitHub.

---

# PART B – Node.js Backend Setup

## 6. Creating the Backend Server

**Purpose:** Node.js and Express act as the main backend of the application.

The backend receives frontend requests, coordinates the OCR service, handles AI processing, validates data, and saves information in MongoDB.

### Step 1: Create backend folder

From the project root:

```powershell
mkdir server
```

Navigate into it:

```powershell
cd server
```

Initialize Node.js:

```powershell
npm init -y
```

### Step 2: Install dependencies

```powershell
npm install express mongoose dotenv cors multer axios
```

Install Nodemon for development:

```powershell
npm install --save-dev nodemon
```

### Step 3: Create backend files

```powershell
mkdir config
mkdir models
mkdir routes
mkdir controllers
mkdir services
New-Item server.js
New-Item .env
```

### Step 4: MongoDB configuration

The `config/db.js` file is used to connect Node.js to MongoDB.

The `.env` file stores environment variables, including the database connection string.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

### Step 5: Run the backend

From the server directory:

```powershell
node server.js
```

If you configure Nodemon in `package.json`, you can use:

```powershell
npx nodemon server.js
```

Backend URL:

```text
http://localhost:5000
```

**Important:** The backend must contain an Express server and a MongoDB connection before these commands can run successfully. The `npx nodemon` command can be used without adding a package script.

---

# PART C – Python and OCR Service Setup

## 7. Installing Python 3.13

**Purpose:** Python is used for the OCR service because PaddleOCR provides image text recognition capabilities.

Initially, the installed Python version was not compatible with the PaddlePaddle package we needed.

We therefore installed Python 3.13.12 separately.

### Step 1: Download Python

Visit:

https://www.python.org/downloads/

Download Python 3.13 for Windows 64-bit.

During installation, enable the option to add Python to PATH.

### Step 2: Verify installation

Open PowerShell:

```powershell
py -3.13 --version
```

Expected output:

```text
Python 3.13.12
```

---

## 8. Creating the Python OCR Service

Navigate to your existing project:

```powershell
cd D:\priya\smartinvoice-ai
```

Create the OCR service folder if it does not already exist:

```powershell
mkdir ocr-service
```

Navigate into it:

```powershell
cd ocr-service
```

### Step 1: Create a virtual environment

```powershell
py -3.13 -m venv venv
```

**What is a virtual environment?**

A virtual environment creates an isolated Python environment for this project.

It prevents project dependencies from interfering with other Python applications on your computer.

### Step 2: Activate the virtual environment

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, use:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

You should see:

```text
(venv) PS D:\priya\smartinvoice-ai\ocr-service>
```

**Important:** `-Scope Process` applies the execution policy change only to the current PowerShell session.

### Step 3: Verify Python inside the environment

```powershell
python --version
```

Expected output:

```text
Python 3.13.12
```

---

## 9. Installing PaddlePaddle

**What is PaddlePaddle?**

PaddlePaddle is the deep learning framework used by PaddleOCR.

It provides the underlying machine-learning capabilities required to run OCR models.

Install the CPU version:

```powershell
python -m pip install paddlepaddle==3.3.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
```

Verify installation:

```powershell
python -c "import paddle; print(paddle.__version__)"
```

Expected output:

```text
3.3.0
```

---

## 10. Installing PaddleOCR

**What is PaddleOCR?**

PaddleOCR is the OCR library that recognizes text inside images and documents.

OCR stands for Optical Character Recognition.

Install PaddleOCR:

```powershell
python -m pip install paddleocr
```

Verify installation:

```powershell
python -c "from paddleocr import PaddleOCR; print('PaddleOCR installed successfully')"
```

During the first inference, PaddleOCR downloads the required OCR models.

---

## 11. Installing FastAPI and Uvicorn

**What is FastAPI?**

FastAPI is the Python framework used to expose OCR functionality through HTTP API endpoints.

**What is Uvicorn?**

Uvicorn is the ASGI server that runs the FastAPI application.

Install the required packages:

```powershell
python -m pip install fastapi "uvicorn[standard]" python-multipart
```

Package purposes:

- `fastapi` – creates API endpoints.
- `uvicorn` – runs the API server.
- `python-multipart` – supports file uploads using multipart form data.

---

# PART D – OCR Development

## 12. Creating the OCR API

Inside `ocr-service`, we created:

```text
main.py
ocr.py
test_ocr.py
uploads/
```

### main.py

This file contains the FastAPI application.

It handles:

- API requests
- Invoice file uploads
- File extension validation
- File size validation
- Empty file validation
- Saving uploaded files
- Calling the OCR service
- Returning extracted text as JSON

### ocr.py

This file contains the PaddleOCR initialization and text extraction logic.

The OCR engine is initialized with:

```python
from paddleocr import PaddleOCR

ocr_engine = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    enable_mkldnn=False
)
```

The `enable_mkldnn=False` setting was added to avoid the inference error encountered in the Windows environment.

The extraction function uses:

```python
results = ocr_engine.predict(input=image_path)
```

It then reads the recognized text from the results and returns the extracted text lines.

### test_ocr.py

This file is used to test OCR independently before integrating it with the FastAPI upload endpoint.

Run the standalone test:

```powershell
python test_ocr.py
```

The image path in the test file must point to an existing invoice image.

---

## 13. Running the FastAPI OCR Service

Make sure you are inside:

```text
D:\priya\smartinvoice-ai\ocr-service
```

Make sure the virtual environment is active:

```text
(venv)
```

Start the server:

```powershell
python -m uvicorn main:app --reload --port 8000
```

Alternative command:

```powershell
uvicorn main:app --reload --port 8000
```

We use `python -m uvicorn` because it runs Uvicorn through the currently active Python environment.

### FastAPI URLs

Main service:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

The `/docs` page is provided by FastAPI's Swagger UI.

It allows us to test API endpoints directly through the browser.

**Important:** Keep the PowerShell window running while testing the API. Press `Ctrl + C` to stop the server.

---

## 14. Uploading an Invoice Image

We created a POST endpoint:

```text
POST /upload
```

The endpoint accepts an invoice image.

Allowed extensions:

- PDF
- JPG
- JPEG
- PNG

Maximum file size:

```text
10 MB
```

The upload endpoint performs these checks:

1. Checks the file extension.
2. Reads the uploaded file.
3. Checks the file size.
4. Checks whether the file is empty.
5. Generates a unique filename using UUID.
6. Saves the file inside the `uploads` folder.
7. Sends the saved file path to the OCR function.

### Testing through Swagger

1. Open `http://localhost:8000/docs`.
2. Find the `/upload` endpoint.
3. Click `Try it out`.
4. Select an invoice image.
5. Click `Execute`.

### cURL example

```bash
curl -X 'POST' \
  'http://localhost:8000/upload' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@Professional Blue Corporate Invoice.png;type=image/png'
```

---

## 15. Extracting Invoice Text

After saving the uploaded image, FastAPI calls the OCR function.

We use:

```python
from ocr import extract_text
from fastapi.concurrency import run_in_threadpool
```

Then:

```python
extracted_text = await run_in_threadpool(
    extract_text,
    str(file_path)
)
```

We use `run_in_threadpool` because OCR inference is a blocking operation, and this helps avoid blocking FastAPI's asynchronous request handling.

The API returns:

```json
{
  "message": "Invoice uploaded and processed successfully!",
  "original_filename": "Professional Blue Corporate Invoice.png",
  "saved_filename": "unique-file-name.png",
  "size_bytes": 1336077,
  "extracted_text": [
    "Acme Corporation",
    "INV-10024",
    "Nov 14, 2026",
    "$3,503.00"
  ]
}
```

The actual response contains more extracted text lines.

### Successful result achieved

We uploaded a sample invoice and received HTTP status code:

```text
200 OK
```

PaddleOCR successfully extracted the invoice information, including:

- Vendor name
- Invoice number
- Invoice date
- Due date
- Customer name
- Item descriptions
- Subtotal
- HST
- Total due
- Payment information

This confirms that the upload and OCR extraction workflow is working.

---

# PART E – Validation and Remaining Development

## 16. Current File Validation vs Invoice Data Validation

There are two different types of validation in this application.

### A. File validation – Already implemented

The upload API currently checks:

| Validation | Status |
|---|---|
| File extension | Completed |
| File size (maximum 10 MB) | Completed |
| Empty file | Completed |
| Unique filename | Completed |

### B. Invoice data validation – Planned next

After OCR extracts the text and the LLM converts it into structured JSON, we will validate the actual invoice data.

Examples:

- Is the invoice number present?
- Is the invoice date valid?
- Is the due date valid?
- Is the vendor name present?
- Is the subtotal correct?
- Is the tax calculated correctly?
- Does subtotal plus tax equal total?
- Are required fields missing?

Example:

```text
Subtotal = 3100.00
HST      = 403.00
Total    = 3503.00

3100.00 + 403.00 = 3503.00
```

The calculation is correct.

We will implement these business validation rules after LLM integration.

---

## 17. Next Development Steps

These are the major tasks remaining to complete the application.

1. **LLM Integration**
   - Send OCR text to an LLM.
   - Extract structured invoice fields.
   - Receive JSON output.

2. **Invoice Data Validation**
   - Validate dates, amounts, tax and required fields.
   - Check subtotal and total calculations.
   - Handle missing or uncertain information.

3. **MongoDB Integration**
   - Create an invoice schema using Mongoose.
   - Save structured invoice details in MongoDB.

4. **Node.js and Python Integration**
   - Connect the Express backend to the FastAPI OCR service.
   - Send invoice files and receive OCR results.

5. **React Frontend Development**
   - Create invoice upload UI.
   - Display processing status.
   - Display extracted invoice information.

6. **Invoice Management**
   - View invoice history.
   - View individual invoice details.
   - Edit incorrect extracted fields.

7. **Testing and Deployment**
   - Test the complete application.
   - Handle errors and edge cases.
   - Deploy the frontend, backend, OCR service and database-connected application.

---

# PART F – Architecture Concepts and Their Uses

## 18. Overall Application Architecture

We are using a layered architecture with separate services for OCR processing.

### Architecture flow

```text
                 USER
                   |
                   v
           REACT FRONTEND
          Presentation Layer
                   |
                   v
         NODE.JS + EXPRESS
          API / Application Layer
                   |
          -------------------
          |                 |
          v                 v
     PYTHON OCR          MONGODB
       SERVICE            Atlas
          |
          v
       FASTAPI
          |
          v
      PADDLEOCR
          |
          v
    EXTRACTED TEXT
          |
          v
       LLM / AI
          |
          v
   STRUCTURED JSON
          |
          v
     VALIDATION
          |
          v
      MONGODB
```

The Express backend coordinates the overall workflow. MongoDB stores the final validated information.

## 19. Important Architecture Keywords

| Architecture term | Meaning | Use in this project |
|---|---|---|
| Client-Server Architecture | Separates frontend and backend responsibilities | React communicates with Node.js |
| Layered Architecture | Divides an application into logical layers | Presentation, application, processing and data layers |
| Presentation Layer | User interface layer | React frontend |
| Application Layer | Handles business operations and requests | Node.js and Express |
| Service Layer | Contains reusable business or processing logic | Invoice processing and OCR integration services |
| Data Layer | Responsible for database operations | MongoDB and Mongoose |
| Service-Oriented Design | Separates functionality into independent services | Python OCR service is separate from Node.js |
| REST API | Communication style using HTTP methods | Frontend and backend API communication |
| API Endpoint | A specific URL that performs an operation | `POST /upload`, `GET /health` |
| Middleware | Functions that run during the request-response cycle | Authentication, logging, error handling |
| Request / Response | Data sent to and returned from an API | Invoice upload and extracted JSON |
| OCR Pipeline | Sequence of steps for text recognition | Image upload → OCR → extracted text |
| Model Inference | Running a trained machine-learning model | PaddleOCR recognizes invoice text |
| LLM | Large Language Model | Understands extracted text and identifies invoice fields |
| Structured Output | Data returned in a predefined format | Invoice details in JSON |
| Data Validation | Checks whether information meets defined rules | Verify dates, totals and required fields |
| Confidence Score | Indicates how confident a model is about a prediction | Helps identify uncertain OCR results when supported by model output |
| Human-in-the-Loop | A person reviews or corrects uncertain results | User checks invoice information before final approval |

## 20. Important Architecture Distinctions

### Why use React?

React provides a component-based frontend.

It makes it easier to build reusable UI components such as:

- Upload component
- Invoice details component
- Invoice table
- Processing status component

### Why use Node.js and Express?

Node.js is the main backend runtime.

Express provides routing and middleware to manage API requests.

It coordinates communication between React, Python OCR, and MongoDB.

### Why use Python and FastAPI separately?

PaddleOCR is a Python-based OCR library.

Instead of placing OCR logic inside the Node.js backend, we expose it through FastAPI.

This keeps OCR processing separate and makes the service easier to maintain.

### Why use MongoDB?

Invoice information contains structured fields such as invoice number, dates, vendor details, line items and totals.

MongoDB stores these records as documents.

### Why use an LLM?

OCR recognizes text, but it does not automatically understand the meaning of each field.

For example, OCR may extract:

```text
Subtotal
$3,100.00
HST (13%)
$403.00
Total Due
$3,503.00
```

An LLM can interpret these lines and convert them into structured JSON.

### Why use validation?

AI-generated output should not automatically be treated as correct.

Validation checks the extracted data before it is saved or approved.

For uncertain records, a human can review and correct the information.

---

# PART G – Windows Command Reference

## 21. Commands to Run Each Service

Run each service in its own PowerShell terminal.

### Terminal 1 – React frontend

```powershell
cd D:\priya\smartinvoice-ai\client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Terminal 2 – Node.js backend

```powershell
cd D:\priya\smartinvoice-ai\server
npx nodemon server.js
```

Backend:

```text
http://localhost:5000
```

### Terminal 3 – Python OCR service

```powershell
cd D:\priya\smartinvoice-ai\ocr-service
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

OCR service:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

**Remember:** The execution policy command is only needed when PowerShell blocks activation. It is scoped to the current terminal session.

---

## 22. Useful Windows and Python Commands

| Command | Purpose |
|---|---|
| `cd foldername` | Navigate into a folder |
| `cd ..` | Move one directory backward |
| `dir` | List files and folders |
| `mkdir foldername` | Create a folder |
| `New-Item filename` | Create a file |
| `npm install` | Install Node.js dependencies |
| `npm run dev` | Start the configured frontend development server |
| `node server.js` | Run the Node.js server |
| `npx nodemon server.js` | Run Node.js with automatic restart |
| `py -3.13 --version` | Check Python 3.13 installation |
| `py -3.13 -m venv venv` | Create a Python virtual environment |
| `.\venv\Scripts\Activate.ps1` | Activate the environment in PowerShell |
| `deactivate` | Exit the Python virtual environment |
| `python -m pip install package-name` | Install a Python package |
| `python -m pip list` | List installed Python packages |
| `python test_ocr.py` | Run the OCR test |
| `python -m uvicorn main:app --reload --port 8000` | Start FastAPI |
| `Ctrl + C` | Stop the running server |

---

## 23. Final Project Summary

SmartInvoice AI is an AI-powered document processing application.

It combines frontend development, backend development, database management, OCR, and LLM-based information extraction.

The key idea is to automate the invoice processing workflow:

**Upload → Extract → Understand → Validate → Store → Display**

The application demonstrates how multiple technologies can work together in a real-world business use case.

It also demonstrates important software engineering concepts:

- Full-stack application development
- Client-server architecture
- Layered architecture
- REST API integration
- Separate service design
- Database integration
- AI-assisted data extraction
- Business rule validation
- Error handling
- Human review

**Current achievement:** The Python OCR service is running, the invoice upload API returns HTTP 200, and PaddleOCR successfully extracts text from the sample invoice.

**Next milestone:** Integrate an LLM to convert the extracted invoice text into structured JSON.

