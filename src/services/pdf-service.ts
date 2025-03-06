// src/services/pdf-service.ts
import PDFDocument from 'pdfkit';
import { Application } from '@/types/mongo';
import fs from 'fs';

// Helper function to format date
const formatDate = (date: string | number): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Generate application form PDF
export function generateApplicationFormPDF(application: Application): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ size: 'A4' });
      
      // Buffer to store PDF
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      
      // Page 1: Application Form
      // Header with college details and logo
      doc.fontSize(18).font('Helvetica-Bold').text('COLLEGE NAME', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('College Address Line 1', { align: 'center' });
      doc.text('College Address Line 2', { align: 'center' });
      doc.moveDown();
      
      // Entrance Examination header
      doc.fontSize(16).font('Helvetica-Bold').text('ENTRANCE EXAMINATION 2025', { align: 'center' });
      doc.moveDown();
      
      // Application number and date
      doc.fontSize(12).font('Helvetica');
      doc.text(`Application No: ${application.applicationNo}`, { align: 'right' });
      doc.text(`Date: ${formatDate(application.status.appliedAt)}`, { align: 'right' });
      doc.moveDown();
      
      // Photo placeholder/actual photo
      doc.rect(430, 100, 100, 120).stroke();
      if (application.personalInfo.photo) {
        try {
          // If photo is a URL, try to add it
          doc.image(application.personalInfo.photo, 430, 100, { width: 100 });
        } catch (e) {
          // If URL fails, just leave the box
          doc.fontSize(8).text('PHOTO', 430, 160, { width: 100, align: 'center' });
        }
      } else {
        doc.fontSize(8).text('PHOTO', 430, 160, { width: 100, align: 'center' });
      }
      
      // Personal details
      doc.fontSize(14).font('Helvetica-Bold').text('Personal Information', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name of the Candidate: ${application.personalInfo.name}`);
      doc.text(`Name of Father: ${application.personalInfo.fatherName}`);
      doc.text(`Name of Mother: ${application.personalInfo.motherName}`);
      doc.text(`Name of Guardian: ${application.personalInfo.guardianName}`);
      doc.text(`Date of Birth: ${formatDate(application.personalInfo.dateOfBirth)}`);
      
      doc.moveDown(2);
      
      // Page 2: Address and Additional Details
      doc.addPage();
      
      // Address Information
      doc.fontSize(14).font('Helvetica-Bold').text('Address Information', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Place: ${application.addressInfo.place}`);
      doc.text(`Mahallu: ${application.addressInfo.mahallu}`);
      doc.text(`Post Office: ${application.addressInfo.postOffice}`);
      doc.text(`Pin Code: ${application.addressInfo.pinCode}`);
      doc.text(`Panchayath: ${application.addressInfo.panchayath}`);
      doc.text(`Constituency: ${application.addressInfo.constituency}`);
      doc.text(`District: ${application.addressInfo.district}`);
      doc.text(`State: ${application.addressInfo.state}`);
      
      doc.moveDown(1);
      
      // Contact Details
      doc.fontSize(14).font('Helvetica-Bold').text('Contact Details', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Mobile Number: ${application.contactInfo.mobileNumber}`);
      doc.text(`Mobile No of Candidate: ${application.contactInfo.candidateMobile}`);
      doc.text(`WhatsApp: ${application.contactInfo.whatsappNumber}`);
      doc.text(`Email: ${application.contactInfo.email}`);
      
      doc.moveDown(1);
      
      // Educational Qualification
      doc.fontSize(14).font('Helvetica-Bold').text('Educational Qualification', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Madrasa: ${application.educationalInfo.madrasa}`);
      doc.text(`School: ${application.educationalInfo.school}`);
      doc.text(`Reg. No of SSLC/Equivalent: ${application.educationalInfo.regNo}`);
      doc.text(`Medium: ${application.educationalInfo.medium}`);
      doc.text(`Hifz Completed: ${application.educationalInfo.hifzCompleted ? 'Yes' : 'No'}`);
      
      doc.moveDown(1);
      
      // Fee Payment Section
      doc.fontSize(14).font('Helvetica-Bold').text('Fee Payment Details', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Transaction No: ${application.paymentInfo.transactionId}`);
      doc.text(`Fee Amount: ₹${application.paymentInfo.amount.toFixed(2)}`);
      doc.text(`Date of Payment: ${formatDate(application.paymentInfo.date)}`);
      doc.text(`Status: ${application.paymentInfo.status}`);
      
      // Declaration
      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').text('Declaration', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      doc.text(
        'I hereby declare that the information provided in this application form is true and correct to the best of my knowledge. I understand that providing false information may result in the cancellation of my application.',
        { align: 'justify' }
      );
      
      doc.moveDown(2);
      
      // Signature fields
      doc.fontSize(12).font('Helvetica');
      doc.text('__________________________', 100, 700);
      doc.text('Signature of Candidate', 100, 720);
      
      doc.text('__________________________', 400, 700);
      doc.text('Signature of Parent/Guardian', 400, 720);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Generate hall ticket (admit card) PDF
export function generateHallTicketPDF(application: Application): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ size: 'A4' });
      
      // Buffer to store PDF
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      
      // Header with college details and logo
      doc.fontSize(18).font('Helvetica-Bold').text('COLLEGE NAME', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('College Address Line 1', { align: 'center' });
      doc.text('College Address Line 2', { align: 'center' });
      doc.moveDown();
      
      // Hall Ticket header
      doc.fontSize(16).font('Helvetica-Bold').text('ADMIT CARD - ENTRANCE EXAMINATION 2025', { align: 'center' });
      doc.moveDown();
      
      // Application number
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Application No: ${application.applicationNo}`, { align: 'left' });
      doc.moveDown();
      
      // Photo
      doc.rect(430, 100, 100, 120).stroke();
      if (application.personalInfo.photo) {
        try {
          doc.image(application.personalInfo.photo, 430, 100, { width: 100 });
        } catch (e) {
          doc.fontSize(8).text('PHOTO', 430, 160, { width: 100, align: 'center' });
        }
      } else {
        doc.fontSize(8).text('PHOTO', 430, 160, { width: 100, align: 'center' });
      }
      
      // Exam Details
      doc.fontSize(12).font('Helvetica-Bold');
      if (application.examInfo) {
        doc.text(`Date of Examination: ${application.examInfo.examDate || 'To be announced'}`);
        doc.text(`Time of Examination: ${application.examInfo.examTime || 'To be announced'}`);
      } else {
        doc.text('Date of Examination: To be announced');
        doc.text('Time of Examination: To be announced');
      }
      doc.moveDown();
      
      // Candidate Information
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name of the Candidate: ${application.personalInfo.name}`);
      doc.text(`Date of Birth: ${formatDate(application.personalInfo.dateOfBirth)}`);
      doc.text(`Name of Father: ${application.personalInfo.fatherName}`);
      doc.moveDown();
      
      // Address
      doc.fontSize(12).font('Helvetica-Bold').text('Address:', { continued: true });
      doc.font('Helvetica').text(` ${application.addressInfo.place}, ${application.addressInfo.mahallu},`);
      doc.text(`${application.addressInfo.postOffice}, ${application.addressInfo.pinCode},`);
      doc.text(`${application.addressInfo.district}, ${application.addressInfo.state}`);
      doc.moveDown();
      
      // Contact Details
      doc.fontSize(12).font('Helvetica-Bold').text('Mobile Number:', { continued: true });
      doc.font('Helvetica').text(` ${application.contactInfo.mobileNumber}`);
      
      doc.fontSize(12).font('Helvetica-Bold').text('Medium:', { continued: true });
      doc.font('Helvetica').text(` ${application.educationalInfo.medium}`);
      
      doc.moveDown(2);
      
      // Declaration in Malayalam
      doc.fontSize(14).font('Helvetica-Bold').text('Declaration', { underline: true });
      doc.moveDown(0.5);
      
      // Using a Malayalam compatible font would be better, but for this example, we're using standard fonts
      doc.fontSize(10).font('Helvetica');
      doc.text(
        'ഞങ്ങൾ തെരതെടുത്ത കോഴ്സുമായി ബന്ധപ്പെട്ട് സ്ഥാപനം സവീകരിക്കുന്ന നിലവിലുള്ളതും ഭാവിയിൽ ഉണ്ടാകുന്നതുമായ എല്ലാ നിയമങ്ങളും നിയന്ത്രണങ്ങളും ഞങ്ങൾ അംഗീകരിക്കുന്നതും പാലിക്കുന്നതുമാണ്. കൂടാതെ പറയപ്പെട്ട കാര്യങ്ങളിൽ ഞങ്ങൾക്ക് ഭാഗത്തുനിന്ന് ലംഘനം ഉണ്ടായാൽ തുടർനടപടികൾ ഞങ്ങൾ അനുസരിക്കുന്നതാണ് എന്ന് ഈ അപേക്ഷ സമർപ്പിക്കുന്നു.',
        { align: 'justify' }
      );
      
      doc.moveDown(2);
      
      // Signature fields
      doc.fontSize(12).font('Helvetica');
      doc.text('__________________________', 100, 650);
      doc.text('Signature of Parent/Guardian', 100, 670);
      
      doc.text('__________________________', 300, 650);
      doc.text('Signature of Candidate', 300, 670);
      
      doc.text('__________________________', 500, 650);
      doc.text('Signature of Invigilator', 500, 670);
      
      doc.moveDown();
      
      // Important instructions
      doc.fontSize(12).font('Helvetica-Bold').text('Important Instructions:', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica');
      doc.text('1. Candidates should reach the examination center 30 minutes before the examination.');
      doc.text('2. Candidates must bring this admit card to the examination hall.');
      doc.text('3. No electronic devices are allowed in the examination hall.');
      doc.text('4. Candidates must follow all instructions given by the invigilator.');
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}