(function(){
'use strict';
const $=id=>document.getElementById(id), db=window.supabaseClient;
const state={user:null,items:[],active:null,filter:'all',query:'',channel:null,agent:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){$('supportToast').textContent=s;$('supportToast').classList.add('show');setTimeout(()=>$('supportToast').classList.remove('show'),2800)}
function fmt(s){return s?new Date(s).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):''}
function initials(s){return String(s||'T').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
async function loadList(){
 let q=db.from('support_conversations').select('id,customer_id,subject,status,created_at,updated_at,last_message_at').order('last_message_at',{ascending:false,nullsFirst:false});
 const {data,error}=await q; if(error) throw error; state.items=data||[]; renderList();
}
function renderList(){const q=state.query.toLowerCase();const rows=state.items.filter(x=>(state.filter==='all'||x.status===state.filter)&&(!q||String(x.subject||'').toLowerCase().includes(q)));
 $('supportList').innerHTML=rows.length?rows.map(x=>`<button class="support-list-item ${x.id===state.active?'selected':''}" data-support-id="${esc(x.id)}"><span class="support-ticket-avatar">${esc(initials(x.subject||'Support'))}</span><span class="support-ticket-copy"><strong>${esc(x.subject||'Support request')}</strong><small>${esc(x.status==='closed'?'Closed':'Open')} · ${esc(fmt(x.last_message_at||x.created_at))}</small></span><span class="support-ticket-arrow">›</span></button>`).join(''):'<p class="support-muted">No support requests found.</p>';
}
async function start(){const subject=prompt('What do you need help with?','General support');if(subject===null)return;const clean=subject.trim();if(!clean){toast('Please enter a short subject.');return}
 const {data,error}=await db.rpc('start_support_conversation',{p_subject:clean});if(error){toast(error.message||'Could not start support chat.');return}await loadList();await open(data);
}
async function open(id){state.active=id;const item=state.items.find(x=>x.id===id);if(!item)return;renderList();$('supportEmpty').hidden=true;$('supportChat').hidden=false;$('supportChatTitle').textContent=item.subject||'TIME2INCOME Support';$('supportTicketStatus').textContent=item.status==='closed'?'Closed':'Open';$('supportMessageInput').disabled=item.status==='closed';$('supportSend').disabled=item.status==='closed';
 await loadMessages();if(state.channel)db.removeChannel(state.channel);state.channel=db.channel('support-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'support_messages',filter:'conversation_id=eq.'+id},payload=>{if(payload.new.sender_id!==state.user.id)loadMessages()}).subscribe();
}
async function loadMessages(){if(!state.active)return;const {data,error}=await db.from('support_messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',state.active).order('created_at',{ascending:true}).limit(200);if(error){toast('Could not load messages.');return}
 $('supportMessages').innerHTML=(data||[]).map(m=>`<article class="support-message ${m.sender_id===state.user.id?'mine':'theirs'}"><p>${esc(m.body)}</p><time>${esc(fmt(m.created_at))}${m.sender_id===state.user.id?' · You':''}</time></article>`).join('')||'<p class="support-muted support-first-message">Send a message and our team will get back to you.</p>';$('supportMessages').scrollTop=$('supportMessages').scrollHeight;
}
async function send(e){e.preventDefault();const body=$('supportMessageInput').value.trim();if(!body||!state.active)return;$('supportSend').disabled=true;const {error}=await db.from('support_messages').insert({conversation_id:state.active,sender_id:state.user.id,body});$('supportSend').disabled=false;if(error){toast(error.message||'Message could not be sent.');return}$('supportMessageInput').value='';await loadMessages();await loadList();}
async function init(){if(!db){toast('Messaging service unavailable.');return}const {data}=await db.auth.getSession();if(!data.session){location.href='auth.html?mode=signin';return}state.user=data.session.user;state.agent=['support','admin'].includes(state.user.app_metadata?.role)||state.user.app_metadata?.support_agent===true;
 try{await loadList();}catch(e){$('supportList').innerHTML='<p class="support-muted">Support chat is not configured yet. Apply the included Supabase migration, then reload.</p>';return}
 const wanted=new URLSearchParams(location.search).get('id');if(wanted&&state.items.some(x=>x.id===wanted))open(wanted);
}
$('supportNew').addEventListener('click',start);$('supportStart').addEventListener('click',start);$('supportComposer').addEventListener('submit',send);$('supportList').addEventListener('click',e=>{const b=e.target.closest('[data-support-id]');if(b)open(b.dataset.supportId)});$('supportSearch').addEventListener('input',e=>{state.query=e.target.value;renderList()});document.querySelectorAll('[data-support-filter]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.supportFilter;document.querySelectorAll('[data-support-filter]').forEach(x=>x.classList.toggle('active',x===b));renderList()}));init();
})();