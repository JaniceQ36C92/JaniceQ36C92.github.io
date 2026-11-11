import { CRITERIA, estimateTco, weightedScore, sanitizeRecord, safeHttpsUrl, csvCell } from "./scoring.js";

const STORAGE_KEY = "scouthq.software-scorecard.v1";
const MAX_ITEMS = 300;
const MAX_BACKUP_BYTES = 1200000;
const $ = (id) => document.getElementById(id);
const form = $("software-form");
const tbody = $("comparison-rows");

let records = readRecords();
let editingId = null;

function uid() {
  return globalThis.crypto?.randomUUID?.() || "sw-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}
function notify(id, message) { $(id).textContent = message; }
function textNode(tag, value, className) {
  const node = document.createElement(tag);
  node.textContent = String(value ?? "");
  if (className) node.className = className;
  return node;
}
function amount(value) {
  return new Intl.NumberFormat("en-US", {style:"currency",currency:"USD",maximumFractionDigits:2}).format(value);
}
function displayDate(value) { return value || "Not recorded"; }
function readRecords() {
  try {
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    if(!Array.isArray(raw)) return [];
    const seen=new Set();
    return raw.slice(0,MAX_ITEMS).map(sanitizeRecord).filter(Boolean).map((record)=>{
      record.id=record.id || uid();
      if(seen.has(record.id)) record.id=uid();
      seen.add(record.id);
      return record;
    });
  } catch { return []; }
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(records));
    notify("storage-status","Changes saved only in this browser profile.");
    return true;
  } catch {
    notify("storage-status","Local storage is unavailable or full. Export a JSON backup before closing the page.");
    return false;
  }
}
function ratingOptions(){
  for(const criterion of CRITERIA) {
    const group = document.createElement("div");
    group.className="rate-field";
    const label=document.createElement("label");
    const id="rating-"+criterion.key;
    label.htmlFor=id;
    label.append(textNode("span",criterion.label),textNode("span",Math.round(criterion.weight*100)+"%","weight"));
    group.append(label);
    const select=document.createElement("select");
    select.id=id;
    select.name=id;
    const values=[["0","Not assessed"],["1","1 - Weak"],["2","2 - Limited"],["3","3 - Adequate"],["4","4 - Good"],["5","5 - Strong"]];
    for(const [value,title] of values){
      const option=document.createElement("option");
      option.value=value;
      option.textContent=title;
      select.append(option);
    }
    group.append(select);
    $("rating-fields").append(group);
  }
}
function horizon() {
  const months=Number($("months").value);
  return Number.isInteger(months)&&months>=1&&months<=60?months:null;
}
function scored(record) { return weightedScore(record.ratings); }
function tco(record) {
  if(!record.costKnown) return null;
  const months=horizon();
  if(months===null) return null;
  try {
    return estimateTco({monthlyPerUser:record.monthlyPerUser,users:record.seats,monthlyPlatform:record.monthlyPlatform,setupCost:record.setupCost,months});
  } catch { return null; }
}
function tableCell(row,value) {
  const td=textNode("td",value);
  row.append(td);
  return td;
}
function renderRow(record) {
  const tr=document.createElement("tr");
  const first=tableCell(tr,"");
  first.append(textNode("div",record.name,"product-name"),textNode("div",record.vendor || "Vendor not recorded","subtext"));
  tableCell(tr,record.category || "Unspecified");
  const value=scored(record);
  const cell=tableCell(tr,"");
  cell.append(textNode("span",value.complete?value.score.toFixed(1)+"/100":"Unrated",value.complete?"score-chip":"score-chip chip-muted"));
  if(!value.complete) cell.append(textNode("div","Check all five criteria","subtext"));
  const estimate=tco(record);
  const cost=tableCell(tr,"");
  if(estimate===null) cost.append(textNode("div",record.costKnown?"Check inputs / horizon":"Cost not verified","subtext"));
  else {
    cost.append(textNode("div",amount(estimate.total),"est"));
    cost.append(textNode("div",amount(estimate.monthly)+"/month before one-time fees","subtext"));
  }
  tableCell(tr,displayDate(record.lastChecked));
  const source=tableCell(tr,"");
  const url=safeHttpsUrl(record.sourceUrl);
  if(url) {
    const link=textNode("a","Vendor source ↗");
    link.href=url;
    link.target="_blank";
    link.rel="noopener noreferrer";
    source.append(link);
  } else source.textContent="Not recorded";
  const actions=tableCell(tr,"");
  const edit=textNode("button","Edit","small-btn");
  edit.type="button";
  edit.addEventListener("click",()=>editRecord(record.id));
  const del=textNode("button","Delete","small-btn");
  del.type="button";
  del.addEventListener("click",()=>deleteRecord(record.id));
  actions.append(edit,del);
  tbody.append(tr);
}
function render() {
  const search=$("search").value.toLowerCase().trim();
  const category=$("category-filter").value;
  const sort=$("sort").value;
  const list=records.filter((r)=>{
    const matchesText=(r.name+" "+r.vendor+" "+r.category+" "+r.notes).toLowerCase().includes(search);
    return matchesText&&(!category||r.category===category);
  });
  list.sort((a,b)=>{
    if(sort==="name") return a.name.localeCompare(b.name);
    if(sort==="cost"){
      const at=tco(a)?.total ?? Infinity;
      const bt=tco(b)?.total ?? Infinity;
      return (at-bt)||a.name.localeCompare(b.name);
    }
    const as=scored(a).score??-1;
    const bs=scored(b).score??-1;
    return (bs-as)||a.name.localeCompare(b.name);
  });
  tbody.replaceChildren();
  for(const item of list) renderRow(item);
  $("empty-state").hidden=list.length>0;
  $("saved-count").textContent=String(records.length);
  $("rated-count").textContent=String(records.filter(r=>scored(r).complete).length);
  $("cost-count").textContent=String(records.filter(r=>tco(r)!==null).length);
  const current=horizon();
  $("tco-header").textContent=current===null?"Estimated TCO":"Estimated "+current+"-mo TCO";
}
function resetForm(){
  form.reset();
  editingId=null;
  $("editor-title").textContent="Add a software option";
  $("save-button").textContent="Save software";
  $("cancel-button").hidden=true;
  notify("form-status","");
}
function formData(){
  const raw={
    name:$("software-name").value,
    vendor:$("vendor").value,
    category:$("category").value,
    sourceUrl:$("source-url").value,
    lastChecked:$("checked").value,
    monthlyPerUser:$("monthly-per-user").value,
    seats:$("seats").value,
    monthlyPlatform:$("monthly-platform").value,
    setupCost:$("setup-cost").value,
    costKnown:$("cost-known").checked,
    notes:$("notes").value,
    ratings:{}
  };
  for(const c of CRITERIA) raw.ratings[c.key]=Number($("rating-"+c.key).value);
  return raw;
}
function saveRecord(event){
  event.preventDefault();
  if(!form.reportValidity()) return;
  const input=formData();
  const rawUrl=String(input.sourceUrl||"").trim();
  if(rawUrl&&!safeHttpsUrl(rawUrl)) {
    notify("form-status","Use an official http:// or https:// URL for the vendor source.");
    return;
  }
  try {
    estimateTco({...input,months:12});
  } catch(error){
    notify("form-status","Please correct the cost inputs: "+error.message);
    return;
  }
  const cleaned=sanitizeRecord(input);
  if(!cleaned){notify("form-status","Software name is required.");return;}
  if(!editingId && records.length>=MAX_ITEMS){
    notify("form-status","This browser tool supports up to "+MAX_ITEMS+" saved options. Export and archive older research before adding more.");
    return;
  }
  cleaned.id=editingId || uid();
  const before=records.slice();
  if(editingId) records=records.map(r=>r.id===editingId?cleaned:r);
  else records.push(cleaned);
  if(!persist()){records=before;return;}
  resetForm();
  render();
  notify("form-status","Software option saved in this browser.");
}
function editRecord(id){
  const record=records.find(r=>r.id===id);
  if(!record)return;
  editingId=id;
  const ids={
    name:"software-name", vendor:"vendor",category:"category",sourceUrl:"source-url",
    lastChecked:"checked",monthlyPerUser:"monthly-per-user",seats:"seats",
    monthlyPlatform:"monthly-platform",setupCost:"setup-cost",notes:"notes"
  };
  for(const [key,elementId] of Object.entries(ids)) $(elementId).value=record[key]??"";
  $("cost-known").checked=record.costKnown;
  for(const c of CRITERIA) $("rating-"+c.key).value=record.ratings[c.key]||0;
  $("editor-title").textContent="Edit "+record.name;
  $("save-button").textContent="Update software";
  $("cancel-button").hidden=false;
  notify("form-status","Editing the saved record. Your changes are not stored until you select Update.");
  form.scrollIntoView({behavior:"smooth",block:"start"});
}
function deleteRecord(id){
  const r=records.find(x=>x.id===id);
  if(!r||!confirm("Remove "+r.name+" from this browser? Export a backup first if needed.")) return;
  const previous=records;
  records=records.filter(x=>x.id!==id);
  if(!persist()){records=previous;return;}
  if(editingId===id)resetForm();
  render();
}
function download(name,body,mime) {
  const objectUrl=URL.createObjectURL(new Blob([body],{type:mime}));
  const a=document.createElement("a");
  a.href=objectUrl;
  a.download=name;
  a.style.display="none";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
}
function exportCsv(){
  const columns=["name","vendor","category","sourceUrl","lastChecked","costKnown","monthlyPerUser","seats","monthlyPlatform","setupCost",...CRITERIA.map(c=>c.key),"weightedScore","estimatedTcoUsd","notes"];
  const rows=[columns.map(csvCell).join(",")];
  for(const r of records){
    const s=scored(r);
    const estimate=tco(r);
    const values=columns.map(k=>{
      if(k==="weightedScore")return s.score===null?"Unrated":s.score;
      if(k==="estimatedTcoUsd")return estimate===null?"Not verified":estimate.total;
      if(k==="costKnown")return r.costKnown?"Yes":"No";
      if(CRITERIA.some(c=>c.key===k))return r.ratings[k];
      return r[k];
    });
    rows.push(values.map(csvCell).join(","));
  }
  download("software-comparison-scorecard.csv",rows.join("\r\n"),"text/csv;charset=utf-8");
}
function exportJson(){
  download("software-comparison-scorecard-backup.json",JSON.stringify({
    format:"scouthq-software-comparison",version:1,exportedAt:new Date().toISOString(),records
  },null,2),"application/json");
}
async function importJson(event) {
  const file=event.target.files?.[0];
  if(!file)return;
  try{
    if(file.size>MAX_BACKUP_BYTES)throw new Error("Backup is too large (limit 1.2 MB).");
    const parsed=JSON.parse(await file.text());
    if(parsed?.format && parsed.format!=="scouthq-software-comparison")throw new Error("This is not a software scorecard backup.");
    const data=Array.isArray(parsed)?parsed:parsed?.records;
    if(!Array.isArray(data)||data.length>MAX_ITEMS)throw new Error("The backup must contain a list of up to "+MAX_ITEMS+" software records.");
    const normalized=data.map(sanitizeRecord).filter(Boolean);
    if(normalized.length!==data.length)throw new Error("One or more entries are invalid. No records were imported.");
    if(!confirm("Import "+normalized.length+" records? Records with matching IDs will be replaced."))return;
    const before=records.slice();
    const map=new Map(records.map(r=>[r.id,r]));
    for(const entry of normalized){
      entry.id=entry.id || uid();
      map.set(entry.id,entry);
    }
    if(map.size>MAX_ITEMS)throw new Error("Import would exceed the "+MAX_ITEMS+"-record limit.");
    records=[...map.values()];
    if(!persist()){records=before;return;}
    resetForm();
    render();
    notify("storage-status","Imported "+normalized.length+" records. Review vendor details before using them.");
  }catch(error){
    notify("storage-status","Import failed: "+error.message);
  }finally{
    event.target.value="";
  }
}
function clearAll(){
  if(records.length===0)return;
  if(!confirm("Permanently delete ALL software records from this browser? Export a backup first if needed."))return;
  const before=records;
  records=[];
  if(!persist()){records=before;return;}
  resetForm();
  render();
  notify("storage-status","All locally saved software options were cleared.");
}
ratingOptions();
form.addEventListener("submit",saveRecord);
$("cancel-button").addEventListener("click",resetForm);
$("search").addEventListener("input",render);
$("category-filter").addEventListener("change",render);
$("sort").addEventListener("change",render);
$("months").addEventListener("input",render);
$("export-csv").addEventListener("click",exportCsv);
$("export-json").addEventListener("click",exportJson);
$("import-json").addEventListener("change",importJson);
$("clear-all").addEventListener("click",clearAll);
render();
