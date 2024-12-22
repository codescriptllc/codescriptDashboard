const db = firebase.firestore();
const customersCollection = db.collection("customers"); // Your customers collection

// Fetch and Update Customer Count
async function updateCustomerCount() {
  try {
    // Get the customers collection and fetch the count
    const querySnapshot = await customersCollection.get();
    const customerCount = querySnapshot.size;  // Get the total number of customers

    // Update the "New Customers" stat on the page
    document.getElementById("newCustomersStat").textContent = customerCount;
  } catch (error) {
    console.error("Error fetching customer count:", error);
    alert("Failed to load customer count.");
  }
}

// Run the function to update the count on page load
window.onload = updateCustomerCount;



async function fetchCustomerData() {
  const snapshot = await db.collection("customers").get();
  const customers = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null
  }));

  // Group by month
  const customerGrowth = {};
  customers.forEach(customer => {
    if (customer.createdAt) {
      const date = new Date(customer.createdAt);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2024-12"
      customerGrowth[yearMonth] = (customerGrowth[yearMonth] || 0) + 1;
    }
  });

  // Sort by date
  const sortedData = Object.entries(customerGrowth).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const labels = sortedData.map(([key]) => key);
  const data = sortedData.map(([, value]) => value);

  renderChart(labels, data);
}




function renderChart(labels, data) {
  const ctx = document.getElementById('customerGrowthChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Customer Growth',
        data: data,
        borderColor: '#ECA125',
        backgroundColor: '#ECA125',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        },
        y: {
          title: {
            display: true,
            text: 'New Customers'
          }
        }
      }
    }
  });
}



document.addEventListener("DOMContentLoaded", () => {
  fetchCustomerData();
});




// DYNAMICALLY DISPLAY THE REVENUE COST
async function calculateTotalRevenue() {
  try {
    // Reference to the "revenue" collection in Firestore
    const revenueCollection = db.collection('revenue');

    // Fetch all revenue documents
    const snapshot = await revenueCollection.get();

    let totalRevenue = 0;

    // Iterate through documents and sum up the revenue amounts
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.amount) {
        totalRevenue += parseFloat(data.amount); // Ensure the value is treated as a number
      }
    });

    // Update the Revenue stat card dynamically
    const revenueStatCard = document.querySelector('.stat-card h3 + p'); // Finds the <p> after <h3> with "Revenue"
    if (revenueStatCard) {
      revenueStatCard.textContent = `$${totalRevenue.toLocaleString()}`; // Format the totalRevenue with commas
    }
  } catch (error) {
    console.error('Error fetching revenue data:', error);
  }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', calculateTotalRevenue);



document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();

  // Elements
  const expenseTotalElement = document.querySelector('.stat-card:nth-child(4) p'); // Adjust to select the correct element

  // Fetch and calculate total expenses
  async function updateTotalExpenses() {
    try {
      const snapshot = await db.collection('expenses').get();
      let totalExpenses = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalExpenses += data.amount || 0; // Add amount if it exists
      });

      // Update the total expenses in the DOM
      expenseTotalElement.textContent = `$${totalExpenses.toLocaleString()}`;
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  // Update total expenses on page load
  updateTotalExpenses();

  // Real-time listener for expenses (if you want real-time updates)
  db.collection('expenses').onSnapshot(() => {
    updateTotalExpenses();
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();

  // Elements
  const expenseTotalElement = document.querySelector('.stat-card:nth-child(4) p'); // Adjust to select the correct element
  const revenueTotalElement = document.querySelector('.stat-card:nth-child(1) p'); // Adjust for revenue
  const expenseRevenueCtx = document.getElementById('expenseRevenueChart').getContext('2d');

  let expenseRevenueChart;

  async function updateTotalExpensesAndRevenue() {
    try {
      let monthlyExpenses = [];
      let monthlyRevenue = [];
      let months = [];
  
      // Fetch all expenses and group them by month
      const expenseSnapshot = await db.collection('expenses').get();
      const expenseData = {};
      expenseSnapshot.forEach((doc) => {
        const data = doc.data();
        const expenseDate = new Date(data.date); // Assuming 'date' field exists
        const month = expenseDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!expenseData[month]) {
          expenseData[month] = 0;
        }
        expenseData[month] += data.amount || 0;
      });
  
      // Sort months for the X-axis
      months = Object.keys(expenseData).sort();
  
      // Collect expenses by month
      months.forEach(month => {
        monthlyExpenses.push(expenseData[month]);
      });
  
      // Fetch total revenue for each month and group by month
      const revenueSnapshot = await db.collection('revenue').get(); // Adjusted from previous method
      const revenueData = {};
      revenueSnapshot.forEach((doc) => {
        const data = doc.data();
        const revenueDate = new Date(data.date); // Assuming 'date' field exists
        const month = revenueDate.toLocaleString('default', { month: 'short', year: 'numeric' });
  
        revenueData[month] = data.amount || 0;
      });
  
      // Collect revenue by month (use 0 if no data for the month)
      months.forEach(month => {
        monthlyRevenue.push(revenueData[month] || 0);
      });
  
      // Update the DOM for total values (for revenue stat card)
      const totalExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr, 0);
      const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr, 0);
      
      // Update the revenue stat card
      const revenueStatCard = document.querySelector('.stat-card h3 + p');
      if (revenueStatCard) {
        revenueStatCard.textContent = `$${totalRevenue.toLocaleString()}`; // Format the totalRevenue with commas
      }
  
      // Update the expense stat card
      expenseTotalElement.textContent = `$${totalExpenses.toLocaleString()}`;
  
      // Update the chart
      updateChart(months, monthlyExpenses, monthlyRevenue);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  

  function updateChart(months, expenses, revenue) {
    const chartData = {
      labels: months,
      datasets: [
        {
          label: 'Expenses ($)',
          data: expenses,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: true,
          borderWidth: 2,
        },
        {
          label: 'Revenue ($)',
          data: revenue,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  
    // Custom plugin to draw the goal line
    const goalLinePlugin = {
      id: 'goalLine',
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales: { y } } = chart;
        const goalValue = 10000; // Goal income value
        const yPosition = y.getPixelForValue(goalValue); // Get y-axis pixel for the goal
  
        // Draw the horizontal goal line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(chartArea.left, yPosition); // Start at left of chart
        ctx.lineTo(chartArea.right, yPosition); // End at right of chart
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Green color
        ctx.setLineDash([5, 5]); // Dotted line
        ctx.stroke();
        ctx.restore();
  
        // Add goal label
        ctx.fillStyle = 'rgba(0, 128, 0, 0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Goal: $10,000', chartArea.right - 80, yPosition - 5);
      },
    };
  
    // Initialize or update the chart
    if (expenseRevenueChart) {
      expenseRevenueChart.data = chartData;
      expenseRevenueChart.update();
    } else {
      expenseRevenueChart = new Chart(expenseRevenueCtx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 15000, // Ensure goal line is visible
              ticks: {
                callback: function (value) {
                  return '$' + value.toLocaleString();
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Month',
              },
            },
          },
        },
        plugins: [goalLinePlugin], // Add the custom plugin
      });
    }
  }
  

  // Initialize data fetching and chart update
  updateTotalExpensesAndRevenue();

  // Real-time listeners (optional, if your data changes often)
  db.collection('expenses').onSnapshot(updateTotalExpensesAndRevenue);
  db.collection('stats').doc('revenue').collection('monthly').onSnapshot(updateTotalExpensesAndRevenue);
});
