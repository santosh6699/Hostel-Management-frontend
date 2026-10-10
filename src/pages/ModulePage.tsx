import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, ChevronDown, CirclePlus, LoaderCircle, Pencil, Search, Trash2, X } from 'lucide-react';
import { api, errorMessage } from '../api/axiosInstance';
import { hostelApi } from '../api/hostelApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

type Kind = 'rooms'|'students'|'allocations'|'fees'|'payments'|'complaints'|'reports'|'users'|'mess'|'attendance'|'settings'|'profile'|'notifications'|'room';
type Row = Record<string, unknown>;
type Choice = {value:string;label:string};
const columns: Partial<Record<Kind, {key:string;label:string}[]>> = {
  rooms:[{key:'roomNumber',label:'Room'},{key:'block',label:'Block'},{key:'floor',label:'Floor'},{key:'roomType',label:'Type'},{key:'capacity',label:'Beds'},{key:'occupiedBeds',label:'Occupied'},{key:'availableBeds',label:'Available'},{key:'status',label:'Status'}],
  students:[{key:'studentId',label:'Student ID'},{key:'fullName',label:'Name'},{key:'department',label:'Department'},{key:'academicYear',label:'Year'},{key:'email',label:'Email'},{key:'accountStatus',label:'Status'}],
  allocations:[{key:'studentName',label:'Student'},{key:'roomLabel',label:'Room'},{key:'requestedAt',label:'Requested'},{key:'status',label:'Status'},{key:'decisionNote',label:'Decision note'}],
  fees:[{key:'studentName',label:'Student'},{key:'category',label:'Category'},{key:'billingPeriod',label:'Period'},{key:'totalAmount',label:'Total'},{key:'amountPaid',label:'Paid'},{key:'outstandingAmount',label:'Balance'},{key:'dueDate',label:'Due date'},{key:'status',label:'Status'}],
  payments:[{key:'referenceCode',label:'Receipt reference'},{key:'feeId',label:'Fee ID'},{key:'amount',label:'Amount'},{key:'method',label:'Method'},{key:'paidAt',label:'Paid at'}],
  complaints:[{key:'subject',label:'Subject'},{key:'category',label:'Category'},{key:'studentName',label:'Student'},{key:'submittedAt',label:'Submitted'},{key:'status',label:'Status'},{key:'resolutionNotes',label:'Resolution'}],
  mess:[{key:'date',label:'Date'},{key:'mealType',label:'Meal'},{key:'items',label:'Menu'},{key:'notes',label:'Notes'}],
  attendance:[{key:'date',label:'Date'},{key:'mealType',label:'Meal'},{key:'studentName',label:'Student'},{key:'status',label:'Attendance'}],
  users:[{key:'fullName',label:'Name'},{key:'email',label:'Email'},{key:'role',label:'Role'},{key:'enabled',label:'Status'}],
  notifications:[{key:'title',label:'Notification'},{key:'message',label:'Details'},{key:'createdAt',label:'Date'},{key:'read',label:'Status'}],
  profile:[{key:'fullName',label:'Name'},{key:'email',label:'Email'},{key:'role',label:'Role'},{key:'enabled',label:'Account'}],
  room:[{key:'roomNumber',label:'Room'},{key:'block',label:'Block'},{key:'floor',label:'Floor'},{key:'roomType',label:'Type'},{key:'capacity',label:'Beds'},{key:'occupiedBeds',label:'Occupied'},{key:'availableBeds',label:'Available'}],
  settings:[{key:'status',label:'API status'}],
};
const formFields: Partial<Record<Kind, {key:string;label:string;type?:string;placeholder?:string;options?:string[]}[]>> = {
  rooms:[{key:'roomNumber',label:'Room number'},{key:'block',label:'Block'},{key:'floor',label:'Floor',type:'number'},{key:'roomType',label:'Room type',options:['Single','Double','Triple','Dormitory']},{key:'capacity',label:'Bed capacity',type:'number'}],
  students:[{key:'studentId',label:'Student ID'},{key:'fullName',label:'Full name'},{key:'email',label:'Email',type:'email'},{key:'phone',label:'Phone'},{key:'department',label:'Course / department'},{key:'academicYear',label:'Academic year',type:'number'}],
  complaints:[{key:'category',label:'Category',options:['MAINTENANCE','ELECTRICITY','WATER','CLEANLINESS','ROOM','MESS']},{key:'subject',label:'Subject'},{key:'description',label:'Description',type:'textarea'}],
  allocations:[{key:'studentId',label:'Student',type:'select'},{key:'roomId',label:'Available room',type:'select'}],
  mess:[{key:'date',label:'Menu date',type:'date'},{key:'mealType',label:'Meal',options:['BREAKFAST','LUNCH','SNACKS','DINNER']},{key:'items',label:'Menu items'},{key:'notes',label:'Notes'}],
  attendance:[{key:'studentId',label:'Student',type:'select'},{key:'date',label:'Attendance date',type:'date'},{key:'mealType',label:'Meal',options:['BREAKFAST','LUNCH','SNACKS','DINNER']},{key:'status',label:'Attendance',options:['PRESENT','ABSENT']}],
  payments:[{key:'feeId',label:'Fee record',type:'select'},{key:'amount',label:'Payment amount',type:'number'},{key:'method',label:'Payment method',options:['BANK_TRANSFER','CASH','CARD','OTHER']}],
  fees:[{key:'studentId',label:'Student',type:'select'},{key:'category',label:'Fee category',options:['HOSTEL','MESS','SECURITY_DEPOSIT','OTHER']},{key:'billingPeriod',label:'Billing period',placeholder:'2026-10'},{key:'totalAmount',label:'Total amount',type:'number'},{key:'dueDate',label:'Due date',type:'date'}],
  users:[{key:'fullName',label:'Full name'},{key:'email',label:'Email',type:'email'},{key:'password',label:'Temporary password',type:'password'},{key:'role',label:'Role',options:['WARDEN','STUDENT','MESS_STAFF','ADMIN']},{key:'enabled',label:'Account status',options:['true','false']}],
};
const createLabels: Partial<Record<Kind,string>> = {rooms:'Add room',students:'Register student',complaints:'New complaint',allocations:'Request allocation',payments:'Record payment',mess:'Add menu entry',attendance:'Record attendance',fees:'Generate bill',users:'Create account'};

