
//     // Add Expense
//     const expenseForm = document.getElementById('expenceForm');
//     const expenseAmountInput = document.getElementById('expenseAmount');
//     const expenseDescriptionInput = document.getElementById('expenseDescription');
//     const expenseList = document.querySelector('#expenceList ul');
//     const expenseSuccessMessage = document.getElementById('expenseSuccessMessage');
//     const db = firebase.firestore();
  
  
//   // Fetch and display expenses
//   async function fetchExpenses() {
//     expenseList.innerHTML = '';
//     try {
//       const snapshot = await db.collection('expenses').orderBy('date', 'desc').get();

//       snapshot.forEach(doc => {
//         const data = doc.data();
//         const listItem = document.createElement('li');
//         listItem.textContent = `Amount: $${data.amount.toLocaleString()}, Description: ${data.description}, Date: ${new Date(data.date).toLocaleDateString()}`;
//         expenseList.appendChild(listItem);
//       });
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//     }
//   }

//   // Function to add expense
//   expenseForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const amount = parseFloat(expenseAmountInput.value);
//     const description = expenseDescriptionInput.value.trim();

//     if (isNaN(amount) || amount <= 0 || !description) {
//       alert('Please enter a valid amount and description.');
//       return;
//     }

//     try {
//       await db.collection('expenses').add({
//         amount,
//         description,
//         date: new Date().toISOString()
//       });

//       // Display success message
//       expenseSuccessMessage.style.display = 'block';
//       setTimeout(() => {
//         expenseSuccessMessage.style.display = 'none';
//       }, 3000);

//       // Clear inputs
//       expenseAmountInput.value = '';
//       expenseDescriptionInput.value = '';

//       // Refresh the expense list
//       fetchExpenses();
//     } catch (error) {
//       console.error('Error adding expense:', error);
//       alert('Failed to add expense. Please try again.');
//     }
//   });


//   // Call fetchExpenses on page load
//   fetchExpenses();





// Initialize Firestore (Ensure Firebase is correctly initialized)
const db = firebase.firestore();

// Elements
const expenseForm = document.getElementById('expenceForm');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseDescriptionInput = document.getElementById('expenseDescription');
const expenseList = document.querySelector('#expenceList ul');
const expenseSuccessMessage = document.getElementById('expenseSuccessMessage');

// Fetch and display expenses
async function fetchExpenses() {
  expenseList.innerHTML = ''; // Clear the list
  try {
    const snapshot = await db.collection('expenses').orderBy('date', 'desc').get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const listItem = document.createElement('li');
      listItem.textContent = `Amount: $${data.amount.toLocaleString()}, Description: ${data.description}, Date: ${new Date(data.date).toLocaleDateString()}`;
      expenseList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    alert('Failed to load expenses. Please try again later.');
  }
}

// Function to add expense
expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = parseFloat(expenseAmountInput.value);
  const description = expenseDescriptionInput.value.trim();

  if (isNaN(amount) || amount <= 0 || !description) {
    alert('Please enter a valid amount and description.');
    return;
  }

  try {
    console.log('Attempting to add expense:', { amount, description });

    // Add the expense to Firestore
    await db.collection('expenses').add({
      amount,
      description,
      date: new Date().toISOString(),
    });

    console.log('Expense successfully added');

    // Display success message
    expenseSuccessMessage.style.display = 'block';
    setTimeout(() => {
      expenseSuccessMessage.style.display = 'none';
    }, 3000);

    // Clear inputs
    expenseAmountInput.value = '';
    expenseDescriptionInput.value = '';

    // Refresh the expense list
    fetchExpenses();
  } catch (error) {
    console.error('Error adding expense:', error);
    alert(`Failed to add expense. Error: ${error.message}`);
  }
});

// Call fetchExpenses on page load
fetchExpenses();
