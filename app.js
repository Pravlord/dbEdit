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
      data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true">${item.year || ''}</td>
          <td contenteditable="true">${item.formNo || ''}</td>
        `;
        tableBody.appendChild(row);
      });
      
      // Add empty rows to fill the table (up to 20 rows total)
      const currentRows = data.length;
      const totalRows = 20;
      for (let i = currentRows; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="true"></td>
          <td contenteditable="true"></td>
        `;
        tableBody.appendChild(row);
      }
    } else {
      // No data found - create empty rows
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
    
    // Populate Annual Returns table using the pvNumber
    if (data.pvNumber) {
      await populateAnnualReturnsTable(data.pvNumber);
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
    
    // Paste each line into successive rows
    lines.forEach((line, index) => {
      const targetRowIndex = currentRowIndex + index;
      if (targetRowIndex < rows.length) {
        const targetRow = rows[targetRowIndex];
        const targetCell = targetRow.children[currentCellIndex];
        if (targetCell) {
          targetCell.textContent = line.trim();
        }
      }
    });
  } else {
    // Single line paste - just paste normally
    target.textContent = pastedText;
  }
});
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
}

// Handle single click - Excel behavior
document.addEventListener('click', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  
  // Always clear previous selections on single click
  if (!isDragOperation) {
    clearAllSelections();
  }
  
  // Reset drag flag
  isDragOperation = false;
  
  if (cell && !isDragOperation) {
    const cellText = cell.textContent.trim();
    selectedCell = cell;
    selectedCells = [cell];
    
    if (cellText === '') {
      // Empty cell - go directly to edit mode
      isEditMode = true;
      cell.classList.add('editing');
      cell.focus();
      
      // Place cursor at beginning
      const range = document.createRange();
      const selection = window.getSelection();
      selection.removeAllRanges();
      range.setStart(cell, 0);
      range.collapse(true);
      selection.addRange(range);
    } else {
      // Cell has content - select it
      isEditMode = false;
      cell.classList.add('selected-cell');
      
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(cell);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Remove focus to show selection highlight
      cell.blur();
    }
  }
});

// Handle double click - always enter edit mode
document.addEventListener('dblclick', (e) => {
  const cell = e.target.closest('td[contenteditable="true"]');
  
  if (cell) {
    clearAllSelections();
    isEditMode = true;
    selectedCell = cell;
    selectedCells = [cell];
    cell.classList.add('editing');
    cell.focus();
    
    // Place cursor at click position
    const range = document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
    range.selectNodeContents(cell);
    range.collapse(false);
    selection.addRange(range);
  }
});

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
        const lines = text.split('\n');
        const currentRow = selectedCell.parentElement;
        const tbody = currentRow.parentElement;
        const rows = Array.from(tbody.children);
        const currentRowIndex = rows.indexOf(currentRow);
        const currentCellIndex = Array.from(currentRow.children).indexOf(selectedCell);
        
        lines.forEach((line, lineIndex) => {
          const cells = line.split('\t');
          const targetRowIndex = currentRowIndex + lineIndex;
          
          if (targetRowIndex < rows.length) {
            const targetRow = rows[targetRowIndex];
            cells.forEach((cellValue, cellIndex) => {
              const targetCellIndex = currentCellIndex + cellIndex;
              if (targetCellIndex < targetRow.children.length) {
                const targetCell = targetRow.children[targetCellIndex];
                targetCell.textContent = cellValue;
              }
            });
          }
        });
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

// --- Save Annual Returns Table ---
document.querySelector('.edit-fields-form .save-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  const pvNumber = document.getElementById('pvNumber').value;
  if (!pvNumber) {
    alert('PV Number is required to save annual returns.');
    return;
  }

  // Gather table data
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
    alert('Error deleting old annual returns: ' + delError.message);
    return;
  }

  // Insert all table rows
  if (tableData.length > 0) {
    const insertRows = tableData.map(row => ({ ...row, pvNumber }));
    const { error: insError } = await supabase
      .from('annual_returns')
      .insert(insertRows);
    if (insError) {
      alert('Error saving annual returns: ' + insError.message);
      return;
    }
  }

  alert('Annual Returns saved successfully!');
  // Optionally, refresh the table
  await populateAnnualReturnsTable(pvNumber);
});
// --- End Save Annual Returns Table ---
