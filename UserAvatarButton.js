// inject-avatar-workaround-ui-improved.js
const LOCAL_AVATAR_PATH = '/web/avatars/';
const LIST_JSON = '/web/avatars/list.json';

// ---- Datei-Liste laden ----
async function loadFilesList() {
  try {
    const res = await fetch(LIST_JSON + '?_=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error('list.json nicht gefunden ' + res.status);
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
    } catch (e) {}
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length) return lines;
    throw new Error('list.json leer/ungültig');
  } catch (e) {
    console.warn('avatars: list.json nicht geladen:', e.message);
    return ['010.gif','011.gif','012.gif','013.gif']; // fallback
  }
}

// ---- Upload-Helfer ----
function setInputFilesAndTrigger(openerDoc, fileObj) {
  try {
    const inputEl = openerDoc.querySelector('#uploadImage[type="file"]');
    if (!inputEl) return false;
    const dt = new DataTransfer();
    dt.items.add(fileObj);
    inputEl.files = dt.files;
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  } catch (e) { console.error(e); return false; }
}

async function fetchBlobAsFile(url, filename) {
  const resp = await fetch(url, { cache: 'force-cache' });
  if (!resp.ok) throw new Error('Bild konnte nicht geladen werden: ' + resp.status);
  const blob = await resp.blob();
  let type = blob.type || '';
  if (!type) {
    if (filename.match(/\.gif$/i)) type = 'image/gif';
    else if (filename.match(/\.png$/i)) type = 'image/png';
    else if (filename.match(/\.jpe?g$/i)) type = 'image/jpeg';
    else type = 'application/octet-stream';
  }
  return new File([blob], filename, { type });
}

// ---- Modal erzeugen ----
function createModal(files) {
  const doc = window.document;
  if (doc.getElementById('jfa-avatar-modal')) return;

  const modal = doc.createElement('div');
  modal.id = 'jfa-avatar-modal';
  Object.assign(modal.style,{
    position:'fixed', inset:'0', zIndex:'99999',
    display:'flex', alignItems:'center', justifyContent:'center',
    backdropFilter:'blur(4px)', background:'rgba(0,0,0,0.6)'
  });

  const panel = doc.createElement('div');
  Object.assign(panel.style,{
    width:'min(980px,96%)', maxHeight:'86vh', overflow:'auto',
    borderRadius:'12px', padding:'16px', background:'#111316',
    color:'#e6eef6', boxShadow:'0 6px 30px rgba(0,0,0,0.6)'
  });
  modal.appendChild(panel);

  const hdr = doc.createElement('div');
  Object.assign(hdr.style,{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'});
  const title = doc.createElement('div'); title.textContent='Avatar-Auswahl'; title.style.fontSize='18px'; title.style.fontWeight='600';
  const closeBtn = doc.createElement('button'); closeBtn.innerText='✕'; Object.assign(closeBtn.style,{background:'transparent',border:0,color:'#cfe6ff',cursor:'pointer',fontSize:'18px'}); closeBtn.onclick=()=>modal.remove();
  hdr.appendChild(title); hdr.appendChild(closeBtn); panel.appendChild(hdr);

  const grid = doc.createElement('div'); Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(84px,1fr))',gap:'10px'}); panel.appendChild(grid);

  files.forEach(fn=>{
    const card = doc.createElement('div');
    Object.assign(card.style,{background:'#0f1112',borderRadius:'8px',padding:'8px',textAlign:'center',cursor:'pointer',transition:'transform .12s, box-shadow .12s'});
    card.onmouseover=()=>{card.style.transform='translateY(-4px)'; card.style.boxShadow='0 8px 20px rgba(0,0,0,0.6)';};
    card.onmouseout=()=>{card.style.transform='none'; card.style.boxShadow='none';};

    const img=doc.createElement('img'); img.src=LOCAL_AVATAR_PATH+fn; img.alt=fn; Object.assign(img.style,{width:'64px',height:'64px',borderRadius:'50%',objectFit:'cover',display:'block',margin:'0 auto 6px'});
    img.onerror=()=>{ img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#222" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="#666">kein Bild</text></svg>'); };

    card.appendChild(img);
    card.onclick=async()=>{
  try{
    const file=await fetchBlobAsFile(LOCAL_AVATAR_PATH+fn,fn);
    const ok=setInputFilesAndTrigger(window.document,file);
    if(!ok) throw new Error('upload input set failed');
    // Kein Klick mehr auf #btnAddImage → kein zusätzliches Upload-Fenster
    setTimeout(()=>{ try{ location.reload(); }catch(e){} },700);
    modal.remove();
   }catch(e){ console.error('avatars: Auswahl-Fehler', e); modal.remove();}
};

    grid.appendChild(card);
  });

  doc.body.appendChild(modal);
}

// ---- Button einfügen ----
function insertAvatarButton() {
  const deleteBtn = document.querySelector('#btnDeleteImage');
  if(!deleteBtn) return;
  const columnContainer = deleteBtn.parentNode;
  if(columnContainer.querySelector('#avatarBtn')) return;

  const avatarBtn = document.createElement('button');
  avatarBtn.id='avatarBtn'; avatarBtn.className='emby-button raised';
  avatarBtn.style.marginTop='6px'; avatarBtn.style.display='block'; avatarBtn.style.minWidth='120px'; avatarBtn.type='button';
  avatarBtn.innerText='Avatar'; columnContainer.appendChild(avatarBtn);

  avatarBtn.addEventListener('click', async()=>{
    const files = await loadFilesList();
    if(!files.length){ console.warn('avatars: Keine Avatare'); return;}
    createModal(files); // immer Modal, kein Popup
  });
}

// ---- MutationObserver ----
const observer = new MutationObserver(()=>{ insertAvatarButton(); });
observer.observe(document.body,{childList:true,subtree:true});
setTimeout(insertAvatarButton,800);
insertAvatarButton();
