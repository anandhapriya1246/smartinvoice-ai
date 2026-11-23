import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadedInvoice, setUploadedInvoice] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null)


  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/invoices'
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch invoices')
      }

      setInvoices(result.invoices)

    } catch (error) {
      console.error('Error fetching invoices:', error)

    } finally {
      setIsLoadingInvoices(false)
    }
  }

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      setIsLoadingDetails(true)
      setLoadingInvoiceId(invoiceId)
    
      const response = await fetch(
        `http://localhost:5000/api/invoices/${invoiceId}`
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch invoice details')
      }

      setSelectedInvoice(result.invoice)

    } catch (error) {
      console.error('Error fetching invoice details:', error)
      alert(error.message)

    } finally {
      setIsLoadingDetails(false)
      setLoadingInvoiceId(null)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

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
      setUploadedInvoice(result.invoice)
      await fetchInvoices()

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
            <p>{invoices.length}</p>
          </div>

          <div className="summary-card">
            <h3>Processed</h3>
            <p>
              {invoices.filter(
                (invoice) => invoice.processing_status === 'completed'
              ).length}
            </p>
          </div>

          <div className="summary-card">
            <h3>Processing Failed</h3>
            <p>
              {invoices.filter(
                (invoice) => invoice.processing_status === 'processing_failed'
              ).length}
            </p>
          </div>

          <div className="summary-card">
            <h3>Invalid</h3>
            <p>
              {invoices.filter(
                (invoice) => invoice.validation?.status === 'invalid'
              ).length}
            </p>
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

        {uploadedInvoice && (
          <section className="invoice-result">
            <h2>Uploaded Invoice Details</h2>

            <div className="invoice-details">
              <p>
                <strong>Filename:</strong>{' '}
                {uploadedInvoice.original_filename}
              </p>

              <p>
                <strong>Processing Status:</strong>{' '}
                {uploadedInvoice.processing_status}
              </p>

              <p>
                <strong>Vendor:</strong>{' '}
                {uploadedInvoice.vendor_name || 'Not available'}
              </p>

              <p>
                <strong>Invoice Number:</strong>{' '}
                {uploadedInvoice.invoice_number || 'Not available'}
              </p>

              <p>
                <strong>Validation:</strong>{' '}
                {uploadedInvoice.validation?.status || 'Not available'}
              </p>
            </div>

            <h3>Extracted OCR Text</h3>

            <div className="ocr-text">
              {uploadedInvoice.extracted_text?.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </section>
        )}


        <section className="recent-invoices">
          <h2>Recent Invoices</h2>

          {isLoadingInvoices ? (
            <p>Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p>No invoices uploaded yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Vendor</th>
                    <th>Invoice Number</th>
                    <th>Processing Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td>{invoice.original_filename}</td>
                      <td>{invoice.vendor_name || 'Not available'}</td>
                      <td>{invoice.invoice_number || 'Not available'}</td>
                      <td>{invoice.processing_status}</td>
                      <td>
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="invoice-action-button"
                          onClick={() => fetchInvoiceDetails(invoice._id)}
                          disabled={isLoadingDetails}
                        >
                          {loadingInvoiceId === invoice._id ? 'Loading...' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {isLoadingDetails && (
          <p>Loading invoice details...</p>
        )}

        {selectedInvoice && (
          <section className="invoice-result">
            <h2>Selected Invoice Details</h2>
            <button
              type="button"
              className="close-details-button"
              onClick={() => setSelectedInvoice(null)}
            >
              Close Details
            </button>
            <div className="invoice-details">
              <p>
                <strong>Filename:</strong> {selectedInvoice.original_filename}
              </p>

              <p>
                <strong>Vendor:</strong> {selectedInvoice.vendor_name || 'Not available'}
              </p>

              <p>
                <strong>Invoice Number:</strong> {selectedInvoice.invoice_number || 'Not available'}
              </p>

              <p>
                <strong>Invoice Date:</strong> {selectedInvoice.invoice_date || 'Not available'}
              </p>

              <p>
                <strong>Customer:</strong> {selectedInvoice.customer_name || 'Not available'}
              </p>

              <p>
                <strong>Total:</strong> {selectedInvoice.total ?? 'Not available'}
              </p>

              <p>
                <strong>Processing Status:</strong> {selectedInvoice.processing_status}
              </p>

              <p>
                <strong>Validation:</strong> {selectedInvoice.validation?.status || 'Not available'}
              </p>
            </div>

            <h3>Extracted OCR Text</h3>

            <div className="ocr-text">
              {selectedInvoice.extracted_text?.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}


export default App
