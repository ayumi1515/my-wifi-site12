import assert from 'node:assert/strict';
import {estimateHousehold,tenureFor} from '../src/lib/household-diagnosis.ts';
import catalog from '../src/data/household-plans.json' with {type:'json'};
const line=(x={})=>({carrier:'other',dataGb:3,tenure:'unknown',keepCarrier:false,...x});
const base={goal:'both',prefecture:'13',municipality:'',building:'house',construction:'yes',years:2,homeTenure:'unknown',start:'december',support:'either',familyDiscount:true,currentHome:'none',currentMonthly:18000,switchingCost:0,useCampaigns:false,lines:[line()]};
const estimate=(x={})=>estimateHousehold({...base,...x});
const tests=[];
const test=(name,fn)=>{fn();tests.push(name);};
test('home-only accepts zero phone inputs and never applies an inferred phone discount',()=>{
 const r=estimate({goal:'home',lines:[]});assert(r.complete);for(const p of r.proposals){assert.equal(p.mobileMonthly,0);assert.equal(p.optionMonthly,0);assert.deepEqual(p.lines,[]);}
});
test('construction unknown requires an address check instead of a fabricated total',()=>{
 const r=estimate({construction:'unknown'});assert(!r.complete);assert.equal(r.proposals.length,0);
});
test('BBIQ is restricted to Kagoshima houses for this fixed-price comparison',()=>{
 for(let p=1;p<=47;p++){const r=estimate({prefecture:String(p).padStart(2,'0'),useCampaigns:true});if(p!==46)assert(!r.proposals.some(p=>p.homeId==='bbiq'));}
 assert(!estimate({prefecture:'46',building:'mansion',useCampaigns:true}).proposals.some(p=>p.homeId==='bbiq'));
});
test('docomo family counting includes ahamo but discounts only the eligible MAX lines',()=>{
 const r=estimate({goal:'mobile',lines:[line({carrier:'docomo',dataGb:999,keepCarrier:true}),line({carrier:'docomo',dataGb:999,keepCarrier:true}),line({carrier:'ahamo',dataGb:30,keepCarrier:true})]});
 const p=r.proposals[0];assert.equal(p.lines[0].familyDiscount,1210);assert.equal(p.lines[1].familyDiscount,1210);assert.equal(p.lines[2].familyDiscount,0);assert.equal(p.lines[2].bundleDiscount,0);
});
test('docomo family counts of one and two produce their published discounts',()=>{
 for(const [n,expected] of [[1,0],[2,550],[3,1210]]){const p=estimate({goal:'mobile',lines:Array.from({length:n},()=>line({carrier:'docomo',dataGb:999,keepCarrier:true}))}).proposals[0];assert(p.lines.every(l=>l.familyDiscount===expected));}
});
test('UQ family and home bundle discounts do not stack; phone option is charged once',()=>{
 const lines=Array.from({length:3},()=>line({carrier:'uq-mobile',dataGb:30,keepCarrier:true}));
 const family=estimate({goal:'mobile',lines}).proposals[0];assert(family.lines.every(l=>l.familyDiscount===550&&l.bundleDiscount===0&&l.monthly===3498));
 const bundled=estimate({goal:'mobile',currentHome:'biglobe-hikari',lines}).proposals[0];assert(bundled.lines.every(l=>l.familyDiscount===0&&l.bundleDiscount===1100&&l.monthly===2948));assert.equal(bundled.optionMonthly,550);assert.equal(bundled.monthly,9394);
});
test('Ymobile family discount starts at the second line and excludes the home bundle',()=>{
 const lines=Array.from({length:2},()=>line({carrier:'ymobile',dataGb:3,keepCarrier:true}));
 const p=estimate({goal:'mobile',lines}).proposals[0];assert.deepEqual(p.lines.map(l=>l.familyDiscount),[0,1100]);assert.equal(p.mobileMonthly,3278*2-1100);
 const bundled=estimate({goal:'mobile',currentHome:'softbank-hikari',lines}).proposals[0];assert(bundled.lines.every(l=>l.familyDiscount===0&&l.bundleDiscount===1650));assert.equal(bundled.optionMonthly,550);
});
test('long tenure discount applies only to retaining the same eligible carrier',()=>{
 const p=estimate({goal:'mobile',lines:[line({carrier:'docomo',dataGb:999,tenure:'20plus',keepCarrier:true})]}).proposals[0];assert.equal(p.lines[0].tenureDiscount,220);
 const switched=estimate({goal:'mobile',lines:[line({carrier:'au',tenure:'20plus'})]}).proposals[0];for(const l of switched.lines)assert.equal(l.tenureDiscount,0);
});
test('family discount opt-out removes all family reductions',()=>{
 const r=estimate({goal:'mobile',familyDiscount:false,lines:Array.from({length:3},()=>line({carrier:'docomo',dataGb:999,keepCarrier:true}))});assert(r.proposals[0].lines.every(l=>l.familyDiscount===0));
});
test('ahamo retains the docomo contract history when changing to MAX',()=>{
 const max=catalog.plans.find(p=>p.id==='docomo-max');assert.equal(tenureFor(max,line({carrier:'ahamo',tenure:'20plus'})),220);assert.equal(tenureFor(max,line({carrier:'au',tenure:'20plus'})),0);
});
test('cashback and BBIQ introductory prices require an explicit qualifying assumption',()=>{
 const no=estimate({goal:'home',lines:[],prefecture:'46',years:1});assert(no.proposals.every(p=>p.campaignAmount===0));
 const yes=estimate({goal:'home',lines:[],prefecture:'46',years:1,useCampaigns:true,currentMonthly:5000,switchingCost:1000});
 const p=yes.proposals.find(p=>p.homeId==='bbiq');assert(p);assert.equal(p.referenceTotal,4400*11);assert.equal(p.campaignAmount,30000);assert.equal(p.periodSavings,40600);
 assert(estimate({goal:'home',lines:[],prefecture:'46',currentHome:'bbiq',years:1,useCampaigns:true}).proposals.every(p=>p.campaignAmount===0));
});
test('unknown switching costs never become zero in the savings claim',()=>{
 const p=estimate({switchingCost:null}).proposals[0];assert.equal(p.periodSavings,null);assert.notEqual(p.monthlySavings,null);
 const q=estimate({currentMonthly:null,switchingCost:0}).proposals[0];assert.equal(q.periodSavings,null);assert.equal(q.monthlySavings,null);
});
test('savings can be negative and include user-entered switching costs',()=>{
 const p=estimate({currentMonthly:1,switchingCost:1000000}).proposals[0];assert(p.periodSavings<0);assert.equal(p.periodSavings,24-p.referenceTotal-1000000+p.campaignAmount);
});
test('known ahamo December change is reflected without migrating docomo mini',()=>{
 const lines=[line({carrier:'ahamo',dataGb:30,keepCarrier:true})];const now=estimate({goal:'mobile',start:'now',lines}).proposals[0];const dec=estimate({goal:'mobile',start:'december',lines}).proposals[0];assert.equal(now.monthly,2970);assert.equal(now.referenceTotal,2970+3135*23);assert.equal(dec.monthly,3135);assert.equal(dec.referenceTotal,3135*24);
 const mini=estimate({goal:'mobile',start:'now',lines:[line({carrier:'docomo',dataGb:3,keepCarrier:true})]}).proposals[0];assert.equal(mini.lines[0].planId,'docomo-mini');assert.equal(mini.referenceTotal,2750*24);
});
test('Air December increase is included in the reference period',()=>{
 const p=estimate({goal:'home',lines:[],construction:'no',start:'now',years:1}).proposals.find(p=>p.homeId==='softbank-air');assert(p);assert.equal(p.referenceTotal,5368+5698*11);
});
test('a December price decrease cannot be pruned by its higher November price',()=>{
 const p=estimate({goal:'mobile',start:'now',years:2,lines:[line({dataGb:35})]}).proposals[0];assert.equal(p.lines[0].brandId,'ahamo');assert.equal(p.referenceTotal,4950+3135*23);
});
test('existing fixed-line contract is not mispriced as a new switching offer',()=>{
 for(const start of ['now','december'])assert(!estimate({currentHome:'softbank-hikari',start}).proposals.some(p=>p.homeId==='softbank-hikari'));
});
test('store preference filters every suggested phone plan',()=>{
 const p=estimate({support:'shop',lines:[line(),line({dataGb:50})]}).proposals[0];for(const l of p.lines)assert(catalog.plans.find(p=>p.id===l.planId).shop);
});
test('prepaid purchases are not fabricated as a fixed monthly contract',()=>{
 const p=estimate({goal:'mobile',lines:[line({carrier:'povo',keepCarrier:true})]});assert(!p.complete);assert.equal(p.proposals.length,0);
});
test('six-line totals reconcile and period objectives are sorted',()=>{
 const r=estimate({lines:[1,3,10,30,50,999].map(dataGb=>line({dataGb})),years:3});assert(r.complete);for(const p of r.proposals){assert.equal(p.monthly,p.homeMonthly+p.optionMonthly+p.mobileMonthly);assert.equal(p.mobileMonthly,p.lines.reduce((n,l)=>n+l.monthly,0));assert(p.lines.every(l=>l.monthly>=0));}const objectives=r.proposals.map(p=>p.referenceTotal-p.campaignAmount);assert.deepEqual(objectives,[...objectives].sort((a,b)=>a-b));
});
test('empty phone inputs are rejected for both and mobile goals',()=>{
 assert(!estimate({lines:[]}).complete);assert(!estimate({goal:'mobile',lines:[]}).complete);assert(!estimate({lines:Array.from({length:7},()=>line())}).complete);
});
console.log('Family diagnosis checks passed: '+tests.length+' cases.');
