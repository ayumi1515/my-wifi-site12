import assert from 'node:assert/strict';
import {estimateHousehold,tenureFor,currentPlanOptions,currentHouseholdBaseline} from '../src/lib/household-diagnosis.ts';
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
test('current plan selection retains existing plans and excludes future launches',()=>{
 const docomo=currentPlanOptions('docomo');assert(docomo.some(p=>p.id==='docomo-mini'));assert(!docomo.some(p=>p.id==='docomo-mini2'));
 assert.deepEqual(currentPlanOptions('ahamo').map(p=>p.id),['ahamo-current']);assert.deepEqual(currentPlanOptions('other'),[]);
});
test('a selected current plan provides a reference price without inventing an actual bill',()=>{
 const input={...base,goal:'mobile',currentMonthly:null,lines:[line({carrier:'docomo',dataGb:999,currentPlanId:'docomo-mini',currentTierMaxGb:4})]};
 const r=estimateHousehold(input);assert.equal(r.baseline.lines[0].planName,'ドコモ mini');assert.equal(r.baseline.lines[0].referenceMonthly,2750);assert.equal(r.baseline.lines[0].monthly,null);assert.equal(r.baseline.lines[0].source,'unknown');assert.equal(r.baseline.effectiveMonthly,null);
 assert(r.proposals.every(p=>p.monthlySavings===null&&p.periodSavings===null));
 for(const familyDiscount of [true,false]){const actual=currentHouseholdBaseline({...input,familyDiscount,lines:[{...input.lines[0],currentMonthly:1999}]});assert.equal(actual.lines[0].referenceMonthly,2750);assert.equal(actual.lines[0].monthly,1999);assert.equal(actual.lines[0].source,'actual');assert.equal(actual.effectiveMonthly,1999);}
});
test('current reference tiers are explicit and never inferred from the desired data amount',()=>{
 const baseline=(x)=>currentHouseholdBaseline({...base,goal:'mobile',currentMonthly:null,lines:[line(x)]}).lines[0];
 assert.equal(baseline({carrier:'docomo',dataGb:3,currentPlanId:'docomo-mini'}).referenceMonthly,null);
 assert.equal(baseline({carrier:'docomo',dataGb:3,currentPlanId:'docomo-mini',currentTierMaxGb:10}).referenceMonthly,3850);
 assert.equal(baseline({carrier:'docomo',currentPlanId:'docomo-max',currentTierMaxGb:null}).referenceMonthly,8448);
 assert.equal(baseline({carrier:'docomo',currentPlanId:'docomo-mini',currentTierMaxGb:999}).referenceMonthly,null);
 assert.equal(baseline({carrier:'nihon-tsushin',currentPlanId:'nihon-tsushin'}).referenceMonthly,290);
 assert.equal(baseline({carrier:'docomo',currentPlanId:'docomo-mini2',currentTierMaxGb:6}).referenceMonthly,null);
 assert.equal(baseline({carrier:'au',currentPlanId:'docomo-mini',currentTierMaxGb:4}).planId,null);
});
test('confirmed line items and home charges derive the household baseline used for savings',()=>{
 const r=estimate({currentMonthly:null,currentHomeMonthly:5000,lines:[line({currentMonthly:6000}),line({currentMonthly:7000})]});
 assert.equal(r.baseline.derivedMonthly,18000);assert.equal(r.baseline.effectiveMonthly,18000);assert.equal(r.baseline.source,'line-items');assert(r.baseline.lines.every(l=>l.source==='actual'&&l.referenceMonthly===null));
 for(const p of r.proposals){assert.equal(p.monthlySavings,18000-p.monthly);assert.equal(p.periodSavings,18000*24-p.referenceTotal+p.campaignAmount);}
 const override=estimate({currentMonthly:18000,lines:[line(),line()]});assert.deepEqual(r.proposals.map(p=>[p.homeId,p.lines.map(l=>l.planId),p.referenceTotal]),override.proposals.map(p=>[p.homeId,p.lines.map(l=>l.planId),p.referenceTotal]));
});
test('partial actual amounts remain unknown rather than filling missing bills from reference prices',()=>{
 const input={...base,currentMonthly:null,currentHomeMonthly:5000,lines:[line({currentMonthly:6000}),line({carrier:'docomo',currentPlanId:'docomo-mini',currentTierMaxGb:4})]};
 const r=estimateHousehold(input);assert.equal(r.baseline.lines[1].referenceMonthly,2750);assert.equal(r.baseline.derivedMonthly,null);assert.equal(r.baseline.source,'unknown');assert(r.proposals.every(p=>p.monthlySavings===null&&p.periodSavings===null));
 const missingHome=currentHouseholdBaseline({...input,currentHomeMonthly:null,lines:[line({currentMonthly:6000})]});assert.equal(missingHome.derivedMonthly,null);
});
test('a confirmed total overrides both complete and incomplete line items without fabricating them',()=>{
 for(const items of [[line({currentMonthly:1000})],[line()]]){
  const r=estimate({currentMonthly:15000,currentHomeMonthly:5000,lines:items});assert.equal(r.baseline.effectiveMonthly,15000);assert.equal(r.baseline.source,'total-override');assert.equal(r.baseline.lines[0].monthly,items[0].currentMonthly??null);assert.equal(r.proposals[0].monthlySavings,15000-r.proposals[0].monthly);
 }
});
test('baseline line items follow the chosen mobile or home scope and accept confirmed zero amounts',()=>{
 const input={...base,currentMonthly:null,currentHomeMonthly:5000,lines:[line({currentMonthly:1000}),line({currentMonthly:0})]};
 assert.equal(currentHouseholdBaseline({...input,goal:'mobile'}).effectiveMonthly,1000);
 const home=currentHouseholdBaseline({...input,goal:'home'});assert.equal(home.effectiveMonthly,5000);assert.deepEqual(home.lines,[]);
 const zero=currentHouseholdBaseline({...input,goal:'both',currentHomeMonthly:0,lines:[line({currentMonthly:0})]});assert.equal(zero.effectiveMonthly,0);assert.equal(zero.source,'line-items');
 const override=currentHouseholdBaseline({...input,currentMonthly:0});assert.equal(override.effectiveMonthly,0);assert.equal(override.source,'total-override');
});
test('invalid actual prices and unknown switching costs cannot produce a savings claim',()=>{
 for(const value of [-1,NaN,Infinity]){
  const r=estimate({currentMonthly:null,currentHomeMonthly:5000,lines:[line({currentMonthly:value})]});assert.equal(r.baseline.lines[0].monthly,null);assert.equal(r.baseline.effectiveMonthly,null);assert(r.proposals.every(p=>p.periodSavings===null));
 }
 const r=estimate({currentMonthly:null,currentHomeMonthly:5000,switchingCost:null,lines:[line({currentMonthly:1000})]});assert.equal(r.baseline.effectiveMonthly,6000);assert(r.proposals.every(p=>p.periodSavings===null&&p.monthlySavings!==null));
 const unknown=estimate({construction:'unknown',currentMonthly:null,currentHomeMonthly:5000,lines:[line({currentMonthly:1000})]});assert(!unknown.complete);assert.equal(unknown.baseline.effectiveMonthly,6000);
});
console.log('Family diagnosis checks passed: '+tests.length+' cases.');
