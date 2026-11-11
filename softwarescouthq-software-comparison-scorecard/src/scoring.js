/** Deterministic, dependency-free helpers for manual software evaluation. */
export const CRITERIA = Object.freeze([
  Object.freeze({key:"features",label:"Feature fit",weight:0.30}),
  Object.freeze({key:"security",label:"Security & privacy",weight:0.25}),
  Object.freeze({key:"usability",label:"Usability",weight:0.15}),
  Object.freeze({key:"integrations",label:"Integrations",weight:0.15}),
  Object.freeze({key:"support",label:"Support",weight:0.15})
]);

function validNonNegative(value,label) {
  if (value === "" || value === undefined || value === null) {
    throw new RangeError(label + " is required. Enter 0 only when you know that it is zero.");
  }
  const n=Number(value);
  if (!Number.isFinite(n) || n<0) throw new RangeError(label + " must be a finite, non-negative number.");
  return n;
}

/** All cost inputs use USD. Compare the same usage assumptions and horizon. */
export function estimateTco({monthlyPerUser,users,monthlyPlatform,setupCost,months}) {
  const perUser=validNonNegative(monthlyPerUser,"Monthly price per user");
  const seatCount=validNonNegative(users,"Seats");
  const platform=validNonNegative(monthlyPlatform,"Other monthly costs");
  const setup=validNonNegative(setupCost,"One-time costs");
  const horizon=Number(months);
  if(!Number.isInteger(seatCount) || seatCount<1 || seatCount>100000) throw new RangeError("Seats must be a whole number between 1 and 100,000.");
  if(!Number.isInteger(horizon) || horizon<1 || horizon>60) throw new RangeError("Comparison horizon must be a whole number from 1 to 60 months.");
  const monthly=perUser*seatCount+platform;
  const total=monthly*horizon+setup;
  if (!Number.isFinite(total) || !Number.isFinite(monthly)) throw new RangeError("Costs are too large to calculate.");
  return {monthly,total,months:horizon};
}

/**
 * Score is null while ANY criterion is unassessed.
 * A rating of 1 is 20/100, and 5 is 100/100; 0 means not assessed.
 */
export function weightedScore(ratings={}) {
  const normalized={};
  const missing=[];
  for(const criterion of CRITERIA){
    const v=Number(ratings[criterion.key]);
    if(!Number.isInteger(v)||v<1||v>5) missing.push(criterion.key);
    else normalized[criterion.key]=v;
  }
  if(missing.length) return {score:null,missing,complete:false};
  const value=CRITERIA.reduce((sum,c)=>sum+normalized[c.key]*c.weight,0);
  return {score:Math.round(value/5*1000)/10,missing:[],complete:true};
}

export function safeHttpsUrl(raw) {
  if(raw==null||String(raw).trim()==="") return "";
  try {
    const url=new URL(String(raw).trim());
    return url.protocol==="https:"||url.protocol==="http:" ? url.href : "";
  } catch { return ""; }
}

function safeText(raw,max=500) {
  return String(raw==null?"":raw).replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max);
}

/** Coerces untrusted imported backup data into the public tool's simple record schema. */
export function sanitizeRecord(raw) {
  if(!raw||typeof raw!=="object"||Array.isArray(raw)) return null;
  const name=safeText(raw.name,140);
  if(!name) return null;
  const costFields=["monthlyPerUser","seats","monthlyPlatform","setupCost"];
  const validCostFields=costFields.every(key=>{
    const value=raw[key];
    const number=Number(value);
    return value!=="" && value!==null && value!==undefined && Number.isFinite(number) && number>=0 && number<=1e9;
  });
  const costKnown=raw.costKnown===true && validCostFields;
  const originalRatings=(raw.ratings&&typeof raw.ratings==="object")?raw.ratings:{};
  const ratings={};
  for(const c of CRITERIA) {
    const n=Number(originalRatings[c.key]);
    ratings[c.key]=Number.isInteger(n)&&n>=1&&n<=5?n:0;
  }
  const numeric=(value,defaultValue)=> {
    const n=Number(value);
    return value!==""&&value!=null&&Number.isFinite(n)&&n>=0&&n<=1e9?n:defaultValue;
  };
  const seats=numeric(raw.seats,1);
  const sourceUrl=safeHttpsUrl(raw.sourceUrl);
  return {
    id: safeText(raw.id,100) || "",
    name,
    vendor:safeText(raw.vendor,140),
    category:safeText(raw.category,80),
    sourceUrl,
    lastChecked:/^\d{4}-\d{2}-\d{2}$/.test(String(raw.lastChecked||""))?String(raw.lastChecked):"",
    monthlyPerUser:numeric(raw.monthlyPerUser,0),
    seats:Number.isInteger(seats)&&seats>=1?seats:1,
    monthlyPlatform:numeric(raw.monthlyPlatform,0),
    setupCost:numeric(raw.setupCost,0),
    costKnown,
    ratings,
    notes:safeText(raw.notes,1500)
  };
}

/** Defend CSV exports from spreadsheet formula injection in user-supplied cells. */
export function csvCell(raw) {
  let value=String(raw==null?"":raw).replace(/\r\n|\r/g,"\n");
  if(/^[\s\uFEFF]*[=+\-@]/.test(value)) value="'"+value;
  return '"' + value.replace(/"/g,'""') + '"';
}
