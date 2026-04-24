// DOM Elements
const memoForm = document.getElementById('memo-form');
const memoTitleInput = document.getElementById('memo-title');
const memoContentInput = document.getElementById('memo-content');
const memoGrid = document.getElementById('memo-grid');
const searchInput = document.getElementById('search-input');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editTitleInput = document.getElementById('edit-title');
const editContentInput = document.getElementById('edit-content');
const closeModalBtn = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit');

// State
let memos = JSON.parse(localStorage.getItem('modern_memos')) || [];

// Initialize
function init() {
    renderMemos();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    memoForm.addEventListener('submit', handleAddMemo);
    searchInput.addEventListener('input', handleSearch);
    
    // Modal events
    editForm.addEventListener('submit', handleUpdateMemo);
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });
}

// Handle adding a new memo
function handleAddMemo(e) {
    e.preventDefault();
    
    const title = memoTitleInput.value.trim();
    const content = memoContentInput.value.trim();
    
    if (!title || !content) return;
    
    const newMemo = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    memos.unshift(newMemo);
    saveMemos();
    renderMemos();
    
    // Reset form
    memoForm.reset();
    memoTitleInput.focus();
}

// Handle deleting a memo
function deleteMemo(id) {
    if (confirm('Are you sure you want to delete this memo?')) {
        memos = memos.filter(memo => memo.id !== id);
        saveMemos();
        renderMemos();
    }
}

// Open edit modal
function openEditModal(id) {
    const memo = memos.find(m => m.id === id);
    if (!memo) return;
    
    editIdInput.value = memo.id;
    editTitleInput.value = memo.title;
    editContentInput.value = memo.content;
    
    editModal.classList.remove('hidden');
    editTitleInput.focus();
}

// Close edit modal
function closeModal() {
    editModal.classList.add('hidden');
    editForm.reset();
}

// Handle updating a memo
function handleUpdateMemo(e) {
    e.preventDefault();
    
    const id = editIdInput.value;
    const title = editTitleInput.value.trim();
    const content = editContentInput.value.trim();
    
    if (!title || !content) return;
    
    memos = memos.map(memo => {
        if (memo.id === id) {
            return {
                ...memo,
                title,
                content,
                updatedAt: new Date().toISOString()
            };
        }
        return memo;
    });
    
    saveMemos();
    renderMemos();
    closeModal();
}

// Handle search filtering
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    renderMemos(searchTerm);
}

// Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ko-KR', options);
}

// Save to Local Storage
function saveMemos() {
    localStorage.setItem('modern_memos', JSON.stringify(memos));
}

// Render memos to DOM
function renderMemos(searchTerm = '') {
    memoGrid.innerHTML = '';
    
    const filteredMemos = memos.filter(memo => 
        memo.title.toLowerCase().includes(searchTerm) || 
        memo.content.toLowerCase().includes(searchTerm)
    );
    
    if (filteredMemos.length === 0) {
        memoGrid.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-note-blank"></i>
                <h3>No memos found</h3>
                <p>${searchTerm ? 'Try a different search term.' : 'Create your first memo above!'}</p>
            </div>
        `;
        return;
    }
    
    filteredMemos.forEach((memo, index) => {
        const isEdited = memo.createdAt !== memo.updatedAt;
        const dateToShow = isEdited ? `Edited: ${formatDate(memo.updatedAt)}` : formatDate(memo.createdAt);
        
        const card = document.createElement('article');
        card.className = 'memo-card';
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="memo-header">
                <h3>${escapeHTML(memo.title)}</h3>
                <div class="memo-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal('${memo.id}')" aria-label="Edit">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMemo('${memo.id}')" aria-label="Delete">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
            <div class="memo-body">
                <p>${escapeHTML(memo.content)}</p>
            </div>
            <div class="memo-footer">
                <span class="date">${dateToShow}</span>
            </div>
        `;
        
        memoGrid.appendChild(card);
    });
}

// Basic HTML escape to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Start app
init();
