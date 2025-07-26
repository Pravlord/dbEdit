import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// (2) Initialize Supabase client using project URL and anon/public API key
const SUPABASE_URL = 'https://qhcnubeiqwyxdkxhmyhf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoY251YmVpcXd5eGRreGhteWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjYzOTIsImV4cCI6MjA2Njg0MjM5Mn0.W34cY2JyH8fYqG4yC-wLXo1FkDVWaDqHEqkYohF2HA4'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// (3) Dark mode toggle logic
const darkToggle = document.getElementById('darkmode-toggle')
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode')
    darkToggle.classList.toggle('dark')
  })
}

// (5) Animate search bar and show tab container on search
const searchForm = document.getElementById('company-search-form')
const searchBarContainer = document.getElementById('searchbar-container')
const tabFadeContainer = document.getElementById('tab-fade-container')
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault()
    searchBarContainer.classList.add('to-top')
    tabFadeContainer.classList.remove('hidden')
    setTimeout(() => {
      tabFadeContainer.classList.add('visible')
    }, 10)
  })
}
// (5) Tab switching logic
const tabBtns = document.querySelectorAll('.tab-btn')
const tabContents = document.querySelectorAll('.tab-content')
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'))
    tabContents.forEach(c => c.classList.remove('active'))
    btn.classList.add('active')
    const tab = btn.getAttribute('data-tab')
    document.getElementById('tab-content-' + tab).classList.add('active')
  })
})

// (6) Prevent default submit for edit fields (for now)
const editFieldsForm = document.querySelector('.edit-fields-form')
if (editFieldsForm) {
  editFieldsForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // TODO: Save logic will go here
  })
}





// (14) Define async function fetchSuggestions(query):
//        query Supabase 'clients' table for names matching case-insensitive using .ilike('%query%'), return array of names

// (6) Cache DOM elements for #search-input, suggestions container, .tab buttons, and .tab-content containers

// (15) Add input event listener on #search-input to call fetchSuggestions on each keystroke, populate dropdown container with suggestions, handle suggestion click to fill input

// (7) Add click event listeners to .tab buttons to toggle .active class on tabs and corresponding content divs

// --- Simple Company Name Suggestions ---
const searchInput = document.getElementById('company-search');
const suggestionsList = document.getElementById('suggestions-list');
let currentSuggestionIndex = -1;

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  currentSuggestionIndex = -1;
  if (query.length < 1) {
    suggestionsList.innerHTML = '';
    return;
  }
  // Fetch suggestions from Supabase (case-insensitive, partial match)
  const { data, error } = await supabase
    .from('company_details')
    .select('companyName')
    .ilike('companyName', `%${query}%`)
    .limit(8);
  if (error || !data || data.length === 0) {
    suggestionsList.innerHTML = '';
    return;
  }
  suggestionsList.innerHTML = data.map((row, index) =>
    `<div class="suggestion-item" data-index="${index}">${row.companyName}</div>`
  ).join('');
});

// Function to trigger search animation
function triggerSearchAnimation() {
  searchBarContainer.classList.add('to-top');
  tabFadeContainer.classList.remove('hidden');
  setTimeout(() => {
    tabFadeContainer.classList.add('visible');
  }, 10);
}

// Function to populate Annual Returns table
async function populateAnnualReturnsTable(pvNumber) {
  try {
    const { data, error } = await supabase
      .from('annual_returns')
      .select('year, formNo')
      .eq('pvNumber', pvNumber)
      .order('year', { ascending: false });
    
    if (error) {
      console.error('Error fetching annual returns:', error);
      return;
    }

    const tableBody = document.querySelector('#annual-returns-table tbody');
    
    // Clear existing data
    tableBody.innerHTML = '';
    
    // Add fetched data
    if (data && data.length > 0) {
      // Use dynamic row addition for database imports
      const rowsToCreate = Math.max(data.length, 20); // Minimum 20 rows, or more if data exceeds
      
      // Create all needed rows first
      for (let i = 0; i < rowsToCreate; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
      
      // Populate with actual data
      data.forEach((item, index) => {
        const row = tableBody.children[index];
        if (row) {
          row.children[0].textContent = item.year || '';
          row.children[1].textContent = item.formNo || '';
        }
      });
      
      // Show notification if more than 20 rows were created
      if (data.length > 20) {
        showPasteNotification(`Imported ${data.length} annual returns from database (expanded table to accommodate data)`);
      }
      
      // Update cell titles for truncated text
      updateCellTitles();
      
    } else {
      // No data found - create minimum 20 empty rows
      for (let i = 0; i < 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    }
  } catch (err) {
    console.error('Error populating annual returns table:', err);
  }
}

// Function to populate company data in the form
async function populateCompanyData(companyName) {
  try {
    const { data, error } = await supabase
      .from('company_details')
      .select('pvNumber, companyName, previousName, registeredAddress, incorporationDate, notes')
      .eq('companyName', companyName)
      .single();
    
    if (error || !data) {
      console.error('Error fetching company data:', error);
      return;
    }

    // Populate form fields
    document.getElementById('pvNumber').value = data.pvNumber || '';
    document.getElementById('companyName').value = data.companyName || '';
    document.getElementById('previousName').value = data.previousName || '';
    document.getElementById('registeredAddress').value = data.registeredAddress || '';
    document.getElementById('incorporationDate').value = data.incorporationDate || '';
    document.getElementById('notes').value = data.notes || '';
    
    // Populate all tables using the pvNumber
    if (data.pvNumber) {
      await Promise.all([
        populateAnnualReturnsTable(data.pvNumber),
        populateDirectorsTable(data.pvNumber),
        populateResolutionsTable(data.pvNumber),
        populateShareholdersTable(data.pvNumber),
        populateCompanyActionsTable(data.pvNumber)
      ]);
    }
  } catch (err) {
    console.error('Error populating company data:', err);
  }
}

// Function to select a company
function selectCompany(companyName) {
  searchInput.value = companyName;
  suggestionsList.innerHTML = '';
  currentSuggestionIndex = -1;
  triggerSearchAnimation();
  // Populate company data in the form
  populateCompanyData(companyName);
}

// Function to update visual selection
function updateSuggestionSelection() {
  const items = suggestionsList.querySelectorAll('.suggestion-item');
  items.forEach((item, index) => {
    if (index === currentSuggestionIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

// Arrow key navigation
searchInput.addEventListener('keydown', (e) => {
  const items = suggestionsList.querySelectorAll('.suggestion-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentSuggestionIndex = (currentSuggestionIndex + 1) % items.length;
    updateSuggestionSelection();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentSuggestionIndex = currentSuggestionIndex <= 0 ? items.length - 1 : currentSuggestionIndex - 1;
    updateSuggestionSelection();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
      selectCompany(items[currentSuggestionIndex].textContent);
    } else if (searchInput.value.trim()) {
      // If no suggestion selected but there's text, trigger search anyway
      triggerSearchAnimation();
    }
  } else if (e.key === 'Escape') {
    suggestionsList.innerHTML = '';
    currentSuggestionIndex = -1;
  }
});

// Mouse click selection
suggestionsList.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('suggestion-item')) {
    selectCompany(e.target.textContent);
  }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
    suggestionsList.innerHTML = '';
    currentSuggestionIndex = -1;
  }
});
// --- End simple suggestions ---

// --- Table Accordion Functionality ---
document.addEventListener('DOMContentLoaded', () => {
  const tableHeaders = document.querySelectorAll('.table-header');
  
  tableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const target = header.dataset.target;
      const content = document.getElementById(target + '-content');
      const icon = header.querySelector('.expand-icon');
      const isCollapsed = content.classList.contains('collapsed');
      
      // Collapse all other tables
      tableHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          const otherTarget = otherHeader.dataset.target;
          const otherContent = document.getElementById(otherTarget + '-content');
          const otherIcon = otherHeader.querySelector('.expand-icon');
          
          otherContent.classList.add('collapsed');
          otherIcon.textContent = '▶';
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });
      
      // Toggle current table
      if (isCollapsed) {
        content.classList.remove('collapsed');
        icon.textContent = '▼';
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.add('collapsed');
        icon.textContent = '▶';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
});
// --- End Table Accordion ---

