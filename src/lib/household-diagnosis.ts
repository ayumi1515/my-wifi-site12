import catalog from '../data/household-plans.json' with { type: 'json' };
import homeCatalog from '../data/household-homes.json' with { type: 'json' };

export type Tenure = 'under1'|'1to2'|'2to10'|'10to20'|'20plus'|'unknown';
export interface HouseholdInput {
  goal:'both'|'mobile'|'home';prefecture:string;municipality:string;building:'house'|'mansion';construction:'yes'|'no'|'unknown';years:1|2|3|5;homeTenure:Tenure;start:'now'|'december';support:'either'|'shop'|'online';familyDiscount:boolean;currentHome:string;currentMonthly:number|null;currentHomeMonthly?:number|null;switchingCost:number|null;useCampaigns:boolean;
  lines:{carrier:string;dataGb:number;tenure:Tenure;keepCarrier:boolean;currentPlanId?:string;currentTierMaxGb?:number|null;currentMonthly?:number|null}[];
}
interface Source {label:string;url:string}
interface Plan {id:string;brandId:string;name:string;familyGroup:string|null;shop:boolean;validFrom?:string;validThrough?:string;tiers:{maxGb:number|null;monthly:number}[];familyDiscount:number[];familyMode?:string;bundleIds:string[];bundleDiscount:number;excludeFamilyWithBundle:boolean;tenureDiscount?:{years:number;monthly:number}[];note:string;url:string;sources:Source[]}
interface Home {id:string;name:string;kind:'fiber'|'router';prefectures:string[]|null;buildings:string[];monthly:Record<'house'|'mansion',number|null>;decemberMonthly?:Record<'house'|'mansion',number|null>;introFirstMonth?:number;introMonthly?:number;introMonths?:number;requiredBundleOptionMonthly:number|null;contractMonths:number;note:string;url:string;sources:Source[]}
interface Campaign {id:string;homeId:string;amount:number;receiveAfterMonths:number|null;minUseMonths:number;buildings:string[];conditions:string[];url:string;sourceCheckedAt:string}
export interface HouseholdLine {brandId:string;planId:string;name:string;monthly:number;baseMonthly:number;familyDiscount:number;bundleDiscount:number;tenureDiscount:number;dataLabel:string;url:string;sources:Source[];note:string}
export interface HouseholdProposal {homeId:string|null;monthly:number;homeMonthly:number;optionMonthly:number;mobileMonthly:number;referenceTotal:number;lines:HouseholdLine[];note:string;campaignAmount:number;campaignNote:string;periodSavings:number|null;monthlySavings:number|null;periodBillSavings:number|null;possibleCampaignAmount:number;possibleCampaignNote:string}
export interface CurrentPlanOption {id:string;name:string;tiers:{maxGb:number|null;monthly:number}[];note:string}
export interface HouseholdBaselineLine {planId:string|null;planName:string;monthly:number|null;referenceMonthly:number|null;source:'actual'|'unknown'}
export interface HouseholdBaseline {lines:HouseholdBaselineLine[];homeMonthly:number|null;derivedMonthly:number|null;effectiveMonthly:number|null;source:'total-override'|'line-items'|'unknown'}
export interface HouseholdResult {proposals:HouseholdProposal[];warnings:string[];scope:string;complete:boolean;baseline:HouseholdBaseline}
const plans=catalog.plans as Plan[];
const homes=homeCatalog.homes as Home[];
const campaigns=homeCatalog.campaigns as Campaign[];
const yearsFor=(value:Tenure)=>({under1:0,'1to2':1,'2to10':2,'10to20':10,twenty:20, '20plus':20,unknown:0}[value]??0);
const finiteCost=(n:number|null|undefined):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
export function currentPlanOptions(carrier:string):CurrentPlanOption[] {
  // A closed application window does not invalidate a customer's existing plan.
  return plans.filter(p=>p.brandId===carrier&&(!p.validFrom||p.validFrom<=catalog.checkedAt)).map(p=>({id:p.id,name:p.name,tiers:p.tiers.map(t=>({...t})),note:p.note}));
}
export function currentHouseholdBaseline(input:HouseholdInput):HouseholdBaseline {
  const lines:HouseholdBaselineLine[]=input.goal==='home'?[]:input.lines.map(line=>{
    const plan=currentPlanOptions(line.carrier).find(p=>p.id===line.currentPlanId);
    // Never infer the current tier from the data amount requested after switching.
    const tier=plan&&(line.currentTierMaxGb===undefined?(plan.tiers.length===1?plan.tiers[0]:undefined):plan.tiers.find(t=>t.maxGb===line.currentTierMaxGb));
    const monthly=finiteCost(line.currentMonthly)?line.currentMonthly:null;
    return {planId:plan?.id??null,planName:plan?.name??'未選択・分からない',monthly,referenceMonthly:tier?.monthly??null,source:monthly===null?'unknown':'actual'};
  });
  const homeMonthly=finiteCost(input.currentHomeMonthly)?input.currentHomeMonthly:null;
  const allLinesKnown=lines.length>0&&lines.every(line=>line.monthly!==null);
  const mobileMonthly=allLinesKnown?lines.reduce((total,line)=>total+line.monthly!,0):null;
  const derivedMonthly=input.goal==='home'?homeMonthly:input.goal==='mobile'?mobileMonthly:mobileMonthly!==null&&homeMonthly!==null?mobileMonthly+homeMonthly:null;
  const hasOverride=finiteCost(input.currentMonthly);
  const effectiveMonthly=hasOverride?input.currentMonthly:derivedMonthly;
  return {lines,homeMonthly,derivedMonthly,effectiveMonthly,source:hasOverride?'total-override':derivedMonthly!==null?'line-items':'unknown'};
}
const groupCount=(selected:Plan[],group:string|null)=>group?selected.filter(p=>p.familyGroup===group).length:0;
function tierFor(plan:Plan,gb:number){return plan.tiers.find(t=>t.maxGb===null||(gb!==999&&t.maxGb>=gb));}
export function tenureFor(plan:Plan,line:HouseholdInput['lines'][number]){const continues=plan.brandId===line.carrier||(plan.brandId==='docomo'&&line.carrier==='ahamo');return continues?Math.max(0,...(plan.tenureDiscount??[]).filter(t=>yearsFor(line.tenure)>=t.years).map(t=>t.monthly)):0;}
function bundleFor(plan:Plan,home:Home|null){return home&&home.requiredBundleOptionMonthly!==null&&plan.bundleIds.includes(home.id)?plan.bundleDiscount:0;}
function lineCost(plan:Plan,line:HouseholdInput['lines'][number],selected:Plan[],home:Home|null,input:HouseholdInput,index:number):HouseholdLine {
  const tier=tierFor(plan,line.dataGb)!;const count=groupCount(selected,plan.familyGroup);const bundle=bundleFor(plan,home);
  const earlierSame=selected.slice(0,index).some(p=>p.familyGroup&&p.familyGroup===plan.familyGroup);
  const family=input.familyDiscount&&!(bundle&&plan.excludeFamilyWithBundle)&&!(plan.familyMode==='after-first'&&!earlierSame)?(plan.familyDiscount[Math.min(2,Math.max(0,count-1))]??0):0;
  const tenure=tenureFor(plan,line);
  return {brandId:plan.brandId,planId:plan.id,name:plan.name,monthly:Math.max(0,tier.monthly-family-bundle-tenure),baseMonthly:tier.monthly,familyDiscount:family,bundleDiscount:bundle,tenureDiscount:tenure,dataLabel:tier.maxGb===null?'容量無制限（速度・テザリング等の条件あり）':`${tier.maxGb}GBまでの掲載プラン`,url:plan.url,sources:plan.sources,note:plan.note};
}
function homePrice(home:Home|null,input:HouseholdInput){return input.goal==='mobile'||!home?0:(input.start==='december'&&home.decemberMonthly?home.decemberMonthly:home.monthly)[input.building]??0;}
function campaignFor(home:Home|null,input:HouseholdInput){
  if(!input.useCampaigns||input.goal==='mobile'||!home||input.currentHome===home.id)return {amount:0,note:'キャッシュバックは新規対象条件・期間内の受取を想定する場合だけ加算します。同じ自宅回線の継続、未確認の最大額やポイントは計算に入れません。'};
  const eligible=campaigns.filter(c=>c.homeId===home.id&&c.buildings.includes(input.building)&&(c.receiveAfterMonths===null||c.receiveAfterMonths<=input.years*12)&&c.minUseMonths<=input.years*12);
  const c=eligible.sort((a,b)=>b.amount-a.amount)[0];
  return c?{amount:c.amount,note:`対象条件を満たし予定期間内に受け取る想定の特典 ${c.amount.toLocaleString('ja-JP')}円。${c.conditions.join('／')}。受取時期は確定ではなく、手続き・入金予定を申込先で確認してください。`}:{amount:0,note:'この組合せには、自動計算できる確定額の特典を登録していません。バナーの最大額は加算していません。'};
}
function proposalFor(home:Home|null,selected:Plan[],input:HouseholdInput):HouseholdProposal {
  const lines=selected.map((p,i)=>lineCost(p,input.lines[i],selected,home,input,i));
  const homeMonthly=homePrice(home,input);const optionMonthly=home&&lines.some(l=>l.bundleDiscount>0)?home.requiredBundleOptionMonthly??0:0;
  const mobileMonthly=lines.reduce((n,l)=>n+l.monthly,0);const monthly=homeMonthly+optionMonthly+mobileMonthly;const months=input.years*12;
  let referenceTotal=monthly*months;
  const introEligible=input.useCampaigns&&home?.id!==input.currentHome;
  if(home&&introEligible&&input.goal!=='mobile'&&home.introFirstMonth!==undefined)referenceTotal+=home.introFirstMonth-homeMonthly;
  if(home&&introEligible&&input.goal!=='mobile'&&home.introMonthly!==undefined&&home.introMonths)referenceTotal+=(home.introMonthly-homeMonthly)*Math.min(home.introMonths,Math.max(0,months-1));
  if(input.start==='now'){
    // ahamo changes existing contracts on Dec 1; docomo mini does not migrate automatically.
    selected.forEach((p,i)=>{if(p.brandId!=='ahamo')return;const future=plans.find(q=>q.brandId==='ahamo'&&q.validFrom==='2026-12-01');if(!future)return;const f=tierFor(future,input.lines[i].dataGb);if(f)referenceTotal+=(f.monthly-lines[i].baseMonthly)*(months-1);});
    if(home?.id==='softbank-air'&&input.goal!=='mobile'&&home.decemberMonthly)referenceTotal+=((home.decemberMonthly[input.building]??homeMonthly)-homeMonthly)*(months-1);
    if(home?.id==='softbank-hikari'&&input.goal!=='mobile'&&home.decemberMonthly)referenceTotal+=((home.decemberMonthly[input.building]??homeMonthly)-homeMonthly)*Math.max(0,months-home.contractMonths);
  }
  const campaign=campaignFor(home,input);
  const effectiveMonthly=currentHouseholdBaseline(input).effectiveMonthly;
  const monthlySavings=effectiveMonthly!==null?effectiveMonthly-monthly:null;
  const periodSavings=effectiveMonthly!==null&&finiteCost(input.switchingCost)?effectiveMonthly*months-referenceTotal-input.switchingCost+campaign.amount:null;
  // 「いくら得？」の表示用：料金だけの期間差と、条件を満たせば受け取れる特典（計算に入れるかどうかとは別に見せる）
  const periodBillSavings=effectiveMonthly!==null?effectiveMonthly*months-referenceTotal:null;
  const possible=input.useCampaigns?campaign:campaignFor(home,{...input,useCampaigns:true});
  return {homeId:home?.id??null,monthly,homeMonthly,optionMonthly,mobileMonthly,referenceTotal,lines,campaignAmount:campaign.amount,campaignNote:campaign.note,monthlySavings,periodSavings,periodBillSavings,possibleCampaignAmount:possible.amount,possibleCampaignNote:possible.note,note:`${home?.note??'自宅回線の基本料は含めず、スマホ回線のみを比較しています。'} 通常料金・対象条件の家族割とセット割で比較。期間参考額は開始月を1カ月とし、日割りをしない参考計算です。初期費用・工事費・端末代・解約費・通話料は別途。`};
}
const objective=(p:HouseholdProposal)=>p.referenceTotal-p.campaignAmount;
function phonePeriodDelta(plan:Plan,line:HouseholdInput['lines'][number],input:HouseholdInput){
  if(input.start!=='now'||plan.brandId!=='ahamo')return 0;
  const future=plans.find(p=>p.brandId==='ahamo'&&p.validFrom==='2026-12-01');
  const tier=future&&tierFor(future,line.dataGb);
  return tier?(tier.monthly-tierFor(plan,line.dataGb)!.monthly)*(input.years*12-1):0;
}
function optimizeForHome(home:Home|null,input:HouseholdInput,date:string):HouseholdProposal|null {
  if(input.goal==='home')return proposalFor(home,[],input);
  const options=input.lines.map(line=>{
    let available=plans.filter(p=>(!p.validFrom||p.validFrom<=date)&&(!p.validThrough||p.validThrough>=date)&&tierFor(p,line.dataGb)&&(!line.keepCarrier||p.brandId===line.carrier)&&(input.support!=='shop'||p.shop));
    // A plan dominated for every possible family size cannot lower this fee-only objective.
    const costAt=(p:Plan,count:number)=>{const bundle=bundleFor(p,home);const family=input.familyDiscount&&!(bundle&&p.excludeFamilyWithBundle)?p.familyDiscount[Math.min(2,count-1)]??0:0;return (tierFor(p,line.dataGb)!.monthly-bundle-family-tenureFor(p,line))*input.years*12+phonePeriodDelta(p,line,input);};
    available=available.filter((p,index)=>!available.some((q,j)=>j!==index&&q.familyGroup===p.familyGroup&&q.familyMode===p.familyMode&&Array.from({length:input.lines.length},(_,i)=>i+1).every(n=>costAt(q,n)<=costAt(p,n))&&(Array.from({length:input.lines.length},(_,i)=>i+1).some(n=>costAt(q,n)<costAt(p,n))||j<index)));
    return available.sort((a,b)=>costAt(a,input.lines.length)-costAt(b,input.lines.length));
  });
  if(options.some(list=>!list.length))return null;
  const lowerFor=(p:Plan,i:number)=>Math.max(0,tierFor(p,input.lines[i].dataGb)!.monthly-bundleFor(p,home)-(input.familyDiscount?Math.max(0,...p.familyDiscount):0)-tenureFor(p,input.lines[i]))*input.years*12+phonePeriodDelta(p,input.lines[i],input);
  const minimums=options.map((opts,i)=>Math.min(...opts.map(p=>lowerFor(p,i))));
  const suffix=new Array(minimums.length+1).fill(0);for(let i=minimums.length-1;i>=0;i--)suffix[i]=suffix[i+1]+Math.max(0,minimums[i]);
  let best:HouseholdProposal|null=null;const selected:Plan[]=[];const campaign=campaignFor(home,input).amount;const base=proposalFor(home,[],input).referenceTotal-campaign;
  const search=(index:number,lowerBound:number)=>{
    if(best&&base+lowerBound+suffix[index]>objective(best))return;
    if(index===options.length){const p=proposalFor(home,selected,input);if(!best||objective(p)<objective(best)||(objective(p)===objective(best)&&p.monthly<best.monthly))best=p;return;}
    for(const p of options[index]){selected.push(p);search(index+1,lowerBound+lowerFor(p,index));selected.pop();}
  };
  search(0,0);return best;
}
export function estimateHousehold(input:HouseholdInput):HouseholdResult {
  const warnings:string[]=[];const scope=input.goal==='both'?'自宅回線と家族のスマホの合計':input.goal==='mobile'?'家族のスマホの合計（自宅回線基本料は比較外）':'自宅回線のみ（携帯料金・セット割は比較外）';
  const baseline=currentHouseholdBaseline(input);
  const invalid=!['both','home','mobile'].includes(input.goal)||!/^\d{2}$/.test(input.prefecture)||!['house','mansion'].includes(input.building)||![1,2,3,5].includes(input.years)||(input.goal!=='home'&&input.lines.length<1)||input.lines.length>6||input.lines.some(l=>!Number.isFinite(l.dataGb)||l.dataGb<0);
  if(invalid)return {proposals:[],warnings:['地域・回線数・通信量を選び直してください。'],scope,complete:false,baseline};
  if(input.goal==='home')warnings.push('携帯の現在の契約プランが未入力のため、スマホのセット割を自宅費用から差し引いていません。家族合計を比べる場合は「両方」を選んでください。');
  // 工事が「まだ分からない」でも、光回線と工事なしの両方から比べて候補を出す（工事できるかは申込み前に確認してもらう）
  if(input.homeTenure==='under1'||input.lines.some(l=>l.tenure==='under1'))warnings.push('切替から1年未満の契約があります。短期解約料・端末分割・工事費残額を、各契約の明細で確認してください。年数だけで残額0円とは計算しません。');
  if(input.years===1)warnings.push('1年利用では、光回線の工事費やホームルーター端末代の残額が大きくなる場合があります。乗換え費用欄に全額の見積りを入れて比べてください。');
  if(!finiteCost(input.switchingCost))warnings.push('解約金・残債・新規初期費用の合計が未入力です。期間全体でいくら得かは、費用を入力してから表示します。0円の場合も0と入力してください。');
  if(baseline.effectiveMonthly===null)warnings.push('現在の各回線と自宅の実支払額、または比較対象の合計月額を入力すると、月額差と期間の節約目安を表示します。');
  if(baseline.lines.some(line=>line.referenceMonthly!==null))warnings.push('現在プランの割引前基本料は参考表示です。割引や請求額を推測せず、比較する現在月額には入力した実支払額を使います。');
  warnings.push('通話料・端末代・初期工事費・ユニバーサルサービス料等は月額比較に含みません。カード・電気・年齢・期間限定割引・ポイント・未確認の最大特典額も除外しています。');
  warnings.push('通信品質・屋内電波・建物設備は未判定です。povo等の都度購入と、定額比較できないプランは自動試算の対象外です。');
  if(input.start==='now')warnings.push('11月開始の参考額はahamoとSoftBankの公表済み12月改定を反映。miniはmini2へ自動移行しない前提です。その他の将来改定・日割り・申込別キャンペーンは窓口で確認してください。');
  const date=input.start==='december'?'2026-12-01':'2026-11-23';
  let eligible: (Home|null)[];
  if(input.goal==='mobile'){eligible=[homes.find(h=>h.id===input.currentHome)??null];if(input.currentHome!=='none')warnings.push('今の自宅回線を使うセット割は対象オプションを追加する想定です。加入済みのオプションと重複しないよう、窓口の見積りを確認してください。');}
  else {eligible=homes.filter(h=>h.id!==input.currentHome&&h.buildings.includes(input.building)&&(!h.prefectures||h.prefectures.includes(input.prefecture))&&(input.construction==='unknown'||h.kind===(input.construction==='no'?'router':'fiber')));if(input.construction==='unknown'&&input.goal!=='mobile')warnings.push('工事ができるかまだ分からないため、光回線と工事なし（ホームルーター）の両方から比べています。光回線を選ぶ場合は、申込み前に住所と建物で工事できるかを確認してください。');if(homes.some(h=>h.id===input.currentHome))warnings.push('現在の自宅回線と同じ会社への継続契約は乗換え先候補から除いています。継続する費用は入力した現在月額を基準に比較してください。');}
  const proposals=eligible.map(h=>optimizeForHome(h,input,date)).filter((p):p is HouseholdProposal=>p!==null).sort((a,b)=>objective(a)-objective(b)||a.monthly-b.monthly).slice(0,3);
  if(!proposals.length)warnings.unshift('掲載プランには、選択したブランド・通信量・店舗希望をすべて満たす候補がありません。条件を見直すか、公式窓口で確認してください。');
  return {proposals,warnings,scope,complete:proposals.length>0,baseline};
}
