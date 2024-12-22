let notes = {}; // Stores all notes with unique IDs
let currentNoteId = null; // Tracks the currently opened note
const db = firebase.firestore();

// Open the notes editor
function OpenNote() {
  document.getElementById("editor").style.display = "block";
}

// Close the notes editor
function closeNote() {
  document.getElementById("editor").style.display = "none";
}

// Initialize the app
function initApp() {
  loadNotes(); // Fetch and render notes from Firebase
  addEventListeners(); // Attach event listeners
}

// Add event listeners for interactions
function addEventListeners() {
  const saveNoteBtn = document.getElementById("save-note-btn");
  saveNoteBtn.addEventListener("click", saveNote);

  const editor = document.getElementById("note-editor");
  editor.addEventListener("input", autoSaveNote);

  const noteList = document.getElementById("note-list");
  noteList.addEventListener("click", loadSelectedNote);
}

// Fetch notes from Firebase and render them
function loadNotes() {
  const noteList = document.getElementById("note-list");
  noteList.innerHTML = ""; // Clear the current list

  db.collection("notes")
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        notes[doc.id] = doc.data();
      });
      renderNotes(); // Render notes after loading
      initGraph(); // Initialize the graph (visualization)
    })
    .catch((error) => {
      console.error("Error fetching notes: ", error);
      alert("Error fetching notes.");
    });
}

// Render notes in the sidebar
function renderNotes() {
  const noteList = document.getElementById("note-list");
  noteList.innerHTML = ""; // Clear the current list

  Object.entries(notes).forEach(([id, note]) => {
    const li = document.createElement("li");
    li.textContent = note.title || "Untitled Note"; // Default title
    li.dataset.id = id;
    li.className = currentNoteId === id ? "active" : ""; // Highlight active note
    li.onclick = () => openPopup(id); // Open the popup on click
    noteList.appendChild(li);
  });
}

// Load selected note into the editor
function loadSelectedNote(e) {
  if (e.target.tagName === "LI") {
    currentNoteId = e.target.dataset.id;
    loadNote(); // Load the content of the selected note
  }
}

let isSaving = false;  // Add a flag to prevent saving multiple times

// Auto-save the note while typing (optional feature)
function autoSaveNote(e) {
  if (currentNoteId && !isSaving) {  // Only auto-save if not already saving
    notes[currentNoteId].content = e.target.value;
    renderNotes();
  }
}

// Save note with improved control to avoid double saving
async function saveNote() {
  const saveNoteBtn = document.getElementById("save-note-btn");

  // Check if we are already saving, if so, return early to avoid double saving
  if (isSaving) return;

  // Disable the button immediately to prevent multiple submissions
  saveNoteBtn.disabled = true;
  isSaving = true;  // Set the flag to indicate saving is in progress

  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-editor").value.trim();

  // Check if both title and content are provided
  if (!title || !content) {
    alert("Both title and content are required.");
    isSaving = false; // Reset saving flag
    saveNoteBtn.disabled = false; // Re-enable the button if saving failed
    return; // Prevent saving if either is empty
  }

  const noteData = { 
    title, 
    content, 
    createdAt: firebase.firestore.FieldValue.serverTimestamp() 
  };

  try {
    console.log("Saving note...");

    // Check if the current note already exists (if editing an existing note)
    if (currentNoteId) {
      // If editing, update the existing note
      await db.collection("notes").doc(currentNoteId).update(noteData);
      console.log("Note updated successfully!");
    } else {
      // If new, add a new note
      await db.collection("notes").add(noteData);
      console.log("Note saved successfully!");
    }

    document.getElementById("alertMessege").style.display = "block" 
    document.getElementById("alertMessege").style.color = "rgba(133, 253, 133, 0.839)"
    document.getElementById("alertMessege").innerHTML = "Note saved successfully!" 
    setTimeout(() => {
      document.getElementById("alertMessege").style.display = "none"
    }, 2000);
    // clear the fields
    document.getElementById("note-title").value = "";
    document.getElementById("note-editor").value = "";
    closeNote();
    loadNotes();
  } catch (error) {
    console.error("Error saving note: ", error);
    document.getElementById("alertMessege").style.display = "block" 
    document.getElementById("alertMessege").style.color = "red"
    document.getElementById("alertMessege").innerHTML = "Error saving note, please try again." 
    setTimeout(() => {
      document.getElementById("alertMessege").style.display = "none"
    }, 2000);
  } finally {
    isSaving = false; // Reset saving flag
    saveNoteBtn.disabled = false; // Re-enable the button after saving
  }
}



// Create a new note and open the editor
function createNote() {
  const newNoteId = db.collection("notes").doc().id; // Generate a new doc ID
  notes[newNoteId] = { title: "", content: "" }; // Initialize an empty note

  // Save the new note to Firebase
  db.collection("notes").doc(newNoteId).set({ content: "", title: "", createdAt: firebase.firestore.FieldValue.serverTimestamp() })
    .then(() => {
      renderNotes(); // Update the list of notes
      currentNoteId = newNoteId; // Set the current note
      loadNote(); // Open the newly created note in the editor
    })
    .catch((error) => {
      console.error("Error creating note: ", error);
      alert("Error creating note, please try again.");
    });
}