// --- Smart Paste Functionality for Tables ---
document.addEventListener('paste', (e) => {
  const target = e.target;
  
  // Only handle paste events on editable table cells
  if (!target.matches('td[contenteditable="true"]')) return;
  
  e.preventDefault();
  
  const pastedText = e.clipboardData.getData('text');
  
  // Check if the pasted text contains multiple lines (rows from Excel)
  if (pastedText.includes('\n')) {
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    const currentRow = target.parentElement;
    const currentCellIndex = Array.from(currentRow.children).indexOf(target);
    const tbody = currentRow.parentElement;
    const rows = Array.from(tbody.children);
    const currentRowIndex = rows.indexOf(currentRow);
    
    // Check if this is multi-column data (contains tabs)
    const isMultiColumn = pastedText.includes('\t');
    
    if (isMultiColumn) {
      // Multi-column paste - handle like Ctrl+V
      // Ensure table has enough rows for pasted data
      ensureTableCapacity(tbody, currentRowIndex, lines.length);
      
      // Refresh rows array after potentially adding new rows
      const updatedRows = Array.from(tbody.children);
      
      // Calculate the maximum number of columns in the pasted data
      const maxColumns = Math.max(...lines.map(line => line.split('\t').length));
      
      lines.forEach((line, lineIndex) => {
        const cells = line.split('\t');
        const targetRowIndex = currentRowIndex + lineIndex;
        
        if (targetRowIndex < updatedRows.length) {
          const targetRow = updatedRows[targetRowIndex];
          cells.forEach((cellValue, cellIndex) => {
            const targetCellIndex = currentCellIndex + cellIndex;
            if (targetCellIndex < targetRow.children.length) {
              const targetCell = targetRow.children[targetCellIndex];
              targetCell.textContent = cellValue.trim();
            }
          });
        }
      });
      
      // Highlight the pasted cells briefly
      const tableId = target.closest('table').id;
      highlightPastedCells(currentRowIndex, currentCellIndex, lines.length, tableId);
      
      // Update cell titles for truncated text
      updateCellTitles();
      
      // Show notification for multi-column paste
      if (maxColumns > 1) {
        showPasteNotification(`Pasted ${lines.length} rows with ${maxColumns} columns`);
      }
      
    } else {
      // Single column multi-row paste
      // Ensure table has enough rows for pasted data
      ensureTableCapacity(tbody, currentRowIndex, lines.length);
      
      // Refresh rows array after potentially adding new rows
      const updatedRows = Array.from(tbody.children);
      
      // Paste each line into successive rows
      lines.forEach((line, index) => {
        const targetRowIndex = currentRowIndex + index;
        if (targetRowIndex < updatedRows.length) {
          const targetRow = updatedRows[targetRowIndex];
          const targetCell = targetRow.children[currentCellIndex];
          if (targetCell) {
            targetCell.textContent = line.trim();
          }
        }
      });
      
      // Highlight the pasted cells briefly
      const tableId2 = target.closest('table').id;
      highlightPastedCells(currentRowIndex, currentCellIndex, lines.length, tableId2);
      
      // Update cell titles for truncated text
      updateCellTitles();
    }
    
  } else {
    // Single line paste - just paste normally
    target.textContent = pastedText;
    
    // Update cell titles for truncated text
    updateCellTitles();
  }
});

