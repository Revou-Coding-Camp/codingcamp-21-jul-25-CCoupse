document.getElementById('todo-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const todoInput = document.getElementById('todo-input').value.trim();
    const dateInput = document.getElementById('date-input').value;
    const status = document.getElementById('status-select').value;

    if (todoInput === '' || dateInput === '' || status === '') {
        showMessage('Please fill in all fields.');
        return;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="checkbox" class="task-checkbox"></td>
        <td class="task-text">${todoInput}</td>
        <td class="date">${new Date(dateInput).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
        <td class="status-display">${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</td>
        <td class="actions">
            <button class="complete" title="Complete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
            </button>
            <button class="edit" title="Edit Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.007 13.793 4.593 4.854 13.532 2.268 10.946 11.207 2.007z"/>
                </svg>
            </button>
            <button class="delete" title="Delete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4.059 3.06A2 2 0 0 1 5.042 2H11a2 2 0 0 1 1.947 1.5l-.059.94H4.118z"/>
                </svg>
            </button>
        </td>
    `;
    document.getElementById('todo-list').querySelector('tbody').appendChild(tr);
    this.reset();
    updateAllMetrics();
    showMessage('Task added successfully!');
});

document.getElementById('filter-status-select').addEventListener('change', applyFilterAndSort);
document.getElementById('sort-select').addEventListener('change', applyFilterAndSort);
document.getElementById('reset-filter-sort').addEventListener('click', function() {
    document.getElementById('filter-status-select').value = ''; 
    document.getElementById('sort-select').value = ''; 
    applyFilterAndSort();
});

document.getElementById('todo-list').querySelector('tbody').addEventListener('click', function(e) {
    if (e.target.closest('.complete')) {
        completeTask(e.target.closest('.complete'));
    } else if (e.target.closest('.edit')) {
        editTask(e.target.closest('.edit'));
    } else if (e.target.closest('.delete')) {
        deleteTask(e.target.closest('.delete'));
        showMessage('Task deleted successfully!');
    } else if (e.target.classList.contains('task-checkbox')) {
        updateDeleteAllButtonState();
    }
});

document.getElementById('select-all-tasks').addEventListener('change', function(e) {
    const isChecked = e.target.checked;
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    updateDeleteAllButtonState();
});

document.getElementById('delete-selected-tasks').addEventListener('click', deleteSelectedTasks);

document.getElementById('search-button').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keyup', performSearch); 

function updateAllMetrics() {
    updatePlaceholder();
    updateProgress();
    updateDashboard(); 
    applyFilterAndSort();
    toggleFilterAndSortButtons();
    performSearch(); 
    updateDeleteAllButtonState();
    toggleSelectAllCheckbox();
}

function updatePlaceholder() {
    const noTasks = document.getElementById('no-tasks');
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    const visibleTasks = Array.from(tbody.querySelectorAll('tr:not(#no-tasks):not([style*="display: none"])'));
    noTasks.style.display = visibleTasks.length > 0 ? 'none' : 'table-row';
}

function updateProgress() {
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    const tasks = Array.from(tbody.querySelectorAll('tr:not(.placeholder)'));
    const completed = tasks.filter(tr => tr.querySelector('.status-display').textContent.toLowerCase() === 'completed').length;
    const inProgress = tasks.filter(tr => tr.querySelector('.status-display').textContent.toLowerCase() === 'in progress').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? ((completed * 1) + (inProgress * 0.5)) / totalTasks * 100 : 0;
    document.getElementById('progress').style.width = `${Math.round(progress)}%`;
    document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
}

function updateDashboard() {
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    const tasks = Array.from(tbody.querySelectorAll('tr:not(.placeholder)'));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(tr => tr.querySelector('.status-display').textContent.toLowerCase() === 'completed').length;
    const inProgressTasks = tasks.filter(tr => tr.querySelector('.status-display').textContent.toLowerCase() === 'in progress').length;

    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('in-progress-tasks').textContent = inProgressTasks;
}

function completeTask(button) {
    const tr = button.closest('tr');
    tr.querySelector('.status-display').textContent = 'Completed';
    updateAllMetrics();
    showMessage('Task marked as completed!');
}

function editTask(button) {
    const tr = button.closest('tr');
    tr.classList.add('editing');
    const taskTd = tr.querySelector('.task-text');
    const dateTd = tr.querySelector('.date');
    const statusTd = tr.querySelector('.status-display');
    const actionsTd = tr.querySelector('.actions');
    const checkboxTd = tr.querySelector('td:first-child'); 

    const originalTask = taskTd.textContent;
    const originalDateParts = dateTd.textContent.split('/');
    const originalDate = `20${originalDateParts[2]}-${originalDateParts[1]}-${originalDateParts[0]}`;
    const originalStatus = statusTd.textContent.toLowerCase().replace(' ', '-');

    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.value = originalTask;
    taskInput.className = 'task-input';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = originalDate;
    dateInput.className = 'date-input';

    const statusSelect = document.createElement('select');
    statusSelect.className = 'status-select';
    statusSelect.innerHTML = `
        <option value="not-started" ${originalStatus === 'not-started' ? 'selected' : ''}>Not Started</option>
        <option value="in-progress" ${originalStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${originalStatus === 'completed' ? 'selected' : ''}>Completed</option>
    `;

    taskTd.innerHTML = '';
    taskTd.appendChild(taskInput);
    dateTd.innerHTML = '';
    dateTd.appendChild(dateInput);
    statusTd.innerHTML = '';
    statusTd.appendChild(statusSelect);

    actionsTd.innerHTML = '';
    checkboxTd.innerHTML = '';

    const saveButton = document.createElement('button');
    saveButton.className = 'save';
    saveButton.title = 'Save Task';
    saveButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
            <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.854-2.853a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a.5.5 0 0 1 .5-.5H14a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z"/>
        </svg>
    `;

    saveButton.onclick = function() {
        taskTd.textContent = taskInput.value;
        dateTd.textContent = new Date(dateInput.value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
        statusTd.textContent = statusSelect.value.charAt(0).toUpperCase() + statusSelect.value.slice(1).replace('-', ' ');

        actionsTd.innerHTML = `
            <button class="complete" title="Complete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
            </button>
            <button class="edit" title="Edit Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.007 13.793 4.593 4.854 13.532 2.268 10.946 11.207 2.007z"/>
                </svg>
            </button>
            <button class="delete" title="Delete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4.059 3.06A2 2 0 0 1 5.042 2H11a2 2 0 0 1 1.947 1.5l-.059.94H4.118z"/>
                </svg>
            </button>
        `;
        checkboxTd.innerHTML = `<input type="checkbox" class="task-checkbox">`; 
        tr.classList.remove('editing');
        updateAllMetrics();
        showMessage('Task updated successfully!');
    };

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.title = 'Delete Task';
    deleteButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4.059 3.06A2 2 0 0 1 5.042 2H11a2 2 0 0 1 1.947 1.5l-.059.94H4.118z"/>
        </svg>
    `;
    actionsTd.appendChild(saveButton);
    actionsTd.appendChild(deleteButton);

    taskInput.focus();
}

function deleteTask(button) {
    button.closest('tr').remove();
    updateAllMetrics();
}

function deleteSelectedTasks() {
    const selectedCheckboxes = document.querySelectorAll('.task-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showMessage('No tasks selected for deletion.');
        return;
    }
    selectedCheckboxes.forEach(checkbox => {
        checkbox.closest('tr').remove();
    });
    document.getElementById('select-all-tasks').checked = false; 
    updateAllMetrics();
    showMessage('Selected tasks deleted.');
}

function updateDeleteAllButtonState() {
    const selectedCheckboxes = document.querySelectorAll('.task-checkbox:checked');
    document.getElementById('delete-selected-tasks').disabled = selectedCheckboxes.length === 0;
}

function applyFilterAndSort() {
    const filterStatusValue = document.getElementById('filter-status-select').value;
    const sortValue = document.getElementById('sort-select').value;
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    let allTaskRows = Array.from(tbody.querySelectorAll('tr:not(#no-tasks)'));

    allTaskRows.forEach(taskRow => {
        const taskStatus = taskRow.querySelector('.status-display').textContent.toLowerCase().replace(' ', '-');
        if (filterStatusValue === '' || filterStatusValue === 'all' || taskStatus === filterStatusValue) {
            taskRow.style.display = 'table-row';
        } else {
            taskRow.style.display = 'none';
        }
    });

    let visibleTasks = Array.from(tbody.querySelectorAll('tr:not(#no-tasks):not([style*="display: none"])'));

    if (sortValue !== '') { 
        visibleTasks.sort((a, b) => {
            const datePartsA = a.querySelector('.date').textContent.split('/');
            const fullYearA = `20${datePartsA[2]}`;
            const dateA = new Date(`${fullYearA}-${datePartsA[1]}-${datePartsA[0]}`);

            const datePartsB = b.querySelector('.date').textContent.split('/');
            const fullYearB = `20${datePartsB[2]}`;
            const dateB = new Date(`${fullYearB}-${datePartsB[1]}-${datePartsB[0]}`);

            if (sortValue === 'sort-date-asc') {
                return dateA - dateB;
            } else if (sortValue === 'sort-date-desc') {
                return dateB - dateA;
            }
            return 0; 
        });

        visibleTasks.forEach(task => tbody.appendChild(task));
    }

    updatePlaceholder();
}

function toggleFilterAndSortButtons() {
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    const tasksExist = Array.from(tbody.querySelectorAll('tr:not(#no-tasks)')).length > 0;

    document.getElementById('filter-status-select').disabled = !tasksExist;
    document.getElementById('sort-select').disabled = !tasksExist;
    document.getElementById('reset-filter-sort').disabled = !tasksExist;
    document.getElementById('select-all-tasks').disabled = !tasksExist;
}

function toggleSelectAllCheckbox() {
    const tbody = document.getElementById('todo-list').querySelector('tbody');
    const tasksExist = Array.from(tbody.querySelectorAll('tr:not(#no-tasks)')).length > 0;
    document.getElementById('select-all-tasks').disabled = !tasksExist;
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const allTaskRows = Array.from(document.getElementById('todo-list').querySelector('tbody').querySelectorAll('tr:not(#no-tasks)'));
    const searchResultsTbody = document.getElementById('search-results-tbody');
    const noSearchResultsRow = document.getElementById('no-search-results');

    Array.from(searchResultsTbody.querySelectorAll('tr:not(#no-search-results)')).forEach(row => row.remove());

    if (searchTerm === '') {
        noSearchResultsRow.style.display = 'table-row'; 
        return;
    }

    let foundResults = false;
    allTaskRows.forEach(taskRow => {
        const taskText = taskRow.querySelector('.task-text').textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            foundResults = true;
            const clonedRow = taskRow.cloneNode(true);
            const actionsTd = clonedRow.querySelector('.actions');
            if (actionsTd) {
                actionsTd.remove();
            }
            const checkboxTd = clonedRow.querySelector('td:first-child');
            if (checkboxTd) {
                checkboxTd.remove(); 
            }
            searchResultsTbody.appendChild(clonedRow);
        }
    });

    if (!foundResults) {
        noSearchResultsRow.style.display = 'table-row'; 
    } else {
        noSearchResultsRow.style.display = 'none'; 
    }
}

function showMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #0B1957;
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
        font-size: 16px;
        animation: fadeIn 0.3s ease-out;
    `;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.style.animation = 'fadeOut 0.3s ease-in forwards';
        messageBox.addEventListener('animationend', () => messageBox.remove());
    }, 2000);

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -60%); }
        }
    `;
    document.head.appendChild(style);
}

document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        this.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        this.textContent = '🌙 Dark Mode';
    }
});

window.addEventListener('DOMContentLoaded', function() {
    const darkMode = localStorage.getItem('darkMode');
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if(darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if(toggleBtn) toggleBtn.textContent = '☀️ Light Mode';
    }
});

updateAllMetrics();