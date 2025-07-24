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