// Function to add more empty rows to the table
function addMoreRows(tableId, count = 10) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  
  // Determine number of columns based on the first row (if it exists) or table header
  const rows = Array.from(tbody.children);
  const firstRow = rows[0];
  let columnCount = 2; // Default to 2 columns
  
  if (firstRow) {
    columnCount = firstRow.children.length;
  } else {
    // If no rows exist, check the table header
    const table = tbody.closest('table');
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
      columnCount = headerRow.children.length;
    }
  }
  
  for (let i = 0; i < count; i++) {
    const newRow = document.createElement('tr');
    const cells = [];
    for (let j = 0; j < columnCount; j++) {
      cells.push('<td contenteditable="true"></td>');
    }
    newRow.innerHTML = cells.join('');
    tbody.appendChild(newRow);
  }
  
  showPasteNotification(`Added ${count} more empty row${count > 1 ? 's' : ''} for manual entry`);
}

// Function to ensure table has enough rows for pasted data
function ensureTableCapacity(tbody, startRowIndex, rowCount) {
  const rows = Array.from(tbody.children);
  const existingRows = rows.length;
  const neededRows = startRowIndex + rowCount;
  const rowsToAdd = Math.max(0, neededRows - existingRows);
  
  if (rowsToAdd > 0) {
    // Determine number of columns based on the first row (if it exists) or table header
    const firstRow = rows[0];
    let columnCount = 2; // Default to 2 columns
    
    if (firstRow) {
      columnCount = firstRow.children.length;
    } else {
      // If no rows exist, check the table header
      const table = tbody.closest('table');
      const headerRow = table.querySelector('thead tr');
      if (headerRow) {
        columnCount = headerRow.children.length;
      }
    }
    
    for (let i = 0; i < rowsToAdd; i++) {
      const newRow = document.createElement('tr');
      const cells = [];
      for (let j = 0; j < columnCount; j++) {
        cells.push('<td contenteditable="true"></td>');
      }
      newRow.innerHTML = cells.join('');
      tbody.appendChild(newRow);
    }
    
    // Show user feedback about added rows
    showPasteNotification(`Added ${rowsToAdd} new row${rowsToAdd > 1 ? 's' : ''} to accommodate pasted data`);
    return true; // Indicates rows were added
  }
  
  return false; // No rows were added
}

// Function to show paste notification
function showPasteNotification(message) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.paste-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'paste-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(90deg, #007aff 0%, #34c759 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  
  // Add animation keyframes
  if (!document.querySelector('#paste-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'paste-notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Function to highlight pasted cells briefly
function highlightPastedCells(startRowIndex, startCellIndex, rowCount, tableId = 'annual-returns-table') {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  
  const rows = Array.from(tbody.children);
  
  // Add highlight class to pasted cells
  for (let i = 0; i < rowCount; i++) {
    const rowIndex = startRowIndex + i;
    if (rowIndex < rows.length) {
      const row = rows[rowIndex];
      const cell = row.children[startCellIndex];
      if (cell) {
        cell.style.backgroundColor = '#007aff20';
        cell.style.transition = 'background-color 0.3s ease';
      }
    }
  }
  
  // Remove highlight after 2 seconds
  setTimeout(() => {
    for (let i = 0; i < rowCount; i++) {
      const rowIndex = startRowIndex + i;
      if (rowIndex < rows.length) {
        const row = rows[rowIndex];
        const cell = row.children[startCellIndex];
        if (cell) {
          cell.style.backgroundColor = '';
        }
      }
    }
  }, 2000);
}
// --- End Smart Paste ---

// --- Excel-like Cell Selection and Editing ---
let selectedCell = null;
let isEditMode = false;
let isSelecting = false;
let startCell = null;
let selectedCells = [];
let isDragOperation = false;

// Handle mouse down - start potential drag selection
document.addEventListener('mousedown', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  if (!cell) return;
  
  // Check if clicking on resize handle
  const rect = cell.getBoundingClientRect();
  const isOnResizeHandle = e.clientX > rect.right - 4;
  
  if (isOnResizeHandle) return; // Let resize handler take over
  
  isSelecting = true;
  startCell = cell;
  isDragOperation = false;
  
  // Small delay to distinguish click from drag
  setTimeout(() => {
    if (isSelecting && startCell === cell) {
      // Still selecting - this is a drag operation
      isDragOperation = true;
      clearAllSelections();
      startCell.classList.add('selected-cell');
      selectedCells = [startCell];
    }
  }, 150);
});

// Handle mouse move - drag selection
document.addEventListener('mousemove', (e) => {
  // Don't handle drag selection if we're resizing
  if (isResizing) return;
  
  if (!isSelecting || !startCell) return;
  
  const cell = e.target.closest('td[contenteditable="true"]');
  if (!cell) return;
  
  const table = cell.closest('.data-table');
  const startTable = startCell.closest('.data-table');
  
  // Only select within same table
  if (table !== startTable) return;
  
  isDragOperation = true;
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.children);
  
  const startRow = startCell.parentElement;
  const currentRow = cell.parentElement;
  
  const startRowIndex = rows.indexOf(startRow);
  const currentRowIndex = rows.indexOf(currentRow);
  const startCellIndex = Array.from(startRow.children).indexOf(startCell);
  const currentCellIndex = Array.from(currentRow.children).indexOf(cell);
  
  // Clear previous selections
  clearAllSelections();
  selectedCells = [];
  
  // Select rectangular range
  const minRowIndex = Math.min(startRowIndex, currentRowIndex);
  const maxRowIndex = Math.max(startRowIndex, currentRowIndex);
  const minCellIndex = Math.min(startCellIndex, currentCellIndex);
  const maxCellIndex = Math.max(startCellIndex, currentCellIndex);
  
  for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
    const row = rows[rowIndex];
    if (row) {
      for (let cellIndex = minCellIndex; cellIndex <= maxCellIndex; cellIndex++) {
        const targetCell = row.children[cellIndex];
        if (targetCell) {
          targetCell.classList.add('selected-cell');
          selectedCells.push(targetCell);
        }
      }
    }
  }
});

