import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Certificate = ({ certificate, onShare, verificationUrl }) => {
  const certificateRef = useRef(null);

  const downloadAsPDF = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${certificate.studentName}-certificate.pdf`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Vocal Training Certificate',
        text: `Check out my certificate for completing ${certificate.courseTitle}!`,
        url: verificationUrl
      });
    } else {
      onShare(verificationUrl);
    }
  };

  return (
    <div className="p-6">
      {/* Certificate Preview */}
      <div ref={certificateRef} className="certificate-container">
        <div className="certificate-header">
          <div className="certificate-seal animate-seal">
            <svg className="w-full h-full text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="certificate-title">Certificate of Completion</h1>
          <p className="certificate-subtitle">This is to certify that</p>
        </div>

        <div className="certificate-body">
          <h2 className="certificate-name">{certificate.studentName}</h2>
          <p className="text-lg text-gray-600 mt-2">has successfully completed</p>
          <h3 className="certificate-course">{certificate.courseTitle}</h3>
          <p className="text-lg text-gray-600 mt-2">under the guidance of</p>
          <p className="text-xl font-medium text-gray-800">{certificate.instructorName}</p>
          <p className="certificate-date">
            Completed on {new Date(certificate.completionDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="certificate-footer">
          <div className="certificate-signature">
            <p className="text-sm font-medium text-gray-800">{certificate.instructorName}</p>
            <p className="text-xs text-gray-600">Instructor</p>
          </div>
          
          <div className="certificate-signature">
            <p className="text-sm font-medium text-gray-800">VocalMaster</p>
            <p className="text-xs text-gray-600">Platform Director</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={downloadAsPDF}
          className="certificate-button"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
        
        <button
          onClick={handleShare}
          className="certificate-button-secondary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Certificate
        </button>
      </div>

      {/* Verification Link */}
      <div className="mt-4 text-center">
        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="verification-link"
        >
          Verify Certificate
        </a>
      </div>
    </div>
  );
};

export default Certificate;
