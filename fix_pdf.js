import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function fixPdfMetadata() {
    const pdfPath = './public/User Guide.pdf';
    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Set internal metadata title
    pdfDoc.setTitle('User Guide');
    pdfDoc.setAuthor('StoneVision AI');
    pdfDoc.setSubject('StoneVision AI Application User Manual');
    pdfDoc.setKeywords(['User Guide', 'StoneVision AI', 'AI Scanner']);
    pdfDoc.setProducer('StoneVision AI Platform');
    pdfDoc.setCreator('VisionStone Infrastructure');

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log('PDF metadata updated successfully: Title set to "User Guide"');
}

fixPdfMetadata().catch(err => {
    console.error('Error fixing PDF metadata:', err);
    process.exit(1);
});