// Handle mouse up - end selection
document.addEventListener('mouseup', () => {
  // Don't handle drag selection end if we're resizing
  if (isResizing) return;
  
  isSelecting = false;
  startCell = null;
});

function clearAllSelections() {
  document.querySelectorAll('.selected-cell').forEach(c => {
    c.classList.remove('selected-cell');
    c.classList.remove('editing');
  });
  selectedCell = null;
  selectedCells = [];
  
  // Clear any active text selection
  window.getSelection().removeAllRanges();
  
  // Only blur if the active element is a table cell and not in edit mode
  if (document.activeElement && 
      document.activeElement.matches('td[contenteditable="true"]') && 
      !document.activeElement.classList.contains('editing')) {
    document.activeElement.blur();
  }
}

// Handle single click - Excel behavior
document.addEventListener('click', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  
  // Don't handle clicks if we're resizing
  if (isResizing) return;
  
  // Only clear previous selections if clicking on a table cell
  if (cell && !isDragOperation) {
    clearAllSelections();
  }
  
  // Reset drag flag
  isDragOperation = false;
  
  if (cell && !isDragOperation) {
    const cellText = cell.textContent.trim();
    selectedCell = cell;
    selectedCells = [cell];
    
    if (cellText === '') {
      // Empty cell - go directly to edit mode with overlay
      isEditMode = true;
      showCellEditorOverlay(cell);
    } else {
      // Cell has content - select it (no edit mode, no cursor)
      isEditMode = false;
      cell.classList.add('selected-cell');
      
      // Ensure no cursor or text selection is visible
      window.getSelection().removeAllRanges();
      
      // Prevent focus to avoid cursor appearance
      setTimeout(() => {
        if (cell.classList.contains('selected-cell') && !cell.classList.contains('editing')) {
          cell.blur();
        }
      }, 0);
    }
  }
});

// --- Excel-like Floating Overlay Editor ---
let cellEditorOverlay = null;
let editingCell = null;

function getCellRectAndSpill(cell) {
  // Get the bounding rect for the cell and how far it can spill right
  const row = cell.parentElement;
  const table = cell.closest('.data-table');
  const allRows = Array.from(table.querySelectorAll('tbody tr'));
  const colIndex = Array.from(row.children).indexOf(cell);
  let maxSpillCols = 1;
  
  // Find how many rightward cells are empty in the current row
  for (let i = colIndex + 1; i < row.children.length; i++) {
    const rightCell = row.children[i];
    if (rightCell && rightCell.textContent.trim() === '') {
      maxSpillCols++;
    } else {
      break;
    }
  }
  
  // Calculate the total width for the overlay
  let width = 0;
  for (let i = colIndex; i < colIndex + maxSpillCols && i < row.children.length; i++) {
    if (row.children[i]) {
      width += row.children[i].offsetWidth;
    }
  }
  
  const rect = cell.getBoundingClientRect();
  return { rect, width, maxSpillCols };
}

function showCellEditorOverlay(cell) {
  if (cellEditorOverlay) cellEditorOverlay.remove();
  editingCell = cell;
  
  const { rect, width, maxSpillCols } = getCellRectAndSpill(cell);
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  
  cellEditorOverlay = document.createElement('textarea');
  cellEditorOverlay.className = 'cell-editor-overlay';
  cellEditorOverlay.value = cell.textContent;
  cellEditorOverlay.style.left = `${rect.left + scrollX}px`;
  cellEditorOverlay.style.top = `${rect.top + scrollY}px`;
  cellEditorOverlay.style.width = `${width - 4}px`; // Account for border
  cellEditorOverlay.style.height = `${rect.height - 4}px`; // Account for border
  cellEditorOverlay.style.fontSize = window.getComputedStyle(cell).fontSize;
  cellEditorOverlay.style.fontFamily = window.getComputedStyle(cell).fontFamily;
  cellEditorOverlay.style.color = window.getComputedStyle(cell).color;
  cellEditorOverlay.style.background = window.getComputedStyle(cell).backgroundColor;
  cellEditorOverlay.style.padding = '2px 4px';
  cellEditorOverlay.style.boxSizing = 'border-box';
  
  document.body.appendChild(cellEditorOverlay);
  cellEditorOverlay.focus();
  cellEditorOverlay.setSelectionRange(cellEditorOverlay.value.length, cellEditorOverlay.value.length);

  // Handle input: dynamically resize overlay width as needed
  cellEditorOverlay.addEventListener('input', () => {
    const { width: availableWidth } = getCellRectAndSpill(cell);
    
    // Calculate minimum width needed for the text
    const tempSpan = document.createElement('span');
    tempSpan.style.font = window.getComputedStyle(cellEditorOverlay).font;
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.textContent = cellEditorOverlay.value;
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    
    // Use the larger of available width or text width (with some padding)
    const requiredWidth = Math.max(availableWidth, textWidth + 20);
    cellEditorOverlay.style.width = `${requiredWidth - 4}px`;
  });

  // Handle blur/save
  cellEditorOverlay.addEventListener('blur', () => {
    cell.textContent = cellEditorOverlay.value;
    cellEditorOverlay.remove();
    cellEditorOverlay = null;
    editingCell = null;
    updateCellTitles();
  });

  // Handle Enter (save)
  cellEditorOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      cellEditorOverlay.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cellEditorOverlay.remove();
      cellEditorOverlay = null;
      editingCell = null;
    }
  });
}

// Patch double-click handler to use overlay editor
document.addEventListener('dblclick', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  if (isResizing) return;
  if (cell) {
    clearAllSelections();
    isEditMode = true;
    selectedCell = cell;
    selectedCells = [cell];
    showCellEditorOverlay(cell);
  }
});

