// Open the Add Customer Form
function openForm() {
    document.getElementById('customerFormPopup').classList.add('show');
  }
  
  // Close the Add Customer Form
  function closeForm() {
    document.getElementById('customerFormPopup').classList.remove('show');
  }
  
  // Close Form when Clicking Outside the Form
  function closeFormOutside(event) {
    const formContainer = document.querySelector('.form-container');
    if (!formContainer.contains(event.target)) {
      closeForm();
    }
  }
  
  // Firebase Firestore Initialization
const db = firebase.firestore();
const customersCollection = db.collection('customers');

// Add Customer Functionality
async function addCustomer(event) {
  event.preventDefault(); // Prevent form submission reload

  // Retrieve form values
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();

  if (!name || !email || !phone) {
    alert('Please fill out all fields!');
    return;
  }

  try {
    // Add customer to Firestore with a timestamp
    const docRef = await customersCollection.add({
      name,
      email,
      phone,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Customer added with ID:", docRef.id);

    // Fetch the new document to get the resolved timestamp
    const newDoc = await docRef.get();
    const customer = newDoc.data();

    // Add customer to the table
    addCustomerToTable(docRef.id, customer.name, customer.email, customer.phone, customer.createdAt.toDate());

    // Reset form and close popup
    document.getElementById('customerForm').reset();
    closeForm();
  } catch (error) {
    console.error("Error adding customer:", error);
    alert("Failed to add customer. Please try again.");
  }
}


async function fetchCustomers() {
  try {
    const querySnapshot = await customersCollection.get();
    querySnapshot.forEach((doc) => {
      const customer = doc.data();
      addCustomerToTable(
        doc.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.createdAt ? customer.createdAt.toDate() : 'N/A'
      );
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    alert("Failed to fetch customers. Please reload the page.");
  }
}

function addCustomerToTable(id, name, email, phone, createdAt) {
  const tableBody = document.getElementById('customersTable').querySelector('tbody');
  const newRow = tableBody.insertRow();

  newRow.setAttribute('data-id', id); // Set data attribute for easier access
  newRow.innerHTML = `
    <td>${id}</td>
    <td>${name}</td>
    <td>${email}</td>
    <td>${phone}</td>
    <td>${createdAt instanceof Date ? createdAt.toLocaleDateString() : 'N/A'}</td>
    <td>
      <button class="edit-btn" data-id="${id}">Edit</button>
      <button class="delete-btn" data-id="${id}">Delete</button>
    </td>
  `;
}


// Delete Customer from Firestore
async function deleteCustomer(id, rowElement) {
  try {
    await customersCollection.doc(id).delete();
    rowElement.remove(); // Remove row from the table
    console.log(`Customer with ID ${id} deleted.`);
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);
    alert("Failed to delete customer. Please try again.");
  }
}

// Handle Table Actions (Event Delegation)
document.getElementById('customersTable').addEventListener('click', (event) => {
  const target = event.target;
  const id = target.getAttribute('data-id');
  const rowElement = target.closest('tr');

  if (target.classList.contains('delete-btn')) {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id, rowElement);
    }
  } else if (target.classList.contains('edit-btn')) {
    // Placeholder for edit functionality
    alert(`Edit functionality for Customer ID: ${id} not implemented yet.`);
  }
});

// Initialize Table on Page Load
fetchCustomers();
