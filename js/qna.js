import { hostApi, endpoints, getAccessToken } from "./api.js";

// keep track of selected files
const files = {
  questionImage: null,
  answerImage:   null,
};

// helper: show preview
function renderPreview(fileInputId, previewContainerId) {
  const file = files[fileInputId];
  const container = document.getElementById(previewContainerId);
  container.innerHTML = "";
  if (!file) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  container.appendChild(img);
  const btn = document.createElement("button");
  btn.textContent = "Remove";
  btn.onclick = () => {
    files[fileInputId] = null;
    renderPreview(fileInputId, previewContainerId);
  };
  container.appendChild(btn);
}

// drag & drop / click / paste handlers
function handleDragOver(e) {
  e.preventDefault(); e.currentTarget.classList.add("dragover");
}
function handleDragLeave(e) {
  e.currentTarget.classList.remove("dragover");
}
function handleDrop(e, field) {
  e.preventDefault(); e.currentTarget.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    files[field] = file;
    renderPreview(field, field + "Preview");
  }
}
function handleFileChange(e, field) {
  const file = e.target.files[0];
  if (file) {
    files[field] = file;
    renderPreview(field, field + "Preview");
  }
}
function handlePaste(e, field) {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === "file") {
      const file = items[i].getAsFile();
      if (file.type.startsWith("image/")) {
        files[field] = file;
        renderPreview(field, field + "Preview");
      }
    }
  }
}

// populate selects
async function fetchUsersAndSubjects() {
  try {
    const resp = await axios.get(`${hostApi}${endpoints.qnaMeta}`); 
    // assume { users: [...], subjects: [...] }
    const { users, subjects } = resp.data;
    const uSelects = ["questionUser", "answerUser"];
    uSelects.forEach(id => {
      const sel = document.getElementById(id);
      users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id; opt.textContent = u.username;
        sel.appendChild(opt);
      });
    });
    const subj = document.getElementById("subject");
    subjects.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id; opt.textContent = s.subjectName;
      subj.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load QnA metadata:", err);
  }
}

// form submission
async function handleSubmit() {
  // clear previous errors
  document.querySelectorAll(".error").forEach(p=>p.textContent="");

  // collect
  const data = new FormData();
  const qUser = document.getElementById("questionUser").value;
  const subj  = document.getElementById("subject").value;
  const qText = document.getElementById("question").value.trim();
  const aUser = document.getElementById("answerUser").value;
  const aText = document.getElementById("answer").value.trim();

  let valid = true;
  if (!qUser) { document.getElementById("questionUserError").textContent = "Select a user."; valid = false; }
  if (!subj)   { document.getElementById("subjectError").textContent = "Select a subject."; valid = false; }
  if (!qText) { document.getElementById("questionError").textContent = "Enter a question."; valid = false; }
  if (!aUser) { document.getElementById("answerUserError").textContent = "Select a user."; valid = false; }
  if (!aText) { document.getElementById("answerError").textContent = "Enter an answer."; valid = false; }
  if (!valid) return;

  data.append("question_user", qUser);
  data.append("subject", subj);
  data.append("question_text", qText);
  if (files.questionImage) data.append("question_image", files.questionImage);

  data.append("answer_user", aUser);
  data.append("answer_text", aText);
  if (files.answerImage) data.append("answer_image", files.answerImage);

  // auth
  const token = await getAccessToken();
  if (!token) { alert("Please login."); return; }

  try {
    const res = await fetch(`${hostApi}${endpoints.qnaSubmit}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data
    });
    if (!res.ok) throw await res.json();
    alert("Submitted!");
    document.getElementById("qnaForm").reset();
    files.questionImage = files.answerImage = null;
    renderPreview("questionImage", "questionImagePreview");
    renderPreview("answerImage",   "answerImagePreview");
  } catch (err) {
    console.error("Submit error:", err);
    alert("Error submitting form.");
  }
}

// wire everything up
window.addEventListener("DOMContentLoaded", () => {
  // drag/drop/paste on both areas
  ["questionImage","answerImage"].forEach(field => {
    const area = document.getElementById(field + "DropArea");
    area.addEventListener("dragover", e => handleDragOver(e));
    area.addEventListener("dragleave", e => handleDragLeave(e));
    area.addEventListener("drop", e => handleDrop(e, field));
    area.addEventListener("paste", e => handlePaste(e, field));
    // click is in HTML already
  });

  document.getElementById("questionImage").addEventListener("change", e => handleFileChange(e, "questionImage"));
  document.getElementById("answerImage").addEventListener("change", e => handleFileChange(e, "answerImage"));
  document.querySelector("button[type='button']").addEventListener("click", handleSubmit);

  // load users & subjects
  fetchUsersAndSubjects();
});

window.handlePaste  = handlePaste;
window.handleSubmit = handleSubmit;