// Patch Enter key to use overlay editor
// (when a cell is selected but not in edit mode)
document.addEventListener('keydown', (e) => {
  if (editingCell || isEditMode) return;
  if (e.key === 'Enter' && selectedCell && !isEditMode) {
    e.preventDefault();
    showCellEditorOverlay(selectedCell);
  }
});
// --- End Excel-like Floating Overlay Editor ---

// Arrow key navigation
function navigateCell(direction) {
  if (!selectedCell || isEditMode) return false;
  
  const currentRow = selectedCell.parentElement;
  const tbody = currentRow.parentElement;
  const rows = Array.from(tbody.children);
  const cells = Array.from(currentRow.children);
  
  const rowIndex = rows.indexOf(currentRow);
  const cellIndex = cells.indexOf(selectedCell);
  
  let newCell = null;
  
  switch (direction) {
    case 'up':
      if (rowIndex > 0) newCell = rows[rowIndex - 1].children[cellIndex];
      break;
    case 'down':
      if (rowIndex < rows.length - 1) newCell = rows[rowIndex + 1].children[cellIndex];
      break;
    case 'left':
      if (cellIndex > 0) newCell = cells[cellIndex - 1];
      break;
    case 'right':
      if (cellIndex < cells.length - 1) newCell = cells[cellIndex + 1];
      break;
  }
  
  if (newCell) {
    clearAllSelections();
    newCell.classList.add('selected-cell');
    selectedCell = newCell;
    selectedCells = [newCell];
    return true;
  }
  return false;
}

// Handle key presses for Excel-like behavior
document.addEventListener('keydown', (e) => {
  // Arrow key navigation
  if (!isEditMode && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    const direction = e.key.replace('Arrow', '').toLowerCase();
    navigateCell(direction);
    return;
  }
  
  // Tab navigation
  if (e.key === 'Tab' && !isEditMode) {
    e.preventDefault();
    navigateCell(e.shiftKey ? 'left' : 'right');
    return;
  }
  
  if (e.key === 'Enter') {
    if (isEditMode) {
      // Exit edit mode
      const cell = e.target.closest('td[contenteditable="true"]');
      if (cell) {
        e.preventDefault();
        cell.blur();
        navigateCell('down'); // Move to next row like Excel
      }
    } else if (selectedCell) {
      // Enter edit mode from selection
      e.preventDefault();
      isEditMode = true;
      selectedCell.classList.remove('selected-cell');
      selectedCell.classList.add('editing');
      selectedCell.focus();
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedCells.length > 0 && !isEditMode) {
      // Delete content of selected cells
      e.preventDefault();
      selectedCells.forEach(cell => {
        cell.textContent = '';
      });
      
      // Show brief feedback for multiple cell deletion
      if (selectedCells.length > 1) {
        showPasteNotification(`Cleared ${selectedCells.length} selected cells`);
      }
    }
  } else if (e.key === 'F2') {
    // F2 to edit (Excel standard)
    if (selectedCell && !isEditMode) {
      e.preventDefault();
      isEditMode = true;
      selectedCell.classList.remove('selected-cell');
      selectedCell.classList.add('editing');
      selectedCell.focus();
    }
  } else if (e.key === 'Escape') {
    // Escape to cancel edit or clear selection
    if (isEditMode && selectedCell) {
      e.preventDefault();
      isEditMode = false;
      selectedCell.classList.remove('editing');
      selectedCell.classList.add('selected-cell');
      selectedCell.blur();
    } else if (selectedCells.length > 0) {
      clearAllSelections();
    }
  } else if (e.ctrlKey && e.key === 'a') {
    // Ctrl+A to select all cells in current table
    if (!isEditMode && selectedCell) {
      e.preventDefault();
      const table = selectedCell.closest('.data-table');
      const tbody = table.querySelector('tbody');
      const allCells = tbody.querySelectorAll('td[contenteditable="true"]');
      
      clearAllSelections();
      selectedCells = Array.from(allCells);
      selectedCells.forEach(cell => cell.classList.add('selected-cell'));
    }
  } else if (!isEditMode && selectedCell && selectedCells.length === 1 && e.key.length === 1 && !e.ctrlKey && !e.altKey) {
    // Start typing - replace content and enter edit mode (only for single cell)
    e.preventDefault();
    selectedCell.textContent = e.key;
    isEditMode = true;
    selectedCell.classList.remove('selected-cell');
    selectedCell.classList.add('editing');
    selectedCell.focus();
    
    // Place cursor at end
    const range = document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
    range.selectNodeContents(selectedCell);
    range.collapse(false);
    selection.addRange(range);
  }
});

// Handle blur - exit edit mode
document.addEventListener('blur', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  if (cell && cell.classList.contains('editing')) {
    isEditMode = false;
    cell.classList.remove('editing');
    if (selectedCell === cell) {
      cell.classList.add('selected-cell');
    }
  }
}, true);

