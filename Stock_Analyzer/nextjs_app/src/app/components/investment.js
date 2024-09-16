import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Investment = ({ investment_report }) => {
    const reportRef = useRef(null); // Reference for the report content

    // Autoscroll to the report when investment_report is updated
    useEffect(() => {
        if (investment_report && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [investment_report]);

    const handleDownloadPdf = async () => {
        const input = document.getElementById('report-content');
        const pdf = new jsPDF('p', 'mm', 'a4');

        await html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Enable CORS to allow cross-domain images
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.setFontSize(12);
            pdf.text('Generated by My Stock Investment and Analysis App', 10, pdf.internal.pageSize.height - 10);
            pdf.save('Investment_report.pdf');
        });
    };

    return (
        <div className="flex justify-center mt-8">
            <div className="w-full max-w-3xl border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-center">Stock Investment</h3>
                <div id="report-content" ref={reportRef}>
                    <ReactMarkdown className="prose prose-lg" remarkPlugins={[remarkGfm]}>
                        {investment_report}
                    </ReactMarkdown>
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleDownloadPdf}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                    >
                        Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Investment;
