import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select an invoice first.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadMessage('File size must not exceed 10 MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setIsUploading(true)
      setUploadMessage('Uploading invoice...')

      const response = await fetch(
        'http://localhost:5000/api/invoices/upload',
        {
          method: 'POST',
          body: formData
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Invoice upload failed.')
      }

      setUploadMessage(result.message)

    } catch (error) {
      setUploadMessage(error.message)

    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>SmartInvoice AI</h2>

        <nav>
          <a href="#" className="active">Dashboard</a>
          <a href="#">All Invoices</a>
          <a href="#">Upload Invoice</a>
          <a href="#">Settings</a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your invoice overview.</p>
          </div>
        </header>

        <section className="summary-cards">
          <div className="summary-card">
            <h3>Total Invoices</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Processed</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Pending</h3>
            <p>0</p>
          </div>

          <div className="summary-card">
            <h3>Invalid</h3>
            <p>0</p>
          </div>
        </section>

        <section className="upload-section">
          <h2>Upload Invoice</h2>
          <p>Upload an invoice to extract and validate its information using AI.</p>

          <div className="upload-box">
            <p>Drag and drop your invoice here</p>
            <p>or</p>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              id="invoice-file"
              hidden
              onChange={(event) => {
                setSelectedFile(event.target.files[0])
              }}
            />

            <label htmlFor="invoice-file" className="upload-button">
              Choose File
            </label>

            {selectedFile && (
              <p className="selected-file">
                Selected file: {selectedFile.name}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Invoice'}
            </button>

            {uploadMessage && (
              <p>{uploadMessage}</p>
            )}
            
            <small>Supported formats: PDF, PNG, JPG (Maximum 10 MB)</small>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
