import React from 'react';

interface CertificatePreviewProps {
    metadata: {
        name: string;
        description: string;
        recipient_name?: string;
        issued_at?: string;
        certificate_type?: string;
    };
    tokenId: string;
}

export default function CertificatePreview({ metadata, tokenId }: CertificatePreviewProps) {
    const formattedDate = metadata.issued_at
        ? new Date(metadata.issued_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : "Date Not Available";

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px',
            backgroundColor: '#fff',
            color: '#1a202c',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '10px solid #e2e8f0', // Outer simple border
            overflow: 'hidden',
            fontFamily: "'Times New Roman', serif", // Fallback for classic look
        }}>
            {/* Inner Decorative Border */}
            <div style={{
                border: '2px solid #b79c59',
                padding: '40px',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundImage: 'radial-gradient(circle at center, #fff 0%, #fdfbf7 100%)'
            }}>
                {/* Corner Ornaments (CSS Shapes) */}
                <div style={{ position: 'absolute', top: 10, left: 10, width: 40, height: 40, borderTop: '4px double #b79c59', borderLeft: '4px double #b79c59' }} />
                <div style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderTop: '4px double #b79c59', borderRight: '4px double #b79c59' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, width: 40, height: 40, borderBottom: '4px double #b79c59', borderLeft: '4px double #b79c59' }} />
                <div style={{ position: 'absolute', bottom: 10, right: 10, width: 40, height: 40, borderBottom: '4px double #b79c59', borderRight: '4px double #b79c59' }} />

                {/* Header */}
                <div style={{
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#718096',
                    marginBottom: '16px'
                }}>
                    Certificate of {metadata.certificate_type || 'Completion'}
                </div>

                <h1 style={{
                    fontSize: '48px',
                    margin: '0 0 16px 0',
                    color: '#1a202c',
                    fontFamily: "'Playfair Display', serif", // Assume font available or fallback
                    letterSpacing: '-0.02em'
                }}>
                    {metadata.name}
                </h1>

                <div style={{
                    fontSize: '18px',
                    fontStyle: 'italic',
                    marginBottom: '24px',
                    color: '#4a5568'
                }}>
                    This certificate is proudly presented to
                </div>

                {/* Recipient Name */}
                <div style={{
                    fontSize: '42px',
                    fontWeight: 'bold',
                    color: '#b79c59',
                    margin: '0 0 32px 0',
                    fontFamily: "'Great Vibes', cursive, 'Brush Script MT', cursive", // Script fallback
                    borderBottom: '1px solid #cbd5e0',
                    paddingBottom: '8px',
                    minWidth: '300px'
                }}>
                    {metadata.recipient_name || 'Recipient Name'}
                </div>

                <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    maxWidth: '600px',
                    margin: '0 auto 40px auto',
                    color: '#4a5568'
                }}>
                    {metadata.description}
                </div>

                {/* Footer Section: Date & Signature */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 'auto',
                    paddingTop: '32px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #000',
                            paddingBottom: '4px',
                            marginBottom: '4px',
                            minWidth: '150px'
                        }}>
                            {formattedDate}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Date Issued
                        </div>
                    </div>

                    {/* Seal */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '3px solid #b79c59',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#b79c59',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 0 0 4px #fff, 0 0 0 6px #b79c59'
                    }}>
                        Verified<br />#{tokenId}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '24px',
                            fontFamily: "'Great Vibes', cursive",
                            color: '#1a202c',
                            borderBottom: '1px solid #000',
                            paddingBottom: '0px',
                            marginBottom: '4px',
                            minWidth: '150px'
                        }}>
                            Cert Authority
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Signature
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
