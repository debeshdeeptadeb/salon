import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineQrCode,
    HiOutlineInformationCircle,
    HiOutlineCheckCircle,
    HiOutlineArrowDownTray,
    HiOutlinePrinter,
    HiOutlineTrash,
    HiOutlineXMark,
    HiOutlinePlus,
    HiOutlineDevicePhoneMobile,
    HiOutlineCheck,
    HiOutlineMinusCircle,
} from 'react-icons/hi2';
import { qrAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';
import './QRCodeManagement.css';

export default function QRCodeManagement() {
    const [qrCodes, setQRCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState({
        label: ''
    });
    const [generatedQR, setGeneratedQR] = useState(null);

    useEffect(() => {
        fetchQRCodes();
    }, []);

    const fetchQRCodes = async () => {
        try {
            const response = await qrAPI.getAll();
            setQRCodes(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch QR codes');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);

        try {
            const response = await qrAPI.generate(formData);
            setGeneratedQR(response.data.data);
            toast.success('QR Code generated successfully!');
            fetchQRCodes();
            setFormData({ label: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to generate QR code');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = (qrCode) => {
        const link = document.createElement('a');
        link.href = `${API_ORIGIN}${qrCode.qr_image_url}`;
        link.download = `${qrCode.label || qrCode.qr_code_id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    const handlePrint = (qrCode) => {
        const printWindow = window.open('', '_blank');
        const frontendUrl = window.location.origin;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print QR Code - ${qrCode.label || qrCode.qr_code_id}</title>
                <style>
                    @media print {
                        @page { margin: 0; }
                        body { margin: 1cm; }
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .print-container {
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 {
                        color: #1a1a1a;
                        margin-bottom: 10px;
                        font-size: 32px;
                    }
                    .label {
                        color: #666;
                        font-size: 18px;
                        margin-bottom: 30px;
                    }
                    img {
                        width: 400px;
                        height: 400px;
                        border: 2px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 20px;
                        background: white;
                    }
                    .instructions {
                        margin-top: 30px;
                        color: #666;
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .url {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 14px;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <h1>MINJAL Salon</h1>
                    ${qrCode.label ? `<div class="label">${qrCode.label}</div>` : ''}
                    <img src="${API_ORIGIN}${qrCode.qr_image_url}" alt="QR Code" />
                    <div class="instructions">
                        <strong>Scan to view our services and book appointments</strong>
                    </div>
                    <div class="url">${frontendUrl}/salon/${qrCode.qr_code_id}</div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this QR code?')) return;

        try {
            await qrAPI.delete(id);
            toast.success('QR Code deleted successfully');
            fetchQRCodes();
            if (generatedQR && generatedQR.id === id) {
                setGeneratedQR(null);
            }
        } catch (error) {
            toast.error('Failed to delete QR code');
        }
    };

    const handleToggle = async (id) => {
        try {
            await qrAPI.toggle(id);
            toast.success('QR Code status updated');
            fetchQRCodes();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page qr-management admin-ui-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title-row">
                        <HiOutlineQrCode size={28} aria-hidden />
                        QR codes
                    </h1>
                    <p className="admin-ui-subtitle" style={{ marginTop: 8 }}>
                        Marketing QR codes that open your public booking page for this tenant.
                    </p>
                </div>
                <button type="button" className="admin-btn admin-btn-with-icon" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus size={20} aria-hidden />
                    Generate QR
                </button>
            </div>

            <div className="qr-info-banner">
                <div className="info-icon" aria-hidden>
                    <HiOutlineInformationCircle size={22} />
                </div>
                <div className="info-content">
                    <strong>Salon marketing QR:</strong> These codes link to your public booking page. For the{' '}
                    <strong>UPI payment QR</strong> customers see when paying during booking, upload the image in{' '}
                    <Link to="/admin/settings">Site Settings → UPI Payment QR</Link>.
                </div>
            </div>

            {generatedQR && (
                <div className="qr-preview-card">
                    <div className="preview-header">
                        <h3 className="qr-preview-title">
                            <HiOutlineCheckCircle size={22} aria-hidden /> QR generated
                        </h3>
                        <button type="button" className="close-btn" onClick={() => setGeneratedQR(null)} aria-label="Dismiss">
                            <HiOutlineXMark size={22} />
                        </button>
                    </div>
                    <div className="preview-content">
                        <div className="qr-image-container">
                            <img
                                src={`${API_ORIGIN}${generatedQR.qr_image_url}`}
                                alt="Generated QR Code"
                                className="qr-preview-image"
                            />
                        </div>
                        <div className="preview-details">
                            <h4>{generatedQR.label || 'Unlabeled QR Code'}</h4>
                            <p className="qr-id">ID: {generatedQR.qr_code_id}</p>
                            <div className="preview-actions">
                                <button
                                    type="button"
                                    className="btn-download"
                                    onClick={() => handleDownload(generatedQR)}
                                >
                                    <HiOutlineArrowDownTray size={18} aria-hidden /> Download
                                </button>
                                <button
                                    type="button"
                                    className="btn-print"
                                    onClick={() => handlePrint(generatedQR)}
                                >
                                    <HiOutlinePrinter size={18} aria-hidden /> Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="qr-grid">
                {qrCodes.length === 0 ? (
                    <div className="empty-state">
                        <div className="admin-empty-illustration" aria-hidden>
                            <HiOutlineDevicePhoneMobile />
                        </div>
                        <h3>No QR codes yet</h3>
                        <p>Generate your first QR code to get started</p>
                    </div>
                ) : (
                    qrCodes.map((qr) => (
                        <div key={qr.id} className={`qr-card ${!qr.is_active ? 'inactive' : ''}`}>
                            <div className="qr-card-image">
                                <img
                                    src={`${API_ORIGIN}${qr.qr_image_url}`}
                                    alt={qr.label || 'QR Code'}
                                />
                                {!qr.is_active && <div className="inactive-overlay">Inactive</div>}
                            </div>
                            <div className="qr-card-content">
                                <h4>{qr.label || 'Unlabeled'}</h4>
                                <p className="qr-id">{qr.qr_code_id}</p>
                                <p className="qr-date">
                                    Created: {new Date(qr.created_at).toLocaleDateString()}
                                </p>
                                <div className="qr-card-actions">
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => handleDownload(qr)}
                                        title="Download"
                                    >
                                        <HiOutlineArrowDownTray size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => handlePrint(qr)}
                                        title="Print"
                                    >
                                        <HiOutlinePrinter size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn-icon ${qr.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggle(qr.id)}
                                        title={qr.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {qr.is_active ? <HiOutlineCheck size={18} /> : <HiOutlineMinusCircle size={18} />}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-icon delete"
                                        onClick={() => handleDelete(qr.id)}
                                        title="Delete"
                                    >
                                        <HiOutlineTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Generate Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Generate New QR Code</h2>
                        <form onSubmit={handleGenerate}>
                            <div className="form-group">
                                <label>Label (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Main Entrance, Reception, VIP Lounge"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ label: e.target.value })}
                                />
                                <small>Add a label to identify where this QR code will be placed</small>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                    disabled={generating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={generating}
                                >
                                    {generating ? 'Generating...' : 'Generate QR Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