function initGraph() {
  const graphContainer = document.getElementById("graph-container");
  graphContainer.innerHTML = "";

  const width = graphContainer.offsetWidth;
  const height = graphContainer.offsetHeight;
  const svg = d3.select("#graph-container").append("svg")
    .attr("width", width)
    .attr("height", height);

  const nodes = Object.keys(notes).map((id) => ({
    id,
    label: notes[id].title || "Untitled Note"
  }));

  // Create links by pairing notes based on their order (for simplicity, just connecting adjacent notes here)
  const links = Object.keys(notes).slice(0, -1).map((id, index) => ({
    source: Object.keys(notes)[index],
    target: Object.keys(notes)[index + 1]
  }));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.selectAll("line").data(links).enter().append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5);

  const node = svg.selectAll("circle").data(nodes).enter().append("circle")
    .attr("r", 5)
    .attr("fill", "#ECA125")
    .call(d3.drag().on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }).on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    }).on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }));

    node.on("mouseover", function(event, d) {
      d3.select(this).transition().duration(500).attr("r", 10);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).transition().duration(500).attr("r", 5);
    });

  const label = svg.selectAll("text").data(nodes).enter().append("text")
    .attr("dx", 12)
    .attr("dy", 4)
    .text((d) => d.label)
    .style("font-size", "12px")
    .style("fill", "white");

  simulation.on("tick", () => {
    link.attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y);

  });

  //  move the links around the screen every 2 seconds into random places, not into one line
  setInterval(() => {
    // Gradually update positions with a smooth transition
    links.forEach((link) => {
      // Generate new random positions for source and target
      const newSourceX = Math.random() * 500;
      const newSourceY = Math.random() * 500;
      const newTargetX = Math.random() * 500;
      const newTargetY = Math.random() * 500;
  
      // Interpolate source position
      d3.select(link.source)
        .transition()
        .duration(2000) // Smooth transition duration (in ms)
        .tween("position", () => {
          const sx = d3.interpolate(link.source.x, newSourceX);
          const sy = d3.interpolate(link.source.y, newSourceY);
          return (t) => {
            link.source.x = sx(t);
            link.source.y = sy(t);
          };
        });
  
      // Interpolate target position
      d3.select(link.target)
        .transition()
        .duration(2000) // Smooth transition duration (in ms)
        .tween("position", () => {
          const tx = d3.interpolate(link.target.x, newTargetX);
          const ty = d3.interpolate(link.target.y, newTargetY);
          return (t) => {
            link.target.x = tx(t);
            link.target.y = ty(t);
          };
        });
    });
  
    // Restart simulation with smooth alpha decay
    simulation.alpha(0.8).restart();
  }, 5000);  
}


document.addEventListener("DOMContentLoaded", initApp);



function openPopup(noteId) {
  const note = notes[noteId]; // Get the selected note from the `notes` object
  if (note) {
      document.getElementById("popup-title").textContent = note.title || "Untitled Note";
      document.getElementById("popup-content").textContent = note.content || "No content available.";
      document.getElementById("note-popup").style.display = "flex"; // Show the popup
  }
}

function closePopup() {
  document.getElementById("note-popup").style.display = "none"; // Hide the popup
}



function deleteNote() {
  if (!currentNoteId) {
    alert("No note selected to delete!");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this note?");
  if (!confirmDelete) return;

  db.collection("notes")
    .doc(currentNoteId)
    .delete()
    .then(() => {
      delete notes[currentNoteId];
      currentNoteId = null;
      closePopup();
      renderNotes();
      initGraph()
      document.getElementById("alertMessege").style.display = "block" 
      document.getElementById("alertMessege").style.color = "rgba(133, 253, 133, 0.839)"
      document.getElementById("alertMessege").innerHTML = "Note saved deleted!" 
      setTimeout(() => {
        document.getElementById("alertMessege").style.display = "none"
      }, 2000);

    })
    .catch((error) => {
      console.error("Error deleting note: ", error);
      alert("Failed to delete the note. Please try again.");
    });
}

function deleteNoteById(noteId) {
  const confirmDelete = confirm("Are you sure you want to delete this note?");
  if (!confirmDelete) return;

  db.collection("notes")
    .doc(noteId)
    .delete()
    .then(() => {
      delete notes[noteId]; // Remove the note from the local cache
      if (noteId === currentNoteId) {
        currentNoteId = null; // Reset the current note ID if it's the one being deleted
      }
      alert("Note deleted successfully!");
      renderNotes(); // Update the note list
    })
    .catch((error) => {
      console.error("Error deleting note: ", error);
      alert("Failed to delete the note. Please try again.");
    });
}
