const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const uploadingStatus = document.querySelector(".uploadingStatus");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "https://linkshareto.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb


browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  //console.log("type of"+e.dataTransfer.files.kind);
  const files = e.dataTransfer.files;
  //console.log(files.length)
  if ((typeof files ==="undefined")||files.length > 1 ) {
    showToast("You can't upload multiple files");
    setTimeout(function(){ location.reload() }, 1000);
  }
  else if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
      setTimeout(function(){ location.reload() }, 1000);
      return;
    }
  }
  // if (files.length) {
  //   fileInput.files = files;
  //   uploadFile()
  // }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");

  //console.log("drag ended");
});

// file input change and uploader
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 1) {
    //console.log("Upload only 1 file......")
    fileInput.value = ""
    showToast("Upload only 1 file")
    setTimeout(function(){ location.reload() }, 1000);
    return;
  }
  if (fileInput.files[0].size > maxAllowedSize) {
   // console.log("Max file size is 100MB......")
    showToast("Max file size is 100MB");
    fileInput.value=""; // reset the input
    setTimeout(function(){ location.reload() }, 1000);
    return;
  }
  uploadFile();
});

// sharing container listenrs
copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
  fileURL.select();
});

const uploadFile = () => {
  if (fileInput.files.length > 1 ) {
    fileInput.value = ""
    showToast("Upload only 1 file")
    setTimeout(function(){ location.reload() }, 1000);
    return;
  }
  //console.log(fileInput.files)
  const file = fileInput.files[0];
  if ((typeof file ==="undefined")||file.size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value=""; // reset the input
    setTimeout(function(){ location.reload() }, 1000);
    return;
  }
  const formData = new FormData();
  formData.append("myFile", file);

  //show the uploader
  progressContainer.style.display = "block";

  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // handle error
  xhr.upload.onerror = function () {
    fileInput.value = ""; // reset the input
    showToast(`Error in upload: ${xhr.statusText}.`);
    setTimeout(function(){ location.reload() }, 1000);
  };

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        // The request has been completed successfully
        // console.log("successfully uploaded");
        try{
          // console.log("json"+JSON.parse(xhr.responseText))
          onUploadSuccess(JSON.parse(xhr.responseText));
        }catch(e){
          showToast("Only 1 file allowed")
        }
      } else {
        // Oh no! There has been an error with the request!
        //console.log("xhr request error")
        showToast("There might be some error...")
        setTimeout(function(){ location.reload() }, 1000);
      }
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  fileInput.value = ""; // reset the input
  uploadingStatus.innerText = "Uploaded";

  // remove the disabled attribute from form btn & make text send
  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";
  progressContainer.style.display = "none"; // hide the box

  const { file: url } = JSON.parse(res);
  //console.log(url);
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop submission

  const url = fileURL.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  // disable the button
  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";

  // console.log(formData);
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        sharingContainer.style.display = "none"; // hide the box
        showToast("Email Sent");
        emailForm.elements["to-email"].value = ''
        emailForm.elements["from-email"].value = ''
      }
    });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  // console.log(`translate(${window.screen.width},${window.screen.width})`)
  toast.style.transform = "translate(-50%,0)"
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%,60px)"
    toast.classList.remove("show");
    toast.innerText = "Welcome";
  }, 3000);
};

const onUploadSuccess = ({ file: url }) => {
  // console.log(url)
  fileInput.value=""
  emailForm[2].removeAttribute("disabled");
  //hide the uploader after uploading
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURL.value = url
}