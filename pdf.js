// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const pdfList = document.getElementById('pdf-list');
  const mergeBtn = document.getElementById('merge-btn');
  const clearBtn = document.getElementById('clear-btn');
  const statusDiv = document.getElementById('status');
  const progressBar = document.getElementById('progress-bar');
  const progress = document.getElementById('progress');
  
  // Preview elements
  const previewModal = document.getElementById('preview-modal');
  const previewIframe = document.getElementById('preview-iframe');
  const closePreview = document.getElementById('close-preview');
  const previewTitle = document.getElementById('preview-title');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  
  let pdfFiles = [];
  let dragSrcEl = null;
  let currentPreviewIndex = -1;
  let currentPdf = null;
  let currentPage = 1;
  let totalPages = 1;

  // Handle click on upload area
  uploadArea.addEventListener('click', function() {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', function(e) {
    handleFiles(e.target.files);
    fileInput.value = ''; // Reset input to allow selecting same files again
  });

  // Handle drag over
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('highlight');
  });

  // Handle drag leave
  uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('highlight');
  });

  // Handle drop
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('highlight');
    
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // Handle files
  function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (newFiles.length === 0) {
      statusDiv.textContent = 'Please select PDF files only.';
      return;
    }
    
    pdfFiles = [...pdfFiles, ...newFiles];
    renderPdfList();
    updateButtons();
  }

  // Render PDF list
  function renderPdfList() {
    pdfList.innerHTML = '';
    
    if (pdfFiles.length === 0) {
      return;
    }
    
    pdfFiles.forEach((file, index) => {
      const pdfItem = document.createElement('div');
      pdfItem.className = 'pdf-item';
      pdfItem.draggable = true;
      pdfItem.dataset.index = index;
      
      pdfItem.innerHTML = `
        <span class="drag-handle">☰</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
        <button class="preview-btn" data-index="${index}">Preview</button>
        <button class="remove-btn" data-index="${index}">×</button>
      `;
      
      pdfList.appendChild(pdfItem);
    });
    
    // Add drag and drop event listeners
    addDragAndDropListeners();
    
    // Add remove button event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        pdfFiles.splice(index, 1);
        renderPdfList();
        updateButtons();
      });
    });
    
    // Add preview button event listeners
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        showPreview(index);
      });
    });
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Update buttons state
  function updateButtons() {
    mergeBtn.disabled = pdfFiles.length < 2;
    clearBtn.disabled = pdfFiles.length === 0;
  }

  // Add drag and drop listeners
  function addDragAndDropListeners() {
    const items = document.querySelectorAll('.pdf-item');
    
    items.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('dragleave', handleDragLeave);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);
    });
  }

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.style.opacity = '0.4';
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('over');
    return false;
  }

  function handleDragLeave() {
    this.classList.remove('over');
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    if (dragSrcEl !== this) {
      const fromIndex = parseInt(dragSrcEl.dataset.index);
      const toIndex = parseInt(this.dataset.index);
      
      // Reorder the files array
      const movedFile = pdfFiles[fromIndex];
      pdfFiles.splice(fromIndex, 1);
      pdfFiles.splice(toIndex, 0, movedFile);
      
      // Re-render the list
      renderPdfList();
    }
    
    return false;
  }

  function handleDragEnd() {
    this.style.opacity = '1';
    document.querySelectorAll('.pdf-item').forEach(item => {
      item.classList.remove('over');
    });
  }

  // Clear all files
  clearBtn.addEventListener('click', function() {
    pdfFiles = [];
    renderPdfList();
    updateButtons();
    statusDiv.textContent = '';
    progressBar.style.display = 'none';
  });

  // Merge PDFs using PDF-Lib
  mergeBtn.addEventListener('click', async function() {
    if (pdfFiles.length < 2) {
      statusDiv.textContent = 'Please add at least 2 PDF files to merge.';
      return;
    }
    
    statusDiv.textContent = 'Merging PDFs...';
    progressBar.style.display = 'block';
    progress.style.width = '0%';
    mergeBtn.disabled = true;
    
    try {
      // Create a new PDF document
      const { PDFDocument } = PDFLib;
      const mergedPdf = await PDFDocument.create();
      
      // Process each PDF file
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        statusDiv.textContent = `Processing ${i+1}/${pdfFiles.length} (${file.name})...`;
        progress.style.width = `${((i + 1) / pdfFiles.length) * 100}%`;
        
        // Read the file as ArrayBuffer
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Copy pages to the merged document
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create a download link
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      download(blob, 'merged.pdf', 'application/pdf');
      
      statusDiv.textContent = `Successfully merged ${pdfFiles.length} PDFs!`;
      progress.style.width = '100%';
    } catch (error) {
      console.error('Error merging PDFs:', error);
      statusDiv.textContent = 'Error merging PDFs: ' + error.message;
      progressBar.style.display = 'none';
    } finally {
      mergeBtn.disabled = false;
    }
  });

  // Helper function to read file as ArrayBuffer
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Show PDF preview
  async function showPreview(index) {
    currentPreviewIndex = index;
    const file = pdfFiles[index];
    previewTitle.textContent = `Preview: ${file.name}`;
    previewModal.style.display = 'flex';
    
    try {
      // Create object URL for the PDF file
      const url = URL.createObjectURL(file);
      previewIframe.src = url;
      
      // Load the PDF with PDF.js to get page count
      const loadingTask = pdfjsLib.getDocument(url);
      currentPdf = await loadingTask.promise;
      totalPages = currentPdf.numPages;
      currentPage = 1;
      
      updatePageInfo();
      updateNavButtons();
    } catch (error) {
      console.error('Error loading PDF:', error);
      previewIframe.srcdoc = `<html><body><p>Error loading PDF preview</p></body></html>`;
    }
  }

  // Close preview
  closePreview.addEventListener('click', function() {
    previewModal.style.display = 'none';
    if (previewIframe.src) {
      URL.revokeObjectURL(previewIframe.src);
      previewIframe.src = '';
    }
    currentPdf = null;
  });

  // Previous page
  prevPageBtn.addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      updatePageInIframe();
      updatePageInfo();
      updateNavButtons();
    }
  });

  // Next page
  nextPageBtn.addEventListener('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      updatePageInIframe();
      updatePageInfo();
      updateNavButtons();
    }
  });

  // Update page in iframe
  function updatePageInIframe() {
    const file = pdfFiles[currentPreviewIndex];
    const url = URL.createObjectURL(file);
    previewIframe.src = `${url}#page=${currentPage}`;
  }

  // Update page info display
  function updatePageInfo() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // Update navigation buttons state
  function updateNavButtons() {
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  // Close modal when clicking outside
  previewModal.addEventListener('click', function(e) {
    if (e.target === previewModal) {
      closePreview.click();
    }
  });
});