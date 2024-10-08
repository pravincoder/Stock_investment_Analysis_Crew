import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Lazy load jsPDF and html2canvas
const jsPDF = lazy(() => import('jspdf'));
const html2canvas = lazy(() => import('html2canvas'));

const Analysis = ({ analysis_report }) => {
    const reportRef = useRef(null); // Reference to the report

    // Autoscroll when analysis_report is updated
    useEffect(() => {
        if (analysis_report && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [analysis_report]);

    const handleDownloadPdf = async () => {
        // Dynamically import jsPDF and html2canvas
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

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
            pdf.save('analysis_report.pdf');
        });
    };

    return (
        <div className="flex justify-center mt-8">
        <div className="w-full max-w-3xl border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-center">Stock Analysis</h3>
            <div id="report-content" ref={reportRef}>
                <ReactMarkdown className="prose prose-lg" remarkPlugins={[remarkGfm]}>
                    {analysis_report}
                </ReactMarkdown>
            </div>
            <div className="flex justify-center mt-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <button
                        onClick={handleDownloadPdf}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                    >
                        Download as PDF
                    </button>
                </Suspense>
            </div>
            </div>
        </div>
    );
};

export default Analysis;