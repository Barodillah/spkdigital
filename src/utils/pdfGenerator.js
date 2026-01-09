import { jsPDF } from 'jspdf';

export function generateSuratJalan(spkData, promises) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SURAT JALAN SEMENTARA', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('(Unit dikirim sebelum STNK terbit)', pageWidth / 2, 32, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 38, pageWidth - 20, 38);

    // SPK Info
    let y = 48;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMASI SPK', 20, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    const spkInfo = [
        ['Nomor SPK', spkData.spkNo],
        ['Tanggal', new Date(spkData.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })],
    ];

    spkInfo.forEach(([label, value]) => {
        doc.text(`${label}`, 20, y);
        doc.text(`: ${value}`, 70, y);
        y += 7;
    });

    // Customer Info
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PENERIMA', 20, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    const customerInfo = [
        ['Nama', spkData.custName],
        ['No. WhatsApp', spkData.waNo],
        ['Alamat Kirim', ''],
    ];

    customerInfo.forEach(([label, value]) => {
        doc.text(`${label}`, 20, y);
        doc.text(`: ${value}`, 70, y);
        y += 7;
    });

    // Address (multiline)
    const addressLines = doc.splitTextToSize(spkData.address, pageWidth - 90);
    addressLines.forEach((line, i) => {
        doc.text(i === 0 ? `: ${line}` : `  ${line}`, 70, y - 7 + (i * 5));
    });
    y += (addressLines.length - 1) * 5;

    // Unit Info
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('DATA KENDARAAN', 20, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    const unitInfo = [
        ['Tipe Unit', spkData.unitType],
        ['Warna', spkData.color],
        ['No. Rangka', spkData.chassisNo || '-'],
        ['No. Mesin', spkData.engineNo || '-'],
        ['Metode Bayar', spkData.paymentMethod],
    ];

    unitInfo.forEach(([label, value]) => {
        doc.text(`${label}`, 20, y);
        doc.text(`: ${value}`, 70, y);
        y += 7;
    });

    // Promises
    if (promises && promises.length > 0) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('JANJI YANG DIKONFIRMASI', 20, y);

        y += 8;
        doc.setFont('helvetica', 'normal');
        promises.forEach((p, idx) => {
            doc.text(`${idx + 1}. ${p.promiseText}`, 25, y);
            y += 6;
        });
    }

    // Legal Note
    y += 15;
    doc.setFillColor(255, 245, 235);
    doc.rect(20, y - 5, pageWidth - 40, 20, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(204, 0, 0);
    doc.text('CATATAN PENTING:', 25, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Unit ini dikirim dalam kondisi STNK masih dalam proses penerbitan oleh pihak berwenang.', 25, y + 9);
    doc.setTextColor(0, 0, 0);

    // Signature areas
    y += 35;
    doc.setFontSize(10);
    doc.text('Diserahkan oleh:', 35, y);
    doc.text('Diterima oleh:', pageWidth - 75, y);

    y += 25;
    doc.line(25, y, 85, y);
    doc.line(pageWidth - 90, y, pageWidth - 30, y);

    y += 5;
    doc.setFontSize(9);
    doc.text('( Petugas Delivery )', 35, y);
    doc.text(`( ${spkData.custName} )`, pageWidth - 75, y);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 20, 285);
    doc.text('SPK Digital - Mitsubishi', pageWidth - 60, 285);

    return doc;
}

export function downloadSuratJalan(spkData, promises) {
    const doc = generateSuratJalan(spkData, promises);
    doc.save(`SuratJalan_${spkData.spkNo}.pdf`);
}

export function previewSuratJalan(spkData, promises) {
    const doc = generateSuratJalan(spkData, promises);
    return doc.output('bloburl');
}
