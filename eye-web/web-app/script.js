const statusText = document.getElementById("status");
const PRE_TRAINED_MODEL_URL = "https://teachablemachine.withgoogle.com/models/U9Ll5V-XE/";
let tmModel = null;

async function loadModel() {
  statusText.innerText = "Loading AI Model...";
  
  try {
    // 1. Try loading from the hosted URL first (Most reliable for TM models)
    const modelURL = PRE_TRAINED_MODEL_URL + "model.json";
    const metadataURL = PRE_TRAINED_MODEL_URL + "metadata.json";
    
    tmModel = await tmImage.load(modelURL, metadataURL);
    statusText.innerText = "AI Model Connected (Cloud) ☁️";
    console.log("Loaded Cloud Model");
    
  } catch (cloudError) {
    console.warn("Cloud load failed, trying local...", cloudError);
    
    // 2. Fallback to local folder if cloud fails
    try {
      tmModel = await tmImage.load('model/tm-my-image-model/model.json', 'model/tm-my-image-model/metadata.json');
      statusText.innerText = "AI Model Connected (Local) 💻";
      console.log("Loaded Local Model");
    } catch (localError) {
      console.error("All model loads failed", localError);
      statusText.innerText = "Model Failed to Load. Check Console.";
    }
  }

  if (tmModel) {
    // Log class labels to verify they match user expectations
    const labels = tmModel.getClassLabels();
    console.log("Model Classes:", labels);
    // Expected: ["Retinitis Pigmentosa", "Healthy", "Diabetic Retinopathy", "Myopia", "Cataract"]
  }
}

// Call loadModel immediately
loadModel();

// --------------------------------------------------------
// STATIC IMAGE ANALYSIS
// --------------------------------------------------------
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show preview
  const imgElement = document.getElementById('imagePreview');
  const previewContainer = document.getElementById('image-preview-container');
  const resultText = document.getElementById('staticResult');
  
  previewContainer.style.display = 'block';
  imgElement.src = URL.createObjectURL(file);
  resultText.innerText = "Analyzing...";

  // Wait for image to load
  imgElement.onload = async () => {
    if (tmModel) {
      const prediction = await tmModel.predict(imgElement);
      
      // Find top prediction
      const topResult = prediction.reduce((prev, current) => {
        return (prev.probability > current.probability) ? prev : current;
      });
      
      resultText.innerText = `Result: ${topResult.className} (${(topResult.probability * 100).toFixed(1)}%)`;
      
      // Auto-save high confidence results to database
      if (topResult.probability > 0.8) {
         // saveScan(topResult.className); // Optional: auto-save
      }
    } else {
      resultText.innerText = "Model not loaded yet.";
    }
  };
}

// --------------------------------------------------------
// DATABASE INTEGRATION
// --------------------------------------------------------

function saveScan(label) {
  const timestamp = new Date().toISOString();
  // In a real app, you'd upload the image blob too.
  // For now, we save the metadata.
  
  const scanData = {
    timestamp: timestamp,
    diagnosis: label,
    status: "Verified by User"
  };

  const newScanKey = database.ref().child('scans').push().key;
  
  database.ref('scans/' + newScanKey).set(scanData, (error) => {
    if (error) {
      alert("Data could not be saved." + error);
    } else {
      alert("Data saved successfully!");
    }
  });
}

// Realtime Listener
const scanList = document.getElementById('scanList');
database.ref('scans').limitToLast(10).on('value', (snapshot) => {
  scanList.innerHTML = '';
  snapshot.forEach((childSnapshot) => {
    const childData = childSnapshot.val();
    const li = document.createElement('li');
    li.innerText = `${childData.timestamp.split('T')[1].split('.')[0]} - ${childData.diagnosis}`;
    scanList.prepend(li); // Show newest first
  });
});