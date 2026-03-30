const fs = require('fs');
const path = require('path');

const dir = 'src/app/hr-portal-admin';
const folders = ['leave', 'leave-self', 'resignations', 'resignation-self', 'incidents', 'incident-self', 'certificates', 'certificates-self'];

folders.forEach(f => {
    const filePath = path.join(dir, f, 'page.tsx');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Robust replace for modal wrapper (matches white background and 90vh height, or 500px maxWidth)
        content = content.replace(
            /<div style=\{\{\s*backgroundColor:\s*["']white["'][^\}]*maxHeight:\s*["']90vh["'][^\}]*\}\}>/g,
            '<div className="modal-container">'
        );
        content = content.replace(
            /<div style=\{\{\s*backgroundColor:\s*["']white["'][^\}]*maxWidth:\s*["']500px["'][^\}]*\}\}>/g,
            '<div className="modal-container" style={{ maxWidth: "500px" }}>'
        );

        // Robust replace document paper
        content = content.replace(
            /<div style=\{\{\s*border:\s*["']2px solid #111827["'][^\}]*marginBottom:\s*["']2rem["']\s*\}\}>/g,
            '<div className="document-paper">'
        );

        // Robust replace signature row
        content = content.replace(
            /<div style=\{\{\s*display:\s*["']flex["'][^\}]*alignItems:\s*["']flex-end["'][^\}]*\}\}>/g,
            '<div className="signature-row">'
        );

        // Robust replace signature box
        content = content.replace(
            /<div style=\{\{\s*borderBottom:\s*["']1px solid #111827["'][^\}]*height:\s*["']80px["'][^\}]*\}\}>/g,
            '<div className="signature-box">'
        );

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed robust padding in ' + filePath);
    }
});