// Enhanced Copy/Paste functionality
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'c' && selectedCells.length > 0 && !isEditMode) {
    // Copy selected cells content
    e.preventDefault();
    if (selectedCells.length === 1) {
      navigator.clipboard.writeText(selectedCells[0].textContent);
    } else {
      // For multiple cells, copy as Excel format (tab-separated columns, newline-separated rows)
      const table = selectedCells[0].closest('.data-table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.children);
      
      // Find the rectangular bounds
      let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
      
      selectedCells.forEach(cell => {
        const row = cell.parentElement;
        const rowIndex = rows.indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        
        minRow = Math.min(minRow, rowIndex);
        maxRow = Math.max(maxRow, rowIndex);
        minCol = Math.min(minCol, colIndex);
        maxCol = Math.max(maxCol, colIndex);
      });
      
      // Build tab-separated text
      let copyText = '';
      for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        const row = rows[rowIndex];
        const rowData = [];
        for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
          const cell = row.children[colIndex];
          rowData.push(cell ? cell.textContent : '');
        }
        copyText += rowData.join('\t') + (rowIndex < maxRow ? '\n' : '');
      }
      
      navigator.clipboard.writeText(copyText);
    }
  } else if (e.ctrlKey && e.key === 'v' && selectedCell && !isEditMode) {
    // Paste into selected cell(s)
    e.preventDefault();
    navigator.clipboard.readText().then(text => {
      if (text.includes('\t') || text.includes('\n')) {
        // Multi-cell paste
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const currentRow = selectedCell.parentElement;
        const tbody = currentRow.parentElement;
        const rows = Array.from(tbody.children);
        const currentRowIndex = rows.indexOf(currentRow);
        const currentCellIndex = Array.from(currentRow.children).indexOf(selectedCell);
        
        // Ensure table has enough rows for pasted data
        ensureTableCapacity(tbody, currentRowIndex, lines.length);
        
        // Refresh rows array after potentially adding new rows
        const updatedRows = Array.from(tbody.children);
        
        // Calculate the maximum number of columns in the pasted data
        const maxColumns = Math.max(...lines.map(line => line.split('\t').length));
        
        lines.forEach((line, lineIndex) => {
          const cells = line.split('\t');
          const targetRowIndex = currentRowIndex + lineIndex;
          
          if (targetRowIndex < updatedRows.length) {
            const targetRow = updatedRows[targetRowIndex];
            cells.forEach((cellValue, cellIndex) => {
              const targetCellIndex = currentCellIndex + cellIndex;
              if (targetCellIndex < targetRow.children.length) {
                const targetCell = targetRow.children[targetCellIndex];
                targetCell.textContent = cellValue.trim();
              }
            });
          }
        });
        
        // Highlight the pasted cells briefly
        const tableId3 = selectedCell.closest('table').id;
        highlightPastedCells(currentRowIndex, currentCellIndex, lines.length, tableId3);
        
        // Update cell titles for truncated text
        updateCellTitles();
        
        // Show notification for multi-column paste
        if (maxColumns > 1) {
          showPasteNotification(`Pasted ${lines.length} rows with ${maxColumns} columns`);
        }
        
      } else {
        // Single cell paste
        selectedCell.textContent = text;
      }
    });
  } else if (e.ctrlKey && e.key === 'x' && selectedCells.length > 0 && !isEditMode) {
    // Cut functionality
    e.preventDefault();
    // First copy
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true
    }));
    // Then clear
    selectedCells.forEach(cell => {
      cell.textContent = '';
    });
  }
});
// --- End Excel-like Cell Selection and Editing ---

// --- Column Resizing Functionality ---
let isResizing = false;
let resizingColumn = null;
let startX = 0;
let startWidth = 0;

// Handle mouse down on resize handle
document.addEventListener('mousedown', (e) => {
  const target = e.target;
  const cell = target.closest('th, td');
  
  if (!cell) return;
  
  // Check if clicking on resize handle (right edge of cell)
  const rect = cell.getBoundingClientRect();
  const isOnResizeHandle = e.clientX > rect.right - 4;
  
  if (isOnResizeHandle) {
    e.preventDefault();
    isResizing = true;
    resizingColumn = cell;
    startX = e.clientX;
    startWidth = cell.offsetWidth;
    
    // Add resizing class for visual feedback
    cell.classList.add('resizing');
  }
});

// Handle mouse move during resize
document.addEventListener('mousemove', (e) => {
  if (!isResizing || !resizingColumn) return;
  
  e.preventDefault();
  
  const deltaX = e.clientX - startX;
  const newWidth = Math.max(80, Math.min(400, startWidth + deltaX));
  
  // Only update the width of the selected column
  resizingColumn.style.width = `${newWidth}px`;
});

// Handle mouse up to end resize
document.addEventListener('mouseup', () => {
  if (isResizing && resizingColumn) {
    // Remove resizing class from the column
    resizingColumn.classList.remove('resizing');
    
    // Update cell titles after resize
    updateCellTitles();
    
    isResizing = false;
    resizingColumn = null;
    startX = 0;
    startWidth = 0;
  }
});

// Prevent text selection during resize
document.addEventListener('selectstart', (e) => {
  if (isResizing) {
    e.preventDefault();
  }
});
// --- End Column Resizing ---



// --- Save Company Details (Left Column) ---
async function saveCompanyDetails() {
  const pvNumber = document.getElementById('pvNumber').value.trim();
  const companyName = document.getElementById('companyName').value.trim();
  const previousName = document.getElementById('previousName').value.trim();
  const registeredAddress = document.getElementById('registeredAddress').value.trim();
  const incorporationDate = document.getElementById('incorporationDate').value;
  const notes = document.getElementById('notes').value.trim();

  // Validate required fields
  if (!pvNumber) {
    alert('PV Number is required to save company details.');
    return;
  }

  if (!companyName) {
    alert('Company Name is required to save company details.');
    return;
  }

  try {
    // Check if company already exists
    const { data: existingCompany, error: checkError } = await supabase
      .from('company_details')
      .select('pvNumber')
      .eq('pvNumber', pvNumber)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error('Error checking existing company: ' + checkError.message);
    }

    const companyData = {
      pvNumber,
      companyName,
      previousName,
      registeredAddress,
      incorporationDate,
      notes
    };

    let result;
    if (existingCompany) {
      // Update existing company
      result = await supabase
        .from('company_details')
        .update(companyData)
        .eq('pvNumber', pvNumber);
    } else {
      // Insert new company
      result = await supabase
        .from('company_details')
        .insert(companyData);
    }

    if (result.error) {
      throw new Error('Error saving company details: ' + result.error.message);
    }

    showPasteNotification(existingCompany ? 'Company details updated successfully!' : 'Company details saved successfully!');
    
  } catch (error) {
    alert('Error saving company details: ' + error.message);
  }
}

