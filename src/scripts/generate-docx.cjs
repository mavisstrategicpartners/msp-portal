const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

async function main() {
  const mdPath = path.join(__dirname, '../../docs/MSP_COMPLETE_SYSTEM_AND_LOGIN_DOCUMENTATION.md');
  const docxPath = path.join(__dirname, '../../docs/MSP_COMPLETE_SYSTEM_AND_LOGIN_DOCUMENTATION.docx');

  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const docChildren = [];

  // Title page elements
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: "Mavis Strategic Partners (MSP)",
          bold: true,
          size: 48,
          color: "3b1d4d",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Company Operations and Performance Dashboard",
          size: 32,
          bold: true,
          color: "1e0a29",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Complete System Guide, User Manual, Administrator Handover & Official Governance Documentation",
          size: 24,
          italics: true,
          color: "555555",
        }),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Version: 2.0.0 (Master Release) | Date: 16 October 2026",
          size: 20,
          bold: true,
          color: "2e7d32",
        }),
      ],
      spacing: { after: 600 },
    })
  );

  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip frontmatter or horizontal divider
    if (line === '---' || line.startsWith('```')) {
      continue;
    }

    // Markdown Table handling
    if (line.startsWith('|')) {
      // Check if it's a separator line | :--- | :--- |
      if (line.replace(/[\s|:-]/g, '') === '') {
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isHeader = !inTable;
      inTable = true;

      const row = new TableRow({
        children: cells.map(cellText => new TableCell({
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText.replace(/\*\*/g, ''),
                  bold: isHeader || cellText.includes('**'),
                  size: isHeader ? 18 : 17,
                  color: isHeader ? "ffffff" : "000000",
                }),
              ],
            }),
          ],
          shading: isHeader ? { fill: "3b1d4d" } : undefined,
        })),
      });
      tableRows.push(row);
      continue;
    } else if (inTable) {
      // End of table
      docChildren.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      docChildren.push(new Paragraph({ spacing: { after: 200 } }));
      inTable = false;
      tableRows = [];
    }

    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: line.replace(/^#\s+/, ''), bold: true, size: 32, color: "3b1d4d" })],
          spacing: { before: 400, after: 150 },
        })
      );
    } else if (line.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line.replace(/^##\s+/, ''), bold: true, size: 26, color: "2d123d" })],
          spacing: { before: 300, after: 120 },
        })
      );
    } else if (line.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: line.replace(/^###\s+/, ''), bold: true, size: 22, color: "1a1026" })],
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: line.replace(/^[\*\-]\s+/, '').replace(/\*\*/g, ''), size: 20 })],
          spacing: { after: 80 },
        })
      );
    } else if (/^\d+\.\s+/.test(line)) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: line.replace(/\*\*/g, ''), size: 20 }),
          ],
          spacing: { after: 80 },
        })
      );
    } else {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: line.replace(/\*\*/g, ''), size: 20 })],
          spacing: { after: 120 },
        })
      );
    }
  }

  if (inTable && tableRows.length > 0) {
    docChildren.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log('Successfully generated Word document at:', docxPath, 'Size:', buffer.length, 'bytes');
}

main().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
