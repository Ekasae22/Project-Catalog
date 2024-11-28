const dummyItem = [
    { no: 1, name: "SARUNG TANGAN KATUN 5 BENANG", itemnumber: "B029-240500", alamatrak: "D206010101", status: "STOCK" },
    { no: 2, name: "SARUNG TANGAN KATUN 6 BENANG", itemnumber: "B029-240504", alamatrak: "D206010102", status: "NONSTOCK" },
    { no: 3, name: "SARUNG TANGAN KULIT MERAH", itemnumber: "B029-240503", alamatrak: "D206010103", status: "STOCK" },
    { no: 4, name: "SARUNG TANGAN KARET HIJAU", itemnumber: "B029-240502", alamatrak: "D206010104", status: "NONSTOCK" },
    { no: 5, name: "MASKER 3M", itemnumber: "B029-240501", alamatrak: "D206010105", status: "STOCK" }
];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = './index.html';
        return;
    }

    // Set user email in navbar
    const userEmail = localStorage.getItem('emailLogin');
    document.getElementById('userEmail').textContent = formatEmail(userEmail);

     // Initialize employees data
     if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(dummyItem));
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const items = [...new Set(user.map(emp => emp.itemnumber))];

    // Update statistics
    document.getElementById('totalUser').textContent = user.length;
    document.getElementById('totalItem').textContent = items.length;

    // Function to render table rows
    function renderUser(userData) {
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = userData.map(emp => `
            <tr>
                <td>${emp.no}</td>
                <td>${emp.name}</td>
                <td>${emp.itemnumber}</span></td>
                <td>${emp.alamatrak}</td>
                <td><span class="badge bg-success status-badge">${emp.status}</span></td>
                <td><button class="btn btn-sm btn-outline-primary me-1">SHOW IMAGE</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success me-1" data-id="${emp.no}" onclick="editItem(${emp.no})">Edit Item</button>
                    <button class="btn btn-sm btn-outline-danger" data-id="${emp.no}" onclick="deleteItem(${emp.no})">X</button>
                </td>
            </tr>
        `).join('');
    }

    // Initial render
    renderUser(user);

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItem = user.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm) || 
            emp.itemnumber.toLowerCase().includes(searchTerm) ||
            emp.alamatrak.toLowerCase().includes(searchTerm)
        );
        renderUser(filteredItem);
    });

    // Handle logout
    document.getElementById('logoutButton').addEventListener('click', function() {
        localStorage.removeItem('emailLogin');
        sessionStorage.removeItem('isLoggedIn');
        // localStorage.clear();
        window.location.href = './index.html';
    });

    // Function to show alert
    function showAlert(message, type = 'success') {
        const alert = document.getElementById(`${type}Alert`);
        alert.style.display = 'block';
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.style.display = 'none';
            alert.classList.remove('show');
        }, 3000);
    }

    // Function to validate form
    function validateForm(form) {
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return false;
        }
        return true;
    }

    // Function to add new employee
    function addItem() {
        const form = document.getElementById('addItemForm');
        
        if (!validateForm(form)) {
            return;
        }

        const user = JSON.parse(localStorage.getItem('user')) || [];
        
        const newItem = {
            no: user.length + 1,
            name: document.getElementById('itemName').value,
            itemnumber: document.getElementById('itemNumber').value,
            alamatrak: document.getElementById('alamatRak').value,
            status: document.getElementById('itemStatus').value
        };

        user.push(newItem);
        localStorage.setItem('user', JSON.stringify(user));

        // Update statistics
        document.getElementById('totalUser').textContent = user.length;
        const items = [...new Set(user.map(emp => emp.itemnumber))];
        document.getElementById('totalItem').textContent = items.length;

        // Re-render table
        renderUser(user);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();

        // Reset form
        form.reset();
        form.classList.remove('was-validated');

        // Show success message
        showAlert('Item added successfully!');
    }

    // Add event listener for save button
    document.getElementById('saveUser').addEventListener('click', addItem);

    // Reset form when modal is closed
    document.getElementById('addItemModal').addEventListener('hidden.bs.modal', function() {
        const form = document.getElementById('addItemForm');
        form.reset();
        form.classList.remove('was-validated');
    });

    // Edit employee function
    editItem = function(no) {
        const user = JSON.parse(localStorage.getItem('user'));
        const users = user.find(emp => emp.no === no);
        
        if (users) {
            document.getElementById('editItemId').value = users.no;
            document.getElementById('editItemName').value = users.name;
            document.getElementById('editItemNumber').value = users.itemnumber;
            document.getElementById('editAlamatRak').value = users.alamatrak;
            document.getElementById('editItemStatus').value = users.status;
            
            const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
            editModal.show();
        }
    }

    // Update employee function
    function updateItem() {
        const form = document.getElementById('editItemForm');
        
        if (!validateForm(form)) {
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const no = parseInt(document.getElementById('editItemId').value);
        const index = user.findIndex(emp => emp.no === no);
        
        if (index !== -1) {
            user[index] = {
                no: no,
                name: document.getElementById('editItemName').value,
                itemnumber: document.getElementById('editItemNumber').value,
                alamatrak: document.getElementById('editAlamatRak').value,
                status: document.getElementById('editItemStatus').value
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update statistics
            const items = [...new Set(user.map(emp => emp.itemnumber))];
            document.getElementById('totalItem').textContent = items.length;
            
            // Re-render table
            renderUser(user);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editItemModal'));
            modal.hide();
            
            // Show success message
            showAlert('Item updated successfully!', 'editSuccess');
        }
    }

    // Delete employee function
    deleteItem = function(no) {
        document.getElementById('deleteItemId').value = no;
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteItemModal'));
        deleteModal.show();
    }

    // Confirm delete function
    function confirmDeleteItem() {
        const no = parseInt(document.getElementById('deleteItemId').value);
        let user = JSON.parse(localStorage.getItem('user'));
        
        user = user.filter(emp => emp.no !== no);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update statistics
        document.getElementById('totalUser').textContent = user.length;
        const items = [...new Set(user.map(emp => emp.itemnumber))];
        document.getElementById('totalItem').textContent = items.length;
        
        // Re-render table
        renderUser(user);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteItemModal'));
        modal.hide();
        
        // Show success message
        showAlert('Item deleted successfully!', 'deleteSuccess');
    }

    document.getElementById('updateItem').addEventListener('click', updateItem);
    document.getElementById('confirmDeleteItem').addEventListener('click', confirmDeleteItem);

    // Reset edit form when modal is closed
    document.getElementById('editItemModal').addEventListener('hidden.bs.modal', function() {
        const form = document.getElementById('editItemForm');
        form.reset();
        form.classList.remove('was-validated');
    });
});

function formatEmail(email) {
    return email.split('@')[0];
}