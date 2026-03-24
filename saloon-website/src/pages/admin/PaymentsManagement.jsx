import {
    HiOutlineCreditCard,
    HiOutlineCheckCircle,
    HiOutlineArrowPath,
    HiOutlineClipboardDocumentList,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import './FeaturePreview.css';

export default function PaymentsManagement() {
    return (
        <div className="admin-page admin-ui-page">
            <div className="admin-ui-header">
                <h1 className="admin-page-title-row">
                    <HiOutlineCreditCard aria-hidden />
                    Payments
                </h1>
                <p className="admin-ui-subtitle" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="coming-soon-badge">Phase 3</span>
                    <span>Gateway integration is planned; schema and structure are ready.</span>
                </p>
            </div>

            <div className="feature-preview">
                <div className="preview-icon" aria-hidden>
                    <HiOutlineCreditCard />
                </div>
                <h2>Payment integration</h2>
                <p>Razorpay gateway for advances and full payments, with webhooks and receipts.</p>

                <div className="features-list">
                    <h3>Planned features</h3>
                    <ul>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--done">
                                <HiOutlineCheckCircle />
                            </span>
                            Database schema ready
                        </li>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--done">
                                <HiOutlineCheckCircle />
                            </span>
                            Payment tracking table created
                        </li>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--todo">
                                <HiOutlineArrowPath />
                            </span>
                            Razorpay integration
                        </li>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--todo">
                                <HiOutlineArrowPath />
                            </span>
                            UPI & card flows
                        </li>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--todo">
                                <HiOutlineArrowPath />
                            </span>
                            Confirmation & receipts
                        </li>
                        <li className="feature-li">
                            <span className="feature-li-icon feature-li-icon--todo">
                                <HiOutlineArrowPath />
                            </span>
                            Refund management
                        </li>
                    </ul>
                </div>

                <div className="architecture-note">
                    <h4 className="admin-section-title" style={{ marginTop: 0 }}>
                        <HiOutlineClipboardDocumentList aria-hidden />
                        Architecture status
                    </h4>
                    <p>The payment system layout is prepared with:</p>
                    <ul>
                        <li>
                            <strong>Database:</strong> payments (Razorpay fields)
                        </li>
                        <li>
                            <strong>Methods:</strong> UPI, card, cash
                        </li>
                        <li>
                            <strong>Status:</strong> pending, completed, failed, refunded
                        </li>
                        <li>
                            <strong>Integration:</strong> Razorpay API shape defined
                        </li>
                    </ul>
                    <p>Live Razorpay UI and webhooks ship in Phase 3.</p>
                </div>

                <div className="razorpay-info">
                    <h4 className="admin-section-title" style={{ marginTop: 0 }}>
                        <HiOutlineExclamationTriangle aria-hidden />
                        Setup required
                    </h4>
                    <p>To turn this on you will need:</p>
                    <ul>
                        <li>Razorpay account (test or live)</li>
                        <li>API keys in environment</li>
                        <li>Webhook URL for payment confirmations</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
