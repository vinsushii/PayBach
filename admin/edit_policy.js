
// Toggle to simulate admin; in production, determine this server-side.
const isAdmin = true;
const STORAGE_KEY = 'paybach:policies:v1';

const DEFAULT_POLICY = `
  <h3>Welcome to PayBach - Policies</h3>
  <p>This page explains the rules for using our auction platform. Please read carefully.</p>
  <h4>1. Listing Items</h4>
  <p>Sellers must provide honest descriptions. Prohibited items are not allowed and will be taken down accordingly.</p>
  <h4>2. Bidding & Payments</h4>
  <p>Winning bidders must complete payment within the stated timeframe. Non-payment may result in penalties.</p>
  <h4>3. Moderation & Disputes</h4>
  <p>We reserve the right to remove listings or suspend accounts that violate policies.</p>
  <p><em>These policies can be updated by administrators.</em></p>
`;


const policyView = document.getElementById('policyView');
const policyEditor = document.getElementById('policyEditor');
const editBtn = document.getElementById('editBtn');
const toolbar = document.getElementById('toolbar');
const editorActions = document.getElementById('editorActions');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const lastSaved = document.getElementById('lastSaved');
const previewToggle = document.getElementById('previewToggle');
const linkBtn = document.getElementById('linkBtn');

let editing = false;
let showSource = false;

function init(){
  if(isAdmin){ editBtn.style.display = 'inline-block'; }
  loadPolicy();
  renderPolicyView();

  editBtn.addEventListener('click', onEditToggle);
  saveBtn.addEventListener('click', onSave);
  cancelBtn.addEventListener('click', onCancel);
  deleteBtn.addEventListener('click', onReset);
  previewToggle.addEventListener('click', togglePreviewMode);

  toolbar.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-cmd]');
    if(!btn) return;
    const cmd = btn.dataset.cmd;
    document.execCommand(cmd, false, null);
    policyView.focus();
  });

  linkBtn.addEventListener('click', ()=>{
    const url = prompt('Enter or paste the URL (include https://):');
    if(url){ document.execCommand('createLink', false, url); }
  });

  document.addEventListener('keydown',(e)=>{
    if(!editing) return;
    const meta = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
    if(meta && e.key.toLowerCase() === 'b'){ e.preventDefault(); document.execCommand('bold'); }
    if(meta && e.key.toLowerCase() === 'i'){ e.preventDefault(); document.execCommand('italic'); }
  });
}

function loadPolicy(){
  const stored = localStorage.getItem(STORAGE_KEY);
  if(stored){
    try{
      const payload = JSON.parse(stored);
      policyView.innerHTML = payload.html || DEFAULT_POLICY;
      lastSaved.textContent = (new Date(payload.ts)).toLocaleString();
    }catch(e){
      policyView.innerHTML = DEFAULT_POLICY;
      lastSaved.textContent = 'corrupt data';
    }
  }else{
    policyView.innerHTML = DEFAULT_POLICY;
    lastSaved.textContent = 'never';
  }
}

function renderPolicyView(){
  if(showSource){
    policyView.style.display = 'none';
    policyEditor.style.display = 'block';
    policyEditor.value = policyView.innerHTML;
  }else{
    policyView.style.display = 'block';
    policyEditor.style.display = 'none';
  }
}

function onEditToggle(){ if(!editing) startEditing(); else stopEditing(); }

function startEditing(){
  editing = true;
  toolbar.style.display = 'flex';
  toolbar.setAttribute('aria-hidden','false');
  editorActions.style.display = 'flex';
  editorActions.setAttribute('aria-hidden','false');
  editBtn.textContent = 'Editing…';
  policyView.contentEditable = true;
  policyView.focus();
  showSource = false;
  renderPolicyView();
}

function stopEditing(){
  editing = false;
  toolbar.style.display = 'none';
  toolbar.setAttribute('aria-hidden','true');
  editorActions.style.display = 'none';
  editorActions.setAttribute('aria-hidden','true');
  editBtn.textContent = 'Edit Policies';
  policyView.contentEditable = false;
  showSource = false;
  renderPolicyView();
}

function onSave(){
  let html = policyView.innerHTML || '';
  // basic sanitization: remove <script> tags
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  const payload = { html, ts: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  lastSaved.textContent = (new Date(payload.ts)).toLocaleString();
  savePolicyToServer(payload).catch(err=>{
    console.warn('Save to server failed (okay if working local):', err);
  });
  stopEditing();
}

function onCancel(){ loadPolicy(); stopEditing(); }

function onReset(){
  if(!confirm('Reset policies to default? This will overwrite current policy.')) return;
  policyView.innerHTML = DEFAULT_POLICY;
  onSave();
}

function togglePreviewMode(){
  if(editing && !showSource){
    showSource = true;
    renderPolicyView();
  }else if(editing && showSource){
    policyView.innerHTML = policyEditor.value;
    showSource = false;
    renderPolicyView();
  }else{
    showSource = !showSource;
    renderPolicyView();
  }
}

// Initialize UI based on isAdmin
(function attachAdminUI(){
  if(isAdmin){
    editBtn.style.display = 'inline-block';
    editBtn.title = 'Edit policies (admin only)';
  }else{
    editBtn.style.display = 'none';
    toolbar.style.display = 'none';
    editorActions.style.display = 'none';
  }
})();

init();
