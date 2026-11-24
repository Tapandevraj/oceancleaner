// Ocean Plastic Bounty - single page, beginner version
// Is file mein 3 kaam hain: Calculator, Dashboard, Contact form

// ---------- Rate nikalne ka function (calculator aur dashboard dono use karte hain) ----------
function getRate(type) {
  if (type === "Mixed plastic") {
    return 25;
  } else if (type === "Hard plastic") {
    return 30;
  } else if (type === "PET bottles") {
    return 35;
  } else if (type === "Fishing nets") {
    return 60;
  } else {
    return 0;
  }
}

// =====================================================
// PART 1: HOME - Calculator
// =====================================================
function updateCalculator() {
  let type = document.getElementById("calcType").value;
  let kg = Number(document.getElementById("calcWeight").value);
  let trips = Number(document.getElementById("calcTrips").value);

  let perTrip = kg * getRate(type);   // ek trip ki kamayi
  let perMonth = perTrip * trips;     // mahine ki income

  document.getElementById("calcTrip").textContent = perTrip;
  document.getElementById("calcMonth").textContent = perMonth;
}

document.getElementById("calcType").addEventListener("change", updateCalculator);
document.getElementById("calcWeight").addEventListener("input", updateCalculator);
document.getElementById("calcTrips").addEventListener("input", updateCalculator);
updateCalculator();   // page khulte hi ek baar chalao

// =====================================================
// PART 2: DASHBOARD
// =====================================================

// Saved records localStorage se uthao
let records = [];
let saved = localStorage.getItem("oceanRecords3");
if (saved !== null) {
  records = JSON.parse(saved);
}

// ---------- Form submit hone par ----------
let form = document.getElementById("logForm");
let message = document.getElementById("message");

form.addEventListener("submit", function (event) {
  event.preventDefault();   // page reload hone se roko

  let name = document.getElementById("name").value.trim();
  let boat = document.getElementById("boat").value.trim();
  let type = document.getElementById("type").value;
  let weight = Number(document.getElementById("weight").value);
  let lat = document.getElementById("lat").value;
  let lon = document.getElementById("lon").value;

  // Check karo ki sab theek bhara hai
  if (name === "" || boat === "") {
    message.textContent = "Please enter fisherman name and boat ID.";
    return;
  }
  if (weight <= 0) {
    message.textContent = "Weight must be more than 0 kg.";
    return;
  }
  if (lat === "" || lon === "") {
    message.textContent = "Please enter GPS latitude and longitude.";
    return;
  }
  if (Number(lat) < -90 || Number(lat) > 90 || Number(lon) < -180 || Number(lon) > 180) {
    message.textContent = "Latitude: -90 to 90, Longitude: -180 to 180.";
    return;
  }

  // Naya record banao aur list mein daalo
  let record = {
    name: name,
    boat: boat,
    type: type,
    weight: weight,
    lat: Number(lat),
    lon: Number(lon),
    earned: weight * getRate(type)
  };
  records.push(record);

  saveAndShow();
  form.reset();
  message.textContent = "";
});

// ---------- Records table (search + filter ke saath) ----------
function showAll() {
  let searchText = document.getElementById("search").value.toLowerCase();
  let filterType = document.getElementById("filterType").value;

  let html = "";
  let totalKg = 0;
  let totalPay = 0;

  for (let i = 0; i < records.length; i++) {
    let r = records[i];

    // Search: naam ya boat ID mein text milna chahiye
    let matchSearch = r.name.toLowerCase().includes(searchText) ||
                      r.boat.toLowerCase().includes(searchText);

    // Filter: "All" ho ya plastic type same ho
    let matchType = (filterType === "All") || (r.type === filterType);

    if (matchSearch && matchType) {
      totalKg = totalKg + r.weight;
      totalPay = totalPay + r.earned;

      html = html +
        "<tr>" +
        "<td>" + r.name + "</td>" +
        "<td>" + r.boat + "</td>" +
        "<td>" + r.type + "</td>" +
        "<td>" + r.weight + "</td>" +
        "<td>" + r.lat + ", " + r.lon + "</td>" +
        "<td>₹" + r.earned + "</td>" +
        "<td><button class='delete-btn' onclick='deleteRecord(" + i + ")'>Delete</button></td>" +
        "</tr>";
    }
  }

  if (html === "") {
    html = "<tr><td colspan='7' class='empty'>No records found. Add a weigh-in or click 'Add sample data'.</td></tr>";
  }

  document.getElementById("tableBody").innerHTML = html;
  document.getElementById("totalKg").textContent = totalKg;
  document.getElementById("totalPay").textContent = totalPay;
}

document.getElementById("search").addEventListener("input", showAll);
document.getElementById("filterType").addEventListener("change", showAll);