export function ModulePage({title,kind}:{title:string;kind:Kind}) {
  const {user}=useAuth(); const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [search,setSearch]=useState(''); const [modal,setModal]=useState(false); const [editing,setEditing]=useState<Row|null>(null); const [values,setValues]=useState<Record<string,string>>({}); const [choices,setChoices]=useState<Record<string,Choice[]>>({}); const [busy,setBusy]=useState(false); const [notice,setNotice]=useState('');
  async function load() {
    setLoading(true);setError('');
    try {
      let data: unknown;
      switch(kind) {
        case 'rooms': data=await hostelApi.rooms(); break;
        case 'students': data=await hostelApi.students(search); break;
        case 'allocations': data=await hostelApi.allocations(); break;
        case 'fees': data=await hostelApi.fees(); break;
        case 'payments': data=await hostelApi.payments(); break;
        case 'complaints': data=await hostelApi.complaints(); break;
        case 'profile': data=[await authApi.me()]; break;
        case 'room': { const [alloc,rooms]=await Promise.all([hostelApi.allocations(),hostelApi.rooms()]); const active=alloc.find(a=>a.status==='APPROVED'); data=active?rooms.filter(r=>r.id===active.roomId):[]; break; }
        case 'reports': { if(user?.role==='MESS_STAFF'){const report=(await api.get<Record<string,number>>('/mess/reports')).data;data=Object.entries(report).map(([metric,value])=>({metric,value}));}else{const stats=await hostelApi.dashboard();data=Object.entries(stats).filter(([key])=>key!=='feeCollection').map(([metric,value])=>({metric:metric.replace(/[A-Z]/g,c=>` ${c.toLowerCase()}`),value}));}break; }
        case 'notifications': data=(await api.get('/notifications')).data; break;
        case 'mess': data=(await api.get('/mess/menu')).data; break;
        case 'attendance': data=(await api.get('/mess/attendance')).data; break;
        case 'users': data=(await api.get('/users')).data; break;
        case 'settings': data=[(await api.get('/health')).data]; break;
      }
      setRows(Array.isArray(data)?data as Row[]:[]);
    } catch(err) {setError(errorMessage(err));setRows([]);} finally {setLoading(false);}
  }
  useEffect(()=>{void load();},[kind]);
  const filtered=useMemo(()=>rows.filter(row=>JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),[rows,search]);
  async function openForm(record?:Row){setEditing(record??null);setValues(record?Object.fromEntries((formFields[kind]??[]).map(field=>[field.key,String(record[field.key]??'')])):{});setChoices({});setModal(true);try{if(['allocations','fees','attendance'].includes(kind)){const students=kind==='attendance'?(await api.get<{id:number;studentId:string;fullName:string}[]>('/mess/students')).data:await hostelApi.students();setChoices(current=>({...current,studentId:students.map(student=>({value:String(student.id),label:`${student.fullName} · ${student.studentId}`}))}));}if(kind==='allocations'){const available=(await hostelApi.rooms()).filter(room=>room.availableBeds>0);setChoices(current=>({...current,roomId:available.map(room=>({value:String(room.id),label:`${room.block} · ${room.roomNumber} (${room.availableBeds} available)`}))}));}if(kind==='payments'){const outstanding=(await hostelApi.fees()).filter(fee=>fee.outstandingAmount>0);setChoices(current=>({...current,feeId:outstanding.map(fee=>({value:String(fee.id),label:`${fee.studentName} · ${fee.category} · $${fee.outstandingAmount.toFixed(2)} due`}))}));}}catch(err){setNotice(errorMessage(err));}}
  async function submit(event:FormEvent<HTMLFormElement>) {event.preventDefault();setBusy(true);setNotice('');try{
    if(kind==='rooms'){const body={roomNumber:values.roomNumber,block:values.block,floor:Number(values.floor),roomType:values.roomType,capacity:Number(values.capacity)};if(editing)await hostelApi.updateRoom(Number(editing.id),body);else await hostelApi.createRoom(body);}
    else if(kind==='students'){const body={studentId:values.studentId,fullName:values.fullName,email:values.email,phone:values.phone,department:values.department,academicYear:Number(values.academicYear)};if(editing)await hostelApi.updateStudent(Number(editing.id),body);else await hostelApi.createStudent(body);}
    else if(kind==='users'&&editing)await hostelApi.updateUser(Number(editing.id),{fullName:values.fullName,role:values.role,enabled:values.enabled==='true'});
    else if(kind==='mess'&&editing)await api.put(`/mess/menu/${String(editing.id)}`,values);
    else if(kind==='complaints')await hostelApi.createComplaint(values.category,values.subject,values.description);
    else if(kind==='allocations')await hostelApi.requestAllocation(Number(values.studentId),Number(values.roomId));
    else if(kind==='payments')await hostelApi.recordPayment(Number(values.feeId),Number(values.amount),values.method);
    else if(kind==='mess')await api.post('/mess/menu',values);
    else if(kind==='attendance')await api.post('/mess/attendance',{...values,studentId:Number(values.studentId)});
    else if(kind==='fees')await hostelApi.createFee({studentId:Number(values.studentId),category:values.category,billingPeriod:values.billingPeriod,totalAmount:Number(values.totalAmount),dueDate:values.dueDate});
    else if(kind==='users')await hostelApi.createUser({email:values.email,fullName:values.fullName,password:values.password,role:values.role});
    setModal(false);setEditing(null);setValues({});setNotice('Saved successfully.');await load();
  }catch(err){setNotice(errorMessage(err));}finally{setBusy(false);}}
  async function decide(id:number,approved:boolean){try{await hostelApi.decideAllocation(id,approved);await load();}catch(err){setError(errorMessage(err));}}
  async function resolveComplaint(row:Row){const next=window.prompt('Resolution notes (optional):');if(next===null)return;try{await hostelApi.updateComplaint(Number(row.id),'RESOLVED',next);await load();}catch(err){setError(errorMessage(err));}}
  const hasCreate=Boolean(createLabels[kind])&&(user?.role==='ADMIN'||kind==='complaints'&&user?.role==='STUDENT'||kind==='allocations'||(kind==='mess'||kind==='attendance')&&user?.role==='MESS_STAFF');
  const visibleColumns=columns[kind]??(kind==='reports'?[{key:'metric',label:'Metric'},{key:'value',label:'Current value'}]:[]);
  return <section className="module-page">
    <div className="module-heading"><div><span className="eyebrow">CAMPUS OPERATIONS</span><h1>{title}</h1><p>{description(kind)}</p></div>{hasCreate&&<button className="primary-btn" onClick={()=>openForm()}><CirclePlus size={17}/>{createLabels[kind]}</button>}</div>
    {notice&&<div className="inline-notice"><Check size={16}/>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {kind!=='reports'&&kind!=='profile'&&kind!=='room'&&kind!=='settings'&&<div className="table-toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search records" placeholder="Search records…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')} aria-label="Clear search"><X size={14}/></button>}</div><button className="filter-select">All records <ChevronDown size={15}/></button><span className="record-count">{filtered.length} {filtered.length===1?'record':'records'}</span></div>}
    {error&&<div className="error-banner" role="alert"><span>{error}</span><button className="secondary-btn" onClick={()=>void load()}>Retry</button></div>}
    <div className="table-panel">{loading?<div className="loading-panel"><span className="spinner"/> Loading live data…</div>:error?<div className="empty-state"><span className="empty-icon">!</span><h2>Data could not be loaded</h2><p>Check the backend connection and your account permissions, then retry.</p><button className="secondary-btn" onClick={()=>void load()}>Retry</button></div>:filtered.length===0?<div className="empty-state"><span className="empty-icon">⌕</span><h2>{search?'No matching records':'Nothing here yet'}</h2><p>{search?'Try a different search term.':'Records will appear here once available from the hostel system.'}</p>{hasCreate&&<button className="secondary-btn" onClick={()=>setModal(true)}><CirclePlus size={15}/>{createLabels[kind]}</button>}</div>:<div className="table-scroll"><table>
      <thead>
        <tr>
          {visibleColumns.map(col=><th key={col.key}>{col.label}</th>)}
          {['allocations','complaints','notifications','rooms','students','users','mess'].includes(kind)&&<th className="action-head">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row,index)=><tr key={String(row.id??index)}>
          {visibleColumns.map(col=><td key={col.key}>{renderValue(col.key,row[col.key])}</td>)}
          {kind==='allocations'&&row.status==='PENDING'&&user?.role!=='STUDENT'&&<td><div className="row-actions"><button className="approve-btn" onClick={()=>void decide(Number(row.id),true)} aria-label="Approve allocation"><Check size={15}/> Approve</button><button className="reject-btn" onClick={()=>void decide(Number(row.id),false)}>Reject</button></div></td>}
          {kind==='complaints'&&!['RESOLVED','REJECTED'].includes(String(row.status))&&user?.role!=='STUDENT'&&<td><button className="approve-btn" onClick={()=>void resolveComplaint(row)}>Resolve</button></td>}
          {kind==='notifications'&&!row.read&&<td><button className="approve-btn" onClick={async()=>{try{await api.put(`/notifications/${String(row.id)}/read`);await load();}catch(err){setError(errorMessage(err));}}}>Mark read</button></td>}
          {['rooms','students','users','mess'].includes(kind)&&<td><div className="row-actions"><button className="row-icon-btn" onClick={()=>openForm(row)} aria-label={`Edit ${kind} record`}><Pencil size={14}/></button>{(kind==='rooms'||kind==='mess')&&<button className="row-icon-btn danger" onClick={async()=>{if(!window.confirm('Delete this record?'))return;try{if(kind==='rooms')await hostelApi.deleteRoom(Number(row.id));else await api.delete(`/mess/menu/${String(row.id)}`);await load();}catch(err){setError(errorMessage(err));}}} aria-label={`Delete ${kind} record`}><Trash2 size={14}/></button>}</div></td>}
        </tr>)}
      </tbody>
    </table></div>}</div>
    {kind==='payments'&&user?.role==='STUDENT'&&<p className="module-footnote">Payments are recorded by the hostel office against a fee record.</p>}
    {modal&&<div className="modal-backdrop" role="presentation" onClick={()=>!busy&&setModal(false)}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">HOSTEL RECORD</span><h2 id="modal-title">{editing?`Edit ${title.toLowerCase()}`:createLabels[kind]}</h2></div><button className="icon-btn" onClick={()=>{setModal(false);setEditing(null);}} aria-label="Close dialog"><X size={19}/></button></div><form className="modal-form" onSubmit={submit}><div className="modal-fields">{(formFields[kind]??[]).filter(field=>!(kind==='allocations'&&field.key==='studentId'&&user?.role==='STUDENT')&&!(editing&&kind==='users'&&['email','password'].includes(field.key))).map(field=><label key={field.key} className={field.type==='textarea'||field.key==='items'?'span-two':''}>{field.label}{field.options?<select required value={values[field.key]??field.options[0]} onChange={e=>setValues({...values,[field.key]:e.target.value})}>{field.options.map(option=><option key={option}>{option}</option>)}</select>:field.type==='select'?<select required value={values[field.key]??''} onChange={e=>setValues({...values,[field.key]:e.target.value})}><option value="" disabled>Select {field.label.toLowerCase()}</option>{(choices[field.key]??[]).map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:field.type==='textarea'?<textarea rows={4} required value={values[field.key]??''} onChange={e=>setValues({...values,[field.key]:e.target.value})}/>:<input type={field.type??'text'} required value={values[field.key]??''} placeholder={field.placeholder} onChange={e=>setValues({...values,[field.key]:e.target.value})}/>}</label>)}</div>{notice&&<p className="form-error">{notice}</p>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>{setModal(false);setEditing(null);}}>Cancel</button><button disabled={busy} className="primary-btn">{busy?<><LoaderCircle className="spin" size={16}/> Saving…</>:<>Save record <ArrowUpRight size={16}/></>}</button></div></form></section></div>}
  </section>;
}
function description(kind:Kind){const copy:Partial<Record<Kind,string>>={rooms:'Manage room inventory, capacity and vacancy across your hostel.',students:'Browse and maintain the resident student directory.',allocations:'Review room requests and keep assignments moving.',fees:'Track resident billing, balances and due dates.',payments:'A clear record of payments received against student bills.',complaints:'Follow up on resident concerns and close the loop.',reports:'Live operational figures calculated by the hostel API.',users:'Accounts and role access for hostel staff and residents.',mess:'Plan meals and publish this week’s menu.',attendance:'Record and review meal attendance.',profile:'Your sign-in identity and account information.',notifications:'Updates from your hostel management team.',room:'Your current room assignment and allocation status.',settings:'Application health and environment information.'};return copy[kind]??'Hostel management workspace.';}
function renderValue(key:string,value:unknown){if(value===undefined||value===null||value==='')return <span className="muted">—</span>;if(key==='status'||key==='accountStatus'||key==='role')return <span className={`status-pill status-${String(value).toLowerCase()}`}>{String(value).replace(/_/g,' ')}</span>;if(['totalAmount','amountPaid','outstandingAmount','amount'].includes(key)&&typeof value==='number')return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);if(typeof value==='boolean')return <span className={`status-pill ${value?'status-approved':'status-rejected'}`}>{value?'Active':'Disabled'}</span>;if(key==='description')return <span className="cell-description" title={String(value)}>{String(value)}</span>;return String(value);}