// Add event listener to the save button for company details
document.querySelector('.edit-fields-form .save-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  // Save company details first
  await saveCompanyDetails();
  
  // Then save all tables
  const pvNumber = document.getElementById('pvNumber').value;
  if (!pvNumber) {
    alert('PV Number is required to save table data.');
    return;
  }

  try {
    // Save all tables in parallel
    await Promise.all([
      saveAnnualReturnsTable(pvNumber),
      saveDirectorsTable(pvNumber),
      saveResolutionsTable(pvNumber),
      saveShareholdersTable(pvNumber),
      saveCompanyActionsTable(pvNumber)
    ]);

    showPasteNotification('All data saved successfully!');
  } catch (error) {
    alert('Error saving table data: ' + error.message);
  }
});


// --- End Save Company Details ---

// --- Save Table Functions ---
// Save Annual Returns Table
async function saveAnnualReturnsTable(pvNumber) {
  const tableRows = Array.from(document.querySelectorAll('#annual-returns-table tbody tr'));
  const tableData = tableRows
    .map(row => {
      const year = row.children[0].textContent.trim();
      const formNo = row.children[1].textContent.trim();
      return { year, formNo };
    })
    .filter(row => row.year); // Only rows with a year

  // Overwrite: delete all existing for this pvNumber, then insert all from table
  const { error: delError } = await supabase
    .from('annual_returns')
    .delete()
    .eq('pvNumber', pvNumber);
  if (delError) {
    throw new Error('Error deleting old annual returns: ' + delError.message);
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('annual_returns')
      .insert(insertRows);
    if (insError) {
      throw new Error('Error saving annual returns: ' + insError.message);
    }
  }
}

// Save Directors Table
async function saveDirectorsTable(pvNumber) {
  const tableRows = Array.from(document.querySelectorAll('#directors-table tbody tr'));
  const tableData = tableRows
    .map(row => {
      const name = row.children[0].textContent.trim();
      const nic = row.children[1].textContent.trim();
      return { name, nic };
    })
    .filter(row => row.name); // Only rows with a name

  // Overwrite: delete all existing for this pvNumber, then insert all from table
  const { error: delError } = await supabase
    .from('directors')
    .delete()
    .eq('pvNumber', pvNumber);
  if (delError) {
    throw new Error('Error deleting old directors: ' + delError.message);
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('directors')
      .insert(insertRows);
    if (insError) {
      throw new Error('Error saving directors: ' + insError.message);
    }
  }
}

// Save Resolutions Table
async function saveResolutionsTable(pvNumber) {
  const tableRows = Array.from(document.querySelectorAll('#resolutions-table tbody tr'));
  const tableData = tableRows
    .map(row => {
      const date = row.children[0].textContent.trim();
      const no = row.children[1].textContent.trim();
      const details = row.children[2].textContent.trim();
      return { date, no, details };
    })
    .filter(row => row.date || row.no || row.details); // Only rows with some data

  // Overwrite: delete all existing for this pvNumber, then insert all from table
  const { error: delError } = await supabase
    .from('resolutions')
    .delete()
    .eq('pvNumber', pvNumber);
  if (delError) {
    throw new Error('Error deleting old resolutions: ' + delError.message);
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('resolutions')
      .insert(insertRows);
    if (insError) {
      throw new Error('Error saving resolutions: ' + insError.message);
    }
  }
}

// Save Shareholders Table
async function saveShareholdersTable(pvNumber) {
  const tableRows = Array.from(document.querySelectorAll('#shareholders-table tbody tr'));
  const tableData = tableRows
    .map(row => {
      const name = row.children[0].textContent.trim();
      const nic = row.children[1].textContent.trim();
      return { name, nic };
    })
    .filter(row => row.name); // Only rows with a name

  // Overwrite: delete all existing for this pvNumber, then insert all from table
  const { error: delError } = await supabase
    .from('shareholders')
    .delete()
    .eq('pvNumber', pvNumber);
  if (delError) {
    throw new Error('Error deleting old shareholders: ' + delError.message);
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('shareholders')
      .insert(insertRows);
    if (insError) {
      throw new Error('Error saving shareholders: ' + insError.message);
    }
  }
}

// Save Company Actions Table
async function saveCompanyActionsTable(pvNumber) {
  const tableRows = Array.from(document.querySelectorAll('#company-actions-table tbody tr'));
  const tableData = tableRows
    .map(row => {
      const date = row.children[0].textContent.trim();
      const action = row.children[1].textContent.trim();
      const details = row.children[2].textContent.trim();
      return { date, action, details };
    })
    .filter(row => row.date || row.action || row.details); // Only rows with some data

  // Overwrite: delete all existing for this pvNumber, then insert all from table
  const { error: delError } = await supabase
    .from('company_actions')
    .delete()
    .eq('pvNumber', pvNumber);
  if (delError) {
    throw new Error('Error deleting old company actions: ' + delError.message);
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('company_actions')
      .insert(insertRows);
    if (insError) {
      throw new Error('Error saving company actions: ' + insError.message);
    }
  }
}
// --- End Save Table Functions ---

// Function to reset column widths to default
function resetColumnWidths(tableId) {
  const table = document.querySelector(`#${tableId}`);
  if (!table) return;
  
  const cells = table.querySelectorAll('th, td');
  cells.forEach(cell => {
    cell.style.width = '';
    cell.style.minWidth = '';
    cell.style.maxWidth = '';
  });
  
  updateCellTitles();
}

