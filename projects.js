// Initialize Firestore
const db = firebase.firestore();

// Global variable for project statistics chart
let projectStatsChart;

/**
 * Update or initialize the project statistics chart
 * @param {Object} stats - Object containing project statistics
 */
function updateProjectStatsChart(stats) {
  const ctx = document.getElementById('projectStatsChart').getContext('2d');

  const data = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      label: 'Project Status',
      data: [stats.completed, stats.inProgress, stats.notStarted],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
    }],
  };

  if (projectStatsChart) {
    projectStatsChart.data = data;
    projectStatsChart.update();
  } else {
    projectStatsChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
      },
    });
  }
}

/**
 * Fetch and display projects from Firestore
 */
function fetchProjects() {
  db.collection('projects').onSnapshot((snapshot) => {
    const projects = [];
    const stats = { completed: 0, inProgress: 0, notStarted: 0 };

    snapshot.forEach((doc) => {
      const project = doc.data();
      projects.push({ id: doc.id, ...project });

      if (project.status === 'Completed') stats.completed++;
      else if (project.status === 'In Progress') stats.inProgress++;
      else if (project.status === 'Not Started') stats.notStarted++;
    });

    renderProjectsTable(projects);
    updateProjectStatsChart(stats);
  });
}

/**
 * Render projects in the HTML table
 * @param {Array} projects - List of project objects
 */
function renderProjectsTable(projects) {
  const tableBody = document.getElementById('projectTableBody');
  tableBody.innerHTML = '';

  projects.forEach((project) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${project.name}</td>
      <td>${project.status}</td>
      <td>${project.deadline}</td>
      <td>
        <button onclick="deleteProject('${project.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * Delete a project from Firestore
 * @param {string} projectId - ID of the project to delete
 */
function deleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project?')) {
    db.collection('projects').doc(projectId).delete()
      .then(() => {
        document.getElementById("success-message").style.display = "block"
        document.getElementById("success-message").innerHTML = "Project deleted successfully!"
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none"
        }, 3000);

      })
      .catch((error) => {
        console.error('Error deleting project:', error);
      });
  }
}

/**
 * Add a new project to Firestore
 * @param {Event} event - Form submission event
 */
async function addProject(event) {
  event.preventDefault();

  const name = document.getElementById('projectName')?.value.trim();
  const status = document.getElementById('projectStatus')?.value.trim();
  const deadline = document.getElementById('projectDeadline')?.value;

  if (!name || !status || !deadline) {
    alert('Please fill out all fields!');
    return;
  }

  try {
    const docRef = await db.collection('projects').add({
      name,
      status,
      deadline,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Project added with ID:", docRef.id);

    const form = document.getElementById('addProjectForm');
    if (form) {
      form.reset();
    } else {
      console.warn('Form not found; unable to reset.');
    }

    closeProjectForm();
  } catch (error) {
    console.error("Error adding project:", error);
    alert(`Failed to add project. Error: ${error.message}`);
  }
}

// Open the Add Project form popup
function openProjectForm() {
    document.getElementById('projectFormPopup').classList.add('show');
    document.getElementById('projectFormPopup').style.display = 'block'; // Ensure visibility
  }
  
  // Close the Add Project form popup
  function closeProjectForm() {
    const popup = document.getElementById('projectFormPopup');
    if (popup) {
      popup.classList.remove('show');
      popup.style.display = 'none';
    } else {
      console.error('Popup element not found.');
    }
  }
  
  // Close the Add Project form if clicked outside the popup
  function closeProjectFormOutside(event) {
    const formContainer = document.querySelector('#projectFormPopup .form-container');
    if (!formContainer.contains(event.target)) {
      closeProjectForm();
    }
  }
  
  // Handle form submission
  document.getElementById('addProjectForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const name = document.getElementById('projectName')?.value.trim();
    const status = document.getElementById('projectStatus')?.value.trim();
    const deadline = document.getElementById('projectDeadline')?.value;
  
    if (!name || !status || !deadline) {
      alert('Please fill out all fields!');
      return;
    }
  
    try {
      await db.collection('projects').add({
        name,
        status,
        deadline,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  
      document.getElementById("success-message").style.display = "block"
      document.getElementById("success-message").innerHTML = "Project deleted successfully!"
      setTimeout(() => {
          document.getElementById("success-message").style.display = "none"
      }, 3000);
        document.getElementById('addProjectForm').reset();
      closeProjectForm();
    } catch (error) {
      console.error('Error adding project:', error);
      alert(`Failed to add project. Error: ${error.message}`);
    }
  });
  

// Fetch projects on page load
fetchProjects();
