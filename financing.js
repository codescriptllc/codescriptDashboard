document.addEventListener("DOMContentLoaded", () => {
    const db = firebase.firestore();
    const revenueList = document.querySelector('#revenueList ul');
  
    // Fetch existing revenue
    const loadRevenue = async () => {
      try {
        const snapshot = await db.collection('revenue').orderBy('date').get();
        revenueList.innerHTML = ''; // Clear existing list to avoid duplicates
        snapshot.forEach(doc => {
          const data = doc.data();
          const li = document.createElement('li');
          li.textContent = `${data.date}: $${data.amount}`;
          revenueList.appendChild(li);
        });
      } catch (error) {
        console.error("Error loading revenue:", error);
      }
    };
  
    // Add new revenue
    document.getElementById('revenueForm').addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent form submission from refreshing the page
  
      const amount = parseFloat(document.getElementById('revenueAmount').value);
  
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
      }
  
      try {
        await db.collection('revenue').add({
          amount: amount,
          date: new Date().toISOString().split('T')[0]
        });
        document.getElementById("successMessege").style.display = "block"
        setTimeout(() => {
            document.getElementById("successMessege").style.display = "none"
        }, 3000);
        document.getElementById('revenueAmount').value = '';
        loadRevenue(); // Refresh the revenue list
      } catch (error) {
        console.error("Error adding revenue:", error);
        alert("Failed to add revenue. Please try again.");
      }
    });
  
    // Initial load
    loadRevenue();
  });
  