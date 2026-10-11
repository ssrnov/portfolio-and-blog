/**
 * Folioryn — Pure Client-Side ATS Resume Vector PDF Generator
 * Generates an ATS-compliant, print-perfect, vector A4 PDF file in pure JavaScript
 * with clickable project repository & live demo links, clean typography, and zero server dependencies.
 */

export class SimplePdfBuilder {
  constructor(options = {}) {
    this.pageWidth = options.pageWidth || 595.28; // Standard A4 width in pt
    this.pageHeight = options.pageHeight || 841.89; // Standard A4 height in pt
    this.margins = options.margins || { top: 36, bottom: 36, left: 36, right: 36 };
    
    this.pages = [];
    this.currentPage = null;
    this.currentY = 0;
    this.annotations = [];
    this.contentStream = '';
    
    this.fonts = {
      regular: '/F1',
      bold: '/F2',
      italic: '/F3'
    };
    
    this.addPage();
  }

  addPage() {
    if (this.currentPage) {
      this.pages.push({
        content: this.contentStream,
        annotations: [...this.annotations]
      });
      this.annotations = [];
      this.contentStream = '';
    }
    this.currentPage = {
      number: this.pages.length + 1
    };
    this.currentY = this.pageHeight - this.margins.top;
  }

  checkPageBreak(neededHeight = 24) {
    if (this.currentY - neededHeight < this.margins.bottom) {
      this.addPage();
      return true;
    }
    return false;
  }