// ---------- Har fisherman ki income ----------
function showSummary() {
  // 4 alag lists, same position = same fisherman
  let names = [];
  let trips = [];
  let kgs = [];
  let incomes = [];

  for (let i = 0; i < records.length; i++) {
    let r = records[i];
    let pos = names.indexOf(r.name);   // kya ye naam pehle aa chuka hai?

    if (pos === -1) {
      // Naya fisherman
      names.push(r.name);
      trips.push(1);
      kgs.push(r.weight);
      incomes.push(r.earned);
    } else {
      // Purana fisherman: values jodo
      trips[pos] = trips[pos] + 1;
      kgs[pos] = kgs[pos] + r.weight;
      incomes[pos] = incomes[pos] + r.earned;
    }
  }

  let html = "";
  for (let j = 0; j < names.length; j++) {
    html = html +
      "<tr>" +
      "<td>" + names[j] + "</td>" +
      "<td>" + trips[j] + "</td>" +
      "<td>" + kgs[j] + "</td>" +
      "<td>₹" + incomes[j] + "</td>" +
      "</tr>";
  }

  if (html === "") {
    html = "<tr><td colspan='4' class='empty'>No fishermen yet.</td></tr>";
  }
  document.getElementById("summaryBody").innerHTML = html;

  document.getElementById("stFishers").textContent = names.length;
}

// ---------- Upar ke 4 stats cards ----------
function showStats() {
  let totalKg = 0;
  let totalPay = 0;

  for (let i = 0; i < records.length; i++) {
    totalKg = totalKg + records[i].weight;
    totalPay = totalPay + records[i].earned;
  }

  document.getElementById("stKg").textContent = totalKg;
  document.getElementById("stPay").textContent = "₹" + totalPay;
  document.getElementById("stTrips").textContent = records.length;
}

// ---------- Bars (har plastic type ka kitna kg) ----------
function showBars() {
  let types = ["Mixed plastic", "Hard plastic", "PET bottles", "Fishing nets"];
  let kgs = [0, 0, 0, 0];

  // Har record ka weight sahi type mein jodo
  for (let i = 0; i < records.length; i++) {
    let pos = types.indexOf(records[i].type);
    kgs[pos] = kgs[pos] + records[i].weight;
  }

  // Sabse bada kg dhundo (bar ki lambai ke liye)
  let biggest = 1;
  for (let j = 0; j < kgs.length; j++) {
    if (kgs[j] > biggest) {
      biggest = kgs[j];
    }
  }

  let html = "";
  for (let k = 0; k < types.length; k++) {
    let percent = (kgs[k] / biggest) * 100;
    html = html +
      "<div class='bar-row'>" +
      "<div class='bar-label'><span>" + types[k] + "</span><span>" + kgs[k] + " kg</span></div>" +
      "<div class='bar-back'><div class='bar-fill' style='width:" + percent + "%'></div></div>" +
      "</div>";
  }
  document.getElementById("bars").innerHTML = html;
}

// ---------- Delete, Save, Clear ----------
function deleteRecord(index) {
  records.splice(index, 1);   // us position ka record hatao
  saveAndShow();
}

function saveAndShow() {
  localStorage.setItem("oceanRecords3", JSON.stringify(records));
  showAll();
  showSummary();
  showStats();
  showBars();
}

document.getElementById("clearBtn").addEventListener("click", function () {
  let sure = confirm("Delete all records?");
  if (sure) {
    records = [];
    saveAndShow();
  }
});

// ---------- Sample data button (demo ke liye) ----------
document.getElementById("sampleBtn").addEventListener("click", function () {
  records.push({ name: "Ravi Kumar", boat: "PB-1024", type: "Fishing nets", weight: 62, lat: 15.4989, lon: 73.8278, earned: 62 * 60 });
  records.push({ name: "Meena Devi", boat: "PB-2201", type: "PET bottles", weight: 34, lat: 15.5012, lon: 73.8101, earned: 34 * 35 });
  records.push({ name: "Anil Naik", boat: "GA-0932", type: "Hard plastic", weight: 27, lat: 15.5230, lon: 73.8350, earned: 27 * 30 });
  records.push({ name: "Ravi Kumar", boat: "PB-1024", type: "Mixed plastic", weight: 40, lat: 15.4875, lon: 73.7964, earned: 40 * 25 });
  saveAndShow();
});

// Page khulte hi dashboard dikhao
showAll();
showSummary();
showStats();
showBars();

// =====================================================
// PART 3: CONTACT - message form ki checking
// =====================================================
let contactForm = document.getElementById("contactForm");
let note = document.getElementById("cNote");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let cName = document.getElementById("cName").value.trim();
  let cEmail = document.getElementById("cEmail").value.trim();
  let cMsg = document.getElementById("cMsg").value.trim();

  if (cName === "" || cEmail === "" || cMsg === "") {
    note.style.color = "red";
    note.textContent = "Please fill all the fields.";
    return;
  }
  if (!cEmail.includes("@") || !cEmail.includes(".")) {
    note.style.color = "red";
    note.textContent = "Please enter a valid email address.";
    return;
  }

  note.style.color = "green";
  note.textContent = "Thank you, " + cName + "! Your message has been received.";
  contactForm.reset();
});