// Function to update cell titles for truncated text
function updateCellTitles() {
  const cells = document.querySelectorAll('td[contenteditable="true"]');
  cells.forEach(cell => {
    const text = cell.textContent;
    const isTruncated = cell.scrollWidth > cell.clientWidth;
    
    if (isTruncated && text.trim()) {
      cell.setAttribute('title', text);
    } else {
      cell.removeAttribute('title');
    }
  });
}

// Function to populate Directors table
async function populateDirectorsTable(pvNumber) {
  try {
    const { data, error } = await supabase
      .from('directors')
      .select('name, nic')
      .eq('pvNumber', pvNumber)
      .order('name');
    
    if (error) {
      console.error('Error fetching directors:', error);
      return;
    }

    const tableBody = document.querySelector('#directors-table tbody');
    
    // Clear existing data
    tableBody.innerHTML = '';
    
    // Add fetched data
    if (data && data.length > 0) {
      // Use dynamic row addition for database imports
      const rowsToCreate = Math.max(data.length, 20); // Minimum 20 rows, or more if data exceeds
      
      // Create all needed rows first
      for (let i = 0; i < rowsToCreate; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
      
      // Populate with actual data
      data.forEach((item, index) => {
        const row = tableBody.children[index];
        if (row) {
          row.children[0].textContent = item.name || '';
          row.children[1].textContent = item.nic || '';
        }
      });
      
      // Show notification if more than 20 rows were created
      if (data.length > 20) {
        showPasteNotification(`Imported ${data.length} directors from database (expanded table to accommodate data)`);
      }
      
      // Update cell titles for truncated text
      updateCellTitles();
      
    } else {
      // No data found - create minimum 20 empty rows
      for (let i = 0; i < 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    }
  } catch (err) {
    console.error('Error populating directors table:', err);
  }
}

// Function to populate Resolutions table
async function populateResolutionsTable(pvNumber) {
  try {
    const { data, error } = await supabase
      .from('resolutions')
      .select('date, no, details')
      .eq('pvNumber', pvNumber)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching resolutions:', error);
      return;
    }

    const tableBody = document.querySelector('#resolutions-table tbody');
    
    // Clear existing data
    tableBody.innerHTML = '';
    
    // Add fetched data
    if (data && data.length > 0) {
      // Use dynamic row addition for database imports
      const rowsToCreate = Math.max(data.length, 20); // Minimum 20 rows, or more if data exceeds
      
      // Create all needed rows first
      for (let i = 0; i < rowsToCreate; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
      
      // Populate with actual data
      data.forEach((item, index) => {
        const row = tableBody.children[index];
        if (row) {
          row.children[0].textContent = item.date || '';
          row.children[1].textContent = item.no || '';
          row.children[2].textContent = item.details || '';
        }
      });
      
      // Show notification if more than 20 rows were created
      if (data.length > 20) {
        showPasteNotification(`Imported ${data.length} resolutions from database (expanded table to accommodate data)`);
      }
      
      // Update cell titles for truncated text
      updateCellTitles();
      
    } else {
      // No data found - create minimum 20 empty rows
      for (let i = 0; i < 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    }
  } catch (err) {
    console.error('Error populating resolutions table:', err);
  }
}

// Function to populate Shareholders table
async function populateShareholdersTable(pvNumber) {
  try {
    const { data, error } = await supabase
      .from('shareholders')
      .select('name, nic')
      .eq('pvNumber', pvNumber)
      .order('name');
    
    if (error) {
      console.error('Error fetching shareholders:', error);
      return;
    }

    const tableBody = document.querySelector('#shareholders-table tbody');
    
    // Clear existing data
    tableBody.innerHTML = '';
    
    // Add fetched data
    if (data && data.length > 0) {
      // Use dynamic row addition for database imports
      const rowsToCreate = Math.max(data.length, 20); // Minimum 20 rows, or more if data exceeds
      
      // Create all needed rows first
      for (let i = 0; i < rowsToCreate; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
      
      // Populate with actual data
      data.forEach((item, index) => {
        const row = tableBody.children[index];
        if (row) {
          row.children[0].textContent = item.name || '';
          row.children[1].textContent = item.nic || '';
        }
      });
      
      // Show notification if more than 20 rows were created
      if (data.length > 20) {
        showPasteNotification(`Imported ${data.length} shareholders from database (expanded table to accommodate data)`);
      }
      
      // Update cell titles for truncated text
      updateCellTitles();
      
    } else {
      // No data found - create minimum 20 empty rows
      for (let i = 0; i < 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    }
  } catch (err) {
    console.error('Error populating shareholders table:', err);
  }
}

// Function to populate Company Actions table
async function populateCompanyActionsTable(pvNumber) {
  try {
    const { data, error } = await supabase
      .from('company_actions')
      .select('date, action, details')
      .eq('pvNumber', pvNumber)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching company actions:', error);
      return;
    }

    const tableBody = document.querySelector('#company-actions-table tbody');
    
    // Clear existing data
    tableBody.innerHTML = '';
    
    // Add fetched data
    if (data && data.length > 0) {
      // Use dynamic row addition for database imports
      const rowsToCreate = Math.max(data.length, 20); // Minimum 20 rows, or more if data exceeds
      
      // Create all needed rows first
      for (let i = 0; i < rowsToCreate; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
      
      // Populate with actual data
      data.forEach((item, index) => {
        const row = tableBody.children[index];
        if (row) {
          row.children[0].textContent = item.date || '';
          row.children[1].textContent = item.action || '';
          row.children[2].textContent = item.details || '';
        }
      });
      
      // Show notification if more than 20 rows were created
      if (data.length > 20) {
        showPasteNotification(`Imported ${data.length} company actions from database (expanded table to accommodate data)`);
      }
      
      // Update cell titles for truncated text
      updateCellTitles();
      
    } else {
      // No data found - create minimum 20 empty rows
      for (let i = 0; i < 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    }
  } catch (err) {
    console.error('Error populating company actions table:', err);
  }
}