  escapeText(text) {
    if (!text) return '';
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  getTextWidth(text, size = 10, font = 'regular') {
    if (!text) return 0;
    const factor = font === 'bold' ? 0.55 : 0.50;
    return text.length * size * factor;
  }

  drawText(text, options = {}) {
    if (!text) return 0;
    const {
      x = this.margins.left,
      y = this.currentY,
      font = 'regular',
      size = 10,
      color = [0, 0, 0],
      align = 'left'
    } = options;

    const fontRef = this.fonts[font] || this.fonts.regular;
    const [r, g, b] = color;
    const estWidth = this.getTextWidth(text, size, font);
    
    let drawX = x;
    if (align === 'center') {
      drawX = (this.pageWidth - estWidth) / 2;
    } else if (align === 'right') {
      drawX = this.pageWidth - this.margins.right - estWidth;
    }

    this.contentStream += `BT\n`;
    this.contentStream += `${fontRef} ${size} Tf\n`;
    this.contentStream += `${r} ${g} ${b} rg\n`;
    this.contentStream += `1 0 0 1 ${drawX.toFixed(2)} ${y.toFixed(2)} Tm\n`;
    this.contentStream += `(${this.escapeText(text)}) Tj\n`;
    this.contentStream += `ET\n`;

    return estWidth;
  }

  drawLine(x1, y1, x2, y2, options = {}) {
    const { width = 0.5, color = [0.2, 0.2, 0.2] } = options;
    const [r, g, b] = color;
    this.contentStream += `q\n`;
    this.contentStream += `${width} w\n`;
    this.contentStream += `${r} ${g} ${b} RG\n`;
    this.contentStream += `${x1.toFixed(2)} ${y1.toFixed(2)} m\n`;
    this.contentStream += `${x2.toFixed(2)} ${y2.toFixed(2)} l\n`;
    this.contentStream += `S\n`;
    this.contentStream += `Q\n`;
  }

  addLinkAnnotation(x1, y1, x2, y2, url) {
    if (!url) return;
    this.annotations.push({
      rect: [x1, y1, x2, y2],
      url: url
    });
  }

  wrapText(text, maxChars = 100) {
    if (!text) return [];
    const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  buildUint8Array() {
    if (this.currentPage) {
      this.pages.push({
        content: this.contentStream,
        annotations: [...this.annotations]
      });
    }

    const objects = [];
    const addObject = (content) => {
      objects.push(content);
      return objects.length;
    };

    const catalogObjNum = 1;
    const pagesObjNum = 2;
    
    objects.push(null); // 1: Catalog
    objects.push(null); // 2: Pages

    const regularFontNum = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
    const boldFontNum = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);
    const italicFontNum = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>`);

    const pageObjNums = [];

    for (const page of this.pages) {
      const encoder = new TextEncoder();
      const contentBytes = encoder.encode(page.content);
      const contentObjNum = addObject(
        `<< /Length ${contentBytes.length} >>\nstream\n${page.content}\nendstream`
      );

      const annotObjNums = [];
      for (const ann of page.annotations) {
        const [x1, y1, x2, y2] = ann.rect;
        const escUrl = this.escapeText(ann.url);
        const annotNum = addObject(
          `<< /Type /Annot /Subtype /Link /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /Border [0 0 0] /A << /Type /Action /S /URI /URI (${escUrl}) >> >>`
        );
        annotObjNums.push(annotNum);
      }

      let pageDef = `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${this.pageWidth.toFixed(2)} ${this.pageHeight.toFixed(2)}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${regularFontNum} 0 R /F2 ${boldFontNum} 0 R /F3 ${italicFontNum} 0 R >> /ProcSet [/PDF /Text] >>`;
      if (annotObjNums.length > 0) {
        pageDef += ` /Annots [${annotObjNums.map(n => `${n} 0 R`).join(' ')}]`;
      }
      pageDef += ` >>`;

      const pageNum = addObject(pageDef);
      pageObjNums.push(pageNum);
    }

    objects[0] = `<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`;
    objects[1] = `<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>`;

    let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    const xrefOffsets = [];
    const encoder = new TextEncoder();

    for (let i = 0; i < objects.length; i++) {
      const objNum = i + 1;
      const offset = encoder.encode(pdf).length;
      xrefOffsets.push(offset);
      pdf += `${objNum} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const startXref = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += `0000000000 65535 f \n`;

    for (const offset of xrefOffsets) {
      pdf += String(offset).padStart(10, '0') + ` 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjNum} 0 R >>\n`;
    pdf += `startxref\n${startXref}\n%%EOF\n`;

    return encoder.encode(pdf);
  }
}

/**
 * Generate full ATS-compliant resume PDF binary from structured portfolio data
 * @param {Object} data Portfolio dataset (profile, education, skills, experiences, projects, certifications)
 * @param {string} username Portfolio slug
 * @returns {Uint8Array} Binary PDF data
 */
export function generateAtsResumePdf(data = {}, username = 'developer') {
  const profile = data.profile || {};
  const education = data.education || [];
  const skills = data.skills || [];
  const experiences = data.experiences || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  const doc = new SimplePdfBuilder();
  const leftX = doc.margins.left;
  const rightX = doc.pageWidth - doc.margins.right;
  const printableWidth = rightX - leftX;

  // 1. HEADER
  const fullName = profile.fullName || profile.displayName || 'Developer';
  doc.drawText(fullName, { size: 20, font: 'bold', align: 'center' });
  doc.currentY -= 16;

  const headline = profile.headline || 'Software Engineer — Full-Stack & Systems';
  doc.drawText(headline, { size: 10.5, font: 'bold', align: 'center', color: [0.2, 0.2, 0.2] });
  doc.currentY -= 14;

  // Contact line
  const contactParts = [];
  const contactEmail = profile.email || profile.contact_email || profile.contactEmail;
  if (contactEmail) contactParts.push(contactEmail);
  if (profile.phone) contactParts.push(profile.phone);
  if (profile.location) contactParts.push(profile.location);
  contactParts.push(`folioryn.dev/u/${username}`);
  const gh = profile.githubUrl || profile.github_url || profile.github;
  if (gh) {
    contactParts.push(gh.replace(/^https?:\/\//, '').replace(/\/+$/, ''));
  }
  const li = profile.linkedinUrl || profile.linkedin_url || profile.linkedin;
  if (li) {
    contactParts.push(li.replace(/^https?:\/\//, '').replace(/\/+$/, ''));
  }

  const contactStr = contactParts.join('  •  ');
  doc.drawText(contactStr, { size: 8.5, font: 'regular', align: 'center', color: [0.25, 0.25, 0.25] });
  doc.currentY -= 12;

  // Header Divider
  doc.drawLine(leftX, doc.currentY, rightX, doc.currentY, { width: 1.2, color: [0.1, 0.1, 0.1] });
  doc.currentY -= 14;

  function renderSectionHeader(title) {
    doc.checkPageBreak(30);
    doc.drawText(title.toUpperCase(), { size: 10.5, font: 'bold', color: [0.05, 0.05, 0.05] });
    doc.currentY -= 4;
    doc.drawLine(leftX, doc.currentY, rightX, doc.currentY, { width: 0.6, color: [0.3, 0.3, 0.3] });
    doc.currentY -= 10;
  }

  // 2. PROFESSIONAL SUMMARY
  if (profile.bio) {
    renderSectionHeader('Professional Summary');
    const summaryLines = doc.wrapText(profile.bio, 105);
    for (const line of summaryLines) {
      doc.checkPageBreak(12);
      doc.drawText(line, { size: 9, font: 'regular', color: [0.15, 0.15, 0.15] });
      doc.currentY -= 11.5;
    }
    doc.currentY -= 5;
  }

  // 3. EDUCATION & ACADEMIC QUALIFICATIONS
  if (education.length > 0) {
    renderSectionHeader('Education & Academic Qualifications');
    for (const edu of education) {
      doc.checkPageBreak(32);
      doc.drawText(edu.institution || '', { size: 10, font: 'bold', color: [0, 0, 0] });
      const dateStr = `${edu.startDate || ''} – ${edu.currentlyStudying ? 'Present' : (edu.endDate || '')}`;
      doc.drawText(dateStr, { size: 9, font: 'regular', align: 'right', color: [0.2, 0.2, 0.2] });
      doc.currentY -= 12;

      const degStr = `${edu.qualification || ''}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      doc.drawText(degStr, { size: 9, font: 'italic', color: [0.2, 0.2, 0.2] });
      if (edu.gradeValue) {
        const gradeStr = `${edu.gradeType || 'CGPA'}: ${edu.gradeValue}${edu.gradeScale ? ` / ${edu.gradeScale}` : ''}`;
        doc.drawText(gradeStr, { size: 9, font: 'bold', align: 'right', color: [0.1, 0.1, 0.1] });
      }
      doc.currentY -= 11;

      if (edu.coursework) {
        const cwLines = doc.wrapText(`Coursework: ${edu.coursework}`, 108);
        for (const line of cwLines) {
          doc.checkPageBreak(11);
          doc.drawText(line, { size: 8.5, font: 'regular', color: [0.3, 0.3, 0.3] });
          doc.currentY -= 10.5;
        }
      }

      const honors = edu.achievements || edu.honors;
      if (honors) {
        const hLines = doc.wrapText(`Honors & Awards: ${honors}`, 108);
        for (const line of hLines) {
          doc.checkPageBreak(11);
          doc.drawText(line, { size: 8.5, font: 'regular', color: [0.2, 0.2, 0.2] });
          doc.currentY -= 10.5;
        }
      }

      doc.currentY -= 4;
    }
    doc.currentY -= 3;
  }

  // 4. TECHNICAL SKILLS & COMPETENCIES
  if (skills.length > 0) {
    renderSectionHeader('Technical Skills & Competencies');
    const skillsByCategory = {};
    for (const s of skills) {
      const cat = s.category || 'Competencies';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      const skillName = typeof s === 'string' ? s : (s.name || s.skill || s.title || '');
      if (skillName) skillsByCategory[cat].push(skillName);
    }

    const categoryLabels = {
      languages: 'Programming Languages',
      frontend: 'Frontend & UI Engineering',
      backend: 'Backend & Systems Architecture',
      databases: 'Databases & Storage',
      cloud: 'Cloud & Infrastructure',
      tools: 'Developer Tooling & DevOps'
    };

    for (const [cat, list] of Object.entries(skillsByCategory)) {
      doc.checkPageBreak(14);
      const catLabel = categoryLabels[cat.toLowerCase()] || (cat.charAt(0).toUpperCase() + cat.slice(1));
      const skillText = `•  ${catLabel}: ${list.join(', ')}`;
      const lines = doc.wrapText(skillText, 105);
      for (const line of lines) {
        doc.drawText(line, { size: 9, font: 'regular', color: [0.15, 0.15, 0.15] });
        doc.currentY -= 11.5;
      }
    }
    doc.currentY -= 5;
  }

  // 5. WORK & ENGINEERING EXPERIENCE
  if (experiences.length > 0) {
    renderSectionHeader('Engineering & Work Experience');
    for (const exp of experiences) {
      doc.checkPageBreak(30);
      doc.drawText(exp.organization || exp.company || '', { size: 10, font: 'bold', color: [0, 0, 0] });
      const dateStr = `${exp.startDate || ''} – ${exp.currentlyActive ? 'Present' : (exp.endDate || '')}`;
      doc.drawText(dateStr, { size: 9, font: 'regular', align: 'right', color: [0.2, 0.2, 0.2] });
      doc.currentY -= 12;

      const roleLoc = `${exp.role || ''}${exp.location ? `  •  ${exp.location}` : ''}`;
      doc.drawText(roleLoc, { size: 9, font: 'italic', color: [0.25, 0.25, 0.25] });
      doc.currentY -= 11;

      if (exp.description) {
        const descLines = doc.wrapText(exp.description, 105);
        for (const line of descLines) {
          doc.checkPageBreak(11);
          doc.drawText(line, { size: 8.5, font: 'regular', color: [0.2, 0.2, 0.2] });
          doc.currentY -= 10.5;
        }
      }

      const expHighlights = exp.highlights || exp.bullets;
      if (expHighlights && Array.isArray(expHighlights)) {
        for (const hl of expHighlights) {
          const hlLines = doc.wrapText(`•  ${hl}`, 105);
          for (const line of hlLines) {
            doc.checkPageBreak(11);
            doc.drawText(line, { size: 8.5, font: 'regular', color: [0.2, 0.2, 0.2] });
            doc.currentY -= 10.5;
          }
        }
      }

      doc.currentY -= 5;
    }
    doc.currentY -= 3;
  }

  // 6. SELECTED PROJECTS & SYSTEMS
  const activeProjects = (projects || []).filter(p => p.displayOnPortfolio !== false);
  if (activeProjects.length > 0) {
    renderSectionHeader('Selected Projects & Systems');
    for (const proj of activeProjects) {
      doc.checkPageBreak(30);
      doc.drawText(proj.title || '', { size: 10, font: 'bold', color: [0, 0, 0] });
      
      const repoUrl = proj.repo_url || proj.github_url || proj.githubUrl || '';
      const liveUrl = proj.live_url || proj.demo_url || proj.liveUrl || '';

      if (repoUrl || liveUrl) {
        let rightCursor = rightX;
        if (liveUrl) {
          const liveText = 'Live Demo';
          const w = doc.getTextWidth(liveText, 8.5, 'bold');
          const x = rightCursor - w;
          doc.drawText(liveText, { x, y: doc.currentY, size: 8.5, font: 'bold', color: [0.1, 0.35, 0.75] });
          doc.addLinkAnnotation(x, doc.currentY - 2, rightCursor, doc.currentY + 9, liveUrl.startsWith('http') ? liveUrl : 'https://' + liveUrl);
          rightCursor = x - 10;
          if (repoUrl) {
            doc.drawText('•', { x: rightCursor + 3, y: doc.currentY, size: 8.5, font: 'regular', color: [0.5, 0.5, 0.5] });
          }
        }
        if (repoUrl) {
          const repoText = 'Repository';
          const w = doc.getTextWidth(repoText, 8.5, 'bold');
          const x = rightCursor - w;
          doc.drawText(repoText, { x, y: doc.currentY, size: 8.5, font: 'bold', color: [0.1, 0.35, 0.75] });
          doc.addLinkAnnotation(x, doc.currentY - 2, rightCursor, doc.currentY + 9, repoUrl.startsWith('http') ? repoUrl : 'https://' + repoUrl);
        }
      }
      doc.currentY -= 11;

      if (proj.tags && (Array.isArray(proj.tags) ? proj.tags.length : proj.tags)) {
        const stackStr = `Tech Stack: ${Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags}`;
        doc.drawText(stackStr, { size: 8.5, font: 'italic', color: [0.35, 0.35, 0.35] });
        doc.currentY -= 10.5;
      }

      if (proj.description) {
        const descLines = doc.wrapText(proj.description, 105);
        for (const line of descLines) {
          doc.checkPageBreak(11);
          doc.drawText(line, { size: 8.5, font: 'regular', color: [0.2, 0.2, 0.2] });
          doc.currentY -= 10.5;
        }
      }

      if (proj.highlights && Array.isArray(proj.highlights)) {
        for (const hl of proj.highlights) {
          const hlLines = doc.wrapText(`•  ${hl}`, 105);
          for (const line of hlLines) {
            doc.checkPageBreak(11);
            doc.drawText(line, { size: 8.5, font: 'regular', color: [0.2, 0.2, 0.2] });
            doc.currentY -= 10.5;
          }
        }
      }

      doc.currentY -= 5;
    }
    doc.currentY -= 3;
  }

  // 7. CERTIFICATIONS
  if (certifications.length > 0) {
    renderSectionHeader('Certifications & Credentials');
    for (const c of certifications) {
      doc.checkPageBreak(14);
      const certText = `•  ${c.title} – ${c.issuer} (${c.issueDate || 'Verified'})`;
      doc.drawText(certText, { size: 9, font: 'regular', color: [0.15, 0.15, 0.15] });
      const certUrl = c.credentialUrl || c.credential_url || c.url;
      if (certUrl) {
        const verifyText = 'Verify ↗';
        const w = doc.getTextWidth(verifyText, 8.5, 'bold');
        const x = rightX - w;
        doc.drawText(verifyText, { x, y: doc.currentY, size: 8.5, font: 'bold', color: [0.1, 0.35, 0.75] });
        doc.addLinkAnnotation(x, doc.currentY - 2, rightX, doc.currentY + 9, certUrl.startsWith('http') ? certUrl : 'https://' + certUrl);
      }
      doc.currentY -= 11.5;
    }
  }

  return doc.buildUint8Array();
}

/**
 * Triggers an immediate browser download of the ATS Resume PDF file
 * without redirecting or navigating away from the page.
 * @param {Object} userData Full portfolio dataset
 * @param {string} username Target username slug
 */
export function downloadAtsResumePdf(userData, username = 'developer') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const pdfBytes = generateAtsResumePdf(userData, username);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const displayName = (userData?.profile?.fullName || userData?.profile?.displayName || username)
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${displayName}_ATS_Resume.pdf`;

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    // Show temporary toast feedback
    showResumeDownloadToast(fileName);
  } catch (err) {
    console.error('Error downloading ATS Resume PDF:', err);
    // Graceful fallback to print preview
    window.open(`/u/${encodeURIComponent(username)}/resume`, '_blank');
  }
}

function showResumeDownloadToast(fileName) {
  const existing = document.getElementById('resume-download-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'resume-download-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: var(--bg-surface, #141515);
    border: 1px solid var(--accent-primary, #8FE0AE);
    color: var(--text-primary, #F4F7F4);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    padding: 12px 20px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;

  toast.innerHTML = `
    <span style="color: var(--accent-primary, #8FE0AE); font-size: 16px;">✓</span>
    <span>Downloading <strong>${fileName}</strong></span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}
