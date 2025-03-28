# Next.js PDF Generation & Viewing Solution

A comprehensive solution for PDF generation and viewing in web applications using Next.js. This project integrates jsPDF, jsPDF-AutoTable, react-pdf, and react-zoom-pan-pinch to provide a reliable, feature-rich PDF workflow with CJK language support.

![Screenshot](docs/images/screenshot.png)

## 🔥 Key Features

- **Best-in-class Table Generation** with jsPDF-AutoTable - handles automatic table wrapping, pagination, and styling
- **Full Multilingual Support** with embedded CJK fonts (Source Han Sans)
- **All-in-One Workflow:** Generate, preview, zoom, and interact with PDFs in a single solution
- **Interactive Controls** for zoom, pan, and pinch with react-zoom-pan-pinch
- **Modern UI** built with Next.js 15 and React 19
- **TypeScript Support** for improved development experience

## 🚀 Why This Solution Is Superior

While many PDF solutions exist for web applications, this project addresses critical challenges that others don't:

1. **Reliable Table Rendering** - jsPDF-AutoTable is the most robust solution for PDF tables, avoiding the common bugs and rendering issues found in alternatives
2. **Automatic Table Pagination** - Tables automatically wrap and paginate without requiring manual height calculations
3. **Seamless CJK Support** - Properly handles Chinese, Japanese, and Korean characters without font issues
4. **Preview + Generation** - Generate and preview in the same workflow - no need to download PDFs to view them
5. **Client-side Only** - No server dependencies required for PDF operations

This integration offers an optimal solution that avoids the "thousand strange bugs" often encountered with other approaches, which frequently require manual component height measurements to properly position content.

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm/yarn

## 🛠️ Installation

1. Clone this repository:
```bash
git clone https://github.com/fanzzzd/nextjs-jspdf-autotable.git
cd nextjs-jspdf-autotable
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧩 Core Components

### PDF Generation with jsPDF-AutoTable - Reliable Table Generation

The integration with jsPDF-AutoTable provides several critical advantages:

- **Automatic Pagination** - Tables automatically break across pages when content exceeds page height
- **Consistent Styling** - Tables maintain consistent style and structure across page breaks
- **Cell Spanning** - Support for rowspan and colspan
- **Text Wrapping** - Content automatically wraps within cells to fit constraints
- **Customizable Styles** - Full control over fonts, colors, borders, and spacing

Example usage:

```tsx
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Import font definition files
import "@/fonts/SourceHanSans-normal.js";
import "@/fonts/SourceHanSans-bold.js";

// Create a new PDF document
const generatePDF = () => {
  // Initialize with a font supporting CJK characters
  const doc = new jsPDF();
  
  // Set the font
  doc.setFont('SourceHanSans');
  
  // Add content
  doc.text('Hello World - 你好，世界 - こんにちは世界', 10, 10);
  
  // Add a table with automatic wrapping and pagination
  doc.autoTable({
    head: [['Name', '名称', 'Price', 'Description']],
    body: [
      ['Product A', '产品A', '$10.00', 'This is a description that will automatically wrap if it becomes too long for the cell width'],
      ['Product B', '产品B', '$20.00', 'Another description that will wrap properly when needed'],
      ['Product C', '产品C', '$30.00', 'Third product with automatic text wrapping capabilities'],
      // Add more rows to demonstrate pagination
      ...Array(50).fill().map((_, i) => [`Item ${i+4}`, `项目${i+4}`, `$${(i+4)*10}.00`, 'Automatically paginated content'])
    ],
    styles: {
      font: 'SourceHanSans',
      fontStyle: 'normal',
      overflow: 'linebreak', // Enable text wrapping
    },
    headStyles: {
      fontStyle: 'bold',
    },
  });
  
  // Save or open the PDF
  doc.save('example.pdf');
};
```

### PDF Viewing with react-pdf

The integrated PDF viewer component allows users to view generated PDFs directly in the browser:

```tsx
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>
        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
```

### Interactive PDF Experience with react-zoom-pan-pinch

Enhance the PDF viewing experience with zoom, pan, and pinch controls:

```tsx
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Document, Page } from 'react-pdf';

const InteractivePDFViewer = ({ url }) => {
  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <div className="tools">
            <button onClick={() => zoomIn()}>+</button>
            <button onClick={() => zoomOut()}>-</button>
            <button onClick={() => resetTransform()}>Reset</button>
          </div>
          <TransformComponent>
            <Document file={url}>
              <Page pageNumber={1} />
            </Document>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
};
```

## 🧠 Complete Workflow Example

Create a complete PDF workflow where users can generate and then immediately view PDFs with all features enabled:

```tsx
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Page } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Import font definition files
import "@/fonts/SourceHanSans-normal.js";
import "@/fonts/SourceHanSans-bold.js";

