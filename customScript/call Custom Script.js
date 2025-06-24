let cccccc = localStorage.getItem('customScript')
// push code to the page
let script = document.createElement('script')
script.textContent = cccccc
document.body.appendChild(script)
