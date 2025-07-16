
# 📄 PDF Merger with Preview

A user-friendly web application that allows you to **upload**, **reorder**, **preview**, and **merge** multiple PDF files — all in your browser with no server upload!

## ✨ Features

- 📤 Drag & drop or browse to upload multiple PDF files
- 👀 Preview individual PDFs within a modal viewer
- 🔀 Reorder PDFs using drag-and-drop interface
- 📎 Merge PDFs into a single downloadable file
- 📏 Displays file sizes and live progress bar
- ⚡ Fully client-side (No server upload needed)

## 🚀 Live Demo

> https://ranjit-dey.github.io/pdf-merger/

## 🖼️ UI Overview

- **Upload Area**: Drag & drop zone or click to upload
- **PDF List**: Shows uploaded PDFs with preview and remove options
- **Merge Button**: Merges all uploaded PDFs in the given order
- **Clear All Button**: Removes all uploaded files
- **Preview Modal**: Iframe-based preview with next/previous page navigation

## 🛠️ Tech Stack

- HTML5 + CSS3 (Responsive, modern design)
- Vanilla JavaScript
- [PDF-Lib](https://pdf-lib.js.org/) for merging PDF files
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF preview
- [download.js](https://github.com/rndme/download) for downloading merged file

## 📁 Project Structure

```

📦 pdf-merger/
├── index.html         # Main UI layout
├── pdf.js             # Core JS logic for upload, reorder, preview, merge
└── README.md          # You're reading it!

```

## 🧩 How to Use

1. Open `index.html` in your browser
2. Upload two or more PDF files via drag & drop or file selector
3. (Optional) Preview any file or rearrange their order
4. Click **"Merge PDFs"**
5. Download the merged file

## ✅ Requirements

- Modern browser with JavaScript enabled
- Internet connection (for CDN assets like `pdf-lib`, `pdf.js`, etc.)

## 📌 Notes

- Merging is handled completely in the browser. Your files never leave your device.
- Only `.pdf` files are supported.
- Preview modal uses PDF.js for navigating pages.

## 📃 License

MIT License

## 👨‍💻 Author

**Ranjit Dey**

- [Portfolio](https://ranjitdey.vercel.app)
- [GitHub](https://github.com/ranjit-dey)
- [LinkedIn](https://www.linkedin.com/in/ranjitdey)

