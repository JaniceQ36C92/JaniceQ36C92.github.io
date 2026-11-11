import test from "node:test";
import assert from "node:assert/strict";
import {CRITERIA,estimateTco,weightedScore,sanitizeRecord,safeHttpsUrl,csvCell} from "../src/scoring.js";

const all=(value)=>Object.fromEntries(CRITERIA.map(c=>[c.key,value]));
test("Weights sum to 100 percent",()=>assert.equal(CRITERIA.reduce((a,c)=>a+c.weight,0),1));
test("Fully rated software gets 20 to 100 points",()=>{
  assert.equal(weightedScore(all(1)).score,20);
  assert.equal(weightedScore(all(5)).score,100);
  assert.deepEqual(weightedScore(all(5)).missing,[]);
});
test("Unknown rating cannot be treated as a scored program",()=>{
  assert.equal(weightedScore({...all(5),security:0}).score,null);
  assert.equal(weightedScore({...all(5),support:99}).complete,false);
});
test("Weighted scoring respects criteria weights",()=>{
  assert.equal(weightedScore({features:5,security:4,usability:3,integrations:2,support:1}).score,68);
});
test("TCO uses a comparable common horizon",()=>{
  assert.deepEqual(estimateTco({monthlyPerUser:15,users:5,monthlyPlatform:25,setupCost:300,months:12}),{monthly:100,total:1500,months:12});
});
test("TCO validates seats, negative prices, and horizon",()=>{
  const base={monthlyPerUser:10,users:3,monthlyPlatform:0,setupCost:0,months:12};
  assert.throws(()=>estimateTco({...base,users:0}),/Seats/);
  assert.throws(()=>estimateTco({...base,monthlyPerUser:-1}),/non-negative/);
  assert.throws(()=>estimateTco({...base,months:0}),/horizon/);
  assert.throws(()=>estimateTco({...base,monthlyPlatform:""}),/required/);
});
test("Unverified cost remains unverified on imported records",()=>{
  const record=sanitizeRecord({name:"Test tool",costKnown:false,ratings:all(0)});
  assert.equal(record.costKnown,false);
  assert.equal(weightedScore(record.ratings).score,null);
});
test("Imported records drop executable URL schemes and unsafe rating values",()=>{
  const record=sanitizeRecord({name:"  A product  ",sourceUrl:"javascript:alert(1)",ratings:{...all(3),security:900},notes:"hello\u0000world",seats:2.5});
  assert.equal(record.name,"A product");
  assert.equal(record.sourceUrl,"");
  assert.equal(record.ratings.security,0);
  assert.equal(record.seats,1);
  assert.equal(record.notes,"hello world");
  assert.equal(safeHttpsUrl("https://vendor.example/pricing"),"https://vendor.example/pricing");
});
test("Rejects malformed records and formula-injection CSV fields",()=>{
  assert.equal(sanitizeRecord({name:""}),null);
  assert.equal(csvCell("=SUM(A1:A2)"),'"\'=SUM(A1:A2)"');
  assert.equal(csvCell("A \"quoted\" name"),'"A ""quoted"" name"');
  assert.equal(csvCell(" -10"),'"\' -10"');
});