const PDFWorkflow = () => {
  const [pdfBlob, setPdfBlob] = useState(null);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Set the font
    doc.setFont('SourceHanSans');
    
    // Add content
    doc.text('Generated PDF with CJK Support - 中文支持', 10, 10);
    
    // Add table with automatic pagination
    doc.autoTable({
      head: [['ID', 'Name', 'Description', 'Price']],
      body: Array(50).fill().map((_, i) => [
        i + 1,
        `Product ${i + 1}`,
        `This is product ${i + 1} with a lengthy description that demonstrates automatic text wrapping within table cells. The content will properly wrap to fit the available width.`,
        `$${(i + 1) * 10.99}`
      ]),
      styles: {
        font: 'SourceHanSans',
        overflow: 'linebreak' // Enable text wrapping
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Create a blob from the PDF
    const blob = doc.output('blob');
    setPdfBlob(blob);
  };

  return (
    <div className="pdf-workflow">
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Generate PDF with Tables
      </button>
      
      {pdfBlob && (
        <div className="pdf-viewer mt-8 border rounded p-4">
          <h2 className="text-xl font-bold mb-4">PDF Preview</h2>
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="tools mb-4 flex gap-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() => zoomIn()}
                  >
                    +
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() => zoomOut()}
                  >
                    -
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() => resetTransform()}
                  >
                    Reset
                  </button>
                </div>
                <TransformComponent>
                  <Document file={pdfBlob}>
                    <Page pageNumber={1} />
                  </Document>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}
    </div>
  );
};
```

## 📝 Why jsPDF-AutoTable Is Superior

jsPDF-AutoTable offers significant advantages over alternative PDF table solutions:

1. **Reliable Table Layout** - Unlike other solutions, tables properly flow across pages, maintaining headers and styling
2. **No Manual Height Calculations** - Other approaches often require tedious manual calculations to determine where content should break
3. **Native Text Wrapping** - Text automatically wraps within cells, eliminating common overflow issues
4. **Proper CJK Support** - When combined with font embedding, handles CJK characters seamlessly
5. **Consistent Styling** - Maintains consistent styling and formatting throughout multi-page tables

These advantages eliminate many of the strange bugs and issues encountered with alternatives, particularly when dealing with large tables or multilingual content.

## 🔧 Implementation Notes

### Font Loading Strategy

For CJK (Chinese, Japanese, Korean) support, this project includes:

1. Pre-processed font files in JavaScript format (in the `src/fonts` directory)
2. Direct imports of the font files (no need for explicit VFS loading)

This approach ensures proper display of CJK characters in the generated PDFs without requiring server-side processing.

### PDF Worker Configuration

To ensure proper loading of the PDF.js worker:

1. Worker file is stored in the public directory
2. Worker is referenced in the PDF viewer component:
   ```js
   pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
   ```

## 🔍 Troubleshooting Common Issues

### Table Pagination Problems

If tables aren't paginating properly:

1. Ensure you're using the correct version of jspdf-autotable (5.0.2+)
2. Check that you've enabled text wrapping with the `overflow: 'linebreak'` option
3. Avoid fixed height settings that might conflict with automatic pagination

### Font Issues

For font problems:

1. Verify that font files are properly imported
2. Check that the font names match exactly in `setFont` calls
3. Test with simple content first to isolate any issues

### PDF Preview Rendering Issues

If the PDF preview doesn't render correctly:

1. Ensure the PDF worker is correctly loaded
2. Check browser console for any errors
3. Try using an absolute path for the worker if relative paths aren't working

## 📚 Resources

- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- [jsPDF-AutoTable Documentation](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [react-pdf Documentation](https://react-pdf.org/)
- [react-zoom-pan-pinch Documentation](https://github.com/prc5/react-zoom-pan-pinch)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

This project is MIT licensed - see the LICENSE file for details.

## 👉 Next Steps

1. Add form filling capabilities
2. Support for PDF annotations
3. Create more comprehensive examples for different use cases
4. Add automated tests for PDF generation and viewing workflows
5. Support for more complex layouts and styling
6. Integration with data sources and APIs
7. PDF password protection and security features

## 🙏 Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js 15, React 19, jsPDF, jsPDF-AutoTable, react-pdf, and react-zoom-pan-pinch.