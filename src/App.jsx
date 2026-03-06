import { useState, useEffect } from "react";

/* ── Data ─────────────────────────────────────────────────────────── */
const PURPOSES = [
  "deliver on something I've committed to",
  "move forward a direction I believe is right",
  "keep this relationship on solid ground",
  "develop a capability, an opportunity, or an idea",
  "protect something I've worked hard to build",
  "be recognized for what I actually bring to this",
];
const CONCERNS = [
  "we'll put in the effort and nothing will actually change",
  "I'll lose credibility, trust, or standing",
  "I'll end up with less say than I came in with",
  "someone or the relationship will come out of this worse",
  "we'll commit to something we can't actually deliver",
  "the thing that really needs to be said won't be",
];
const CIRCUMSTANCES = [
  "there's a deadline or time pressure shaping this",
  "resources (budget, people, capacity) are constrained",
  "there's history between us that's already in the room",
  "decisions above us are already limiting what's possible",
  "competing priorities are pulling focus away from this",
  "there's information we don't have yet that would change things",
  "there's an external pressure neither of us controls",
];
const PQ = {
  "deliver on something I've committed to":        n=>`What has ${n} committed to that's at stake here?`,
  "move forward a direction I believe is right":   n=>`What direction is ${n} trying to advance, and why does it matter to them?`,
  "keep this relationship on solid ground":        n=>`What does ${n} need to feel this relationship is safe?`,
  "develop a capability, an opportunity, or an idea": n=>`What is ${n} trying to grow that this interaction affects?`,
  "protect something I've worked hard to build":   n=>`What has ${n} built that they might feel is at risk here?`,
  "be recognized for what I actually bring to this": n=>`What contribution from ${n} might be going unrecognized?`,
};
const CQ = {
  "we'll put in the effort and nothing will actually change": n=>`What past efforts has ${n} made that didn't lead to change?`,
  "I'll lose credibility, trust, or standing":     n=>`Whose trust or respect matters most to ${n} in this situation?`,
  "I'll end up with less say than I came in with": n=>`Where does ${n} most need to feel their voice counts?`,
  "someone or the relationship will come out of this worse": n=>`Which relationship is ${n} most concerned about protecting?`,
  "we'll commit to something we can't actually deliver": n=>`What constraints might make ${n} skeptical of what's being proposed?`,
  "the thing that really needs to be said won't be": n=>`What might ${n} be holding back, and what would make it safe to say?`,
};
const SQ = {
  "there's a deadline or time pressure shaping this":       n=>`What timeline is most pressing for ${n} right now?`,
  "resources (budget, people, capacity) are constrained":   n=>`What resource limitations is ${n} working within that I might not fully see?`,
  "there's history between us that's already in the room":  n=>`How might ${n} be reading our history differently than I am?`,
  "decisions above us are already limiting what's possible":n=>`What constraints has ${n} received from above that shape their options?`,
  "competing priorities are pulling focus away from this":  n=>`What else is ${n} carrying right now that makes this harder?`,
  "there's information we don't have yet that would change things": n=>`What does ${n} know, or not know yet, that I should understand?`,
  "there's an external pressure neither of us controls":    n=>`What external forces is ${n} navigating that neither of us can change?`,
};

const emptyCP = (name="")=>({name,purpose:[],purposeDK:false,concerns:[],concernsDK:false,cir:[],cirDK:false});

/* ── Per-person color palette ─────────────────────────────────────── */
const CP_PALETTE = [
  { bg:"#FFF0EB", border:"#E8956A", dot:"#C45A20", text:"#7A3210", label:"#C45A20" },
  { bg:"#EBF0FF", border:"#7A9EE8", dot:"#2952C4", text:"#1A3A8B", label:"#2952C4" },
  { bg:"#F0F5F0", border:"#7AB87A", dot:"#2E7D2E", text:"#1A4A1A", label:"#2E7D2E" },
  { bg:"#F5EBF5", border:"#C47AC4", dot:"#8B2A8B", text:"#5A1A5A", label:"#8B2A8B" },
];
const cpColor = (idx) => CP_PALETTE[idx % CP_PALETTE.length];

/* ── Styles ───────────────────────────────────────────────────────── */
const G = {
  bg:          "#F9F8F6",
  surface:     "#FFFFFF",
  surface2:    "#F3F2EF",
  border:      "rgba(0,0,0,0.08)",
  borderHover: "rgba(0,0,0,0.18)",
  text:        "#1A1A1A",
  textSub:     "rgba(26,26,26,0.52)",
  textMuted:   "rgba(26,26,26,0.28)",
  teal:        "#00A49A",
  tealDim:     "rgba(0,164,154,0.08)",
  tealText:    "#00A49A",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: ${G.bg}; }

  .screen {
    position: absolute; inset: 0;
    animation: fadeUp .38s cubic-bezier(.22,.68,0,1.2) both;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .chip {
    display: inline-flex; align-items: center;
    padding: 10px 18px; border-radius: 100px;
    border: 1.5px solid ${G.border};
    background: ${G.surface};
    color: ${G.textSub};
    font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 400;
    cursor: pointer; transition: all .18s ease;
    white-space: normal; text-align: left; line-height: 1.4;
    user-select: none;
  }
  .chip:hover { border-color: ${G.borderHover}; color: ${G.text}; background: ${G.surface2}; }
  .chip.sel  { border-color: ${G.teal}; background: ${G.tealDim}; color: ${G.tealText}; }
  .chip.dk   { font-style: italic; color: ${G.textMuted}; }
  .chip.dk.sel { border-color: rgba(26,26,26,0.2); background: rgba(26,26,26,0.04); color: ${G.textSub}; }
  .chip.sel .check { opacity:1; transform:scale(1); }
  .check {
    width:16px; height:16px; border-radius:50%; background:${G.teal};
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; margin-right:8px;
    opacity:0; transform:scale(0.5);
    transition: all .18s cubic-bezier(.34,1.56,.64,1);
  }
  .check svg { display:block; }

  .btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 28px; border-radius:100px; border:none;
    background:${G.teal}; color:#FFFFFF;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:600;
    cursor:pointer; transition:all .2s ease; letter-spacing:.01em;
  }
  .btn-primary:hover:not(:disabled) { background:#00877E; transform:scale(1.02); }
  .btn-primary:disabled { background:${G.surface2}; color:${G.textMuted}; cursor:default; transform:none; }

  .btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:12px 20px; border-radius:100px;
    border:1.5px solid ${G.border}; background:transparent;
    color:${G.textSub}; font-family:'Outfit',sans-serif; font-size:13px;
    cursor:pointer; transition:all .18s;
  }
  .btn-ghost:hover { border-color:${G.borderHover}; color:${G.text}; }

  .btn-export {
    display:inline-flex; align-items:center; gap:7px;
    padding:10px 18px; border-radius:100px;
    border:1.5px solid ${G.border}; background:${G.surface};
    color:${G.textSub}; font-family:'Outfit',sans-serif; font-size:13px;
    cursor:pointer; transition:all .18s;
  }
  .btn-export:hover { border-color:${G.teal}; color:${G.teal}; }

  .field {
    background:${G.surface}; border:1.5px solid ${G.border};
    border-radius:12px; padding:14px 18px;
    color:${G.text}; font-family:'Outfit',sans-serif; font-size:14px;
    outline:none; width:100%; transition:border-color .18s;
  }
  .field:focus { border-color:${G.teal}; }
  .field::placeholder { color:${G.textMuted}; }

  .tag-shared {
    display:inline-block; padding:5px 12px; border-radius:100px;
    background:${G.tealDim}; border:1px solid rgba(0,164,154,0.25);
    color:${G.teal}; font-size:11.5px; font-family:'Outfit',sans-serif;
    line-height:1.5; margin-bottom:4px;
  }
  .tag-mine {
    display:inline-block; padding:5px 12px; border-radius:100px;
    background:transparent; border:1px dashed ${G.border};
    color:${G.textSub}; font-size:11.5px; font-family:'Outfit',sans-serif;
    line-height:1.5; margin-bottom:4px;
  }
  .tag-unknown {
    display:inline-block; padding:5px 12px; border-radius:100px;
    background:transparent; border:1px dashed rgba(26,26,26,0.1);
    color:${G.textMuted}; font-size:11px; font-family:'Outfit',sans-serif;
    font-style:italic; line-height:1.5; margin-bottom:4px;
  }

  .dot-nav { display:flex; gap:6px; align-items:center; }
  .dot { width:5px; height:5px; border-radius:50%; background:${G.border}; transition:all .25s; }
  .dot.active { background:${G.teal}; transform:scale(1.3); }
  .dot.done   { background:rgba(0,164,154,0.35); }

  @media print {
    body { background:white !important; }
    .no-print { display:none !important; }
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
`;

/* ── API key helpers ──────────────────────────────────────────────── */
const API_KEY_STORAGE = "conversant_anthropic_key";
const getStoredKey = () => localStorage.getItem(API_KEY_STORAGE) || "";
const storeKey = (k) => localStorage.setItem(API_KEY_STORAGE, k);
const clearKey = () => localStorage.removeItem(API_KEY_STORAGE);

function anthropicHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };
}

/* ── App ──────────────────────────────────────────────────────────── */
const emptyState = () => ({
  topic:"", myName:"",
  counterparts:[emptyCP("")],
  my:{ purpose:[], concerns:[], cir:[] },
});

export default function App() {
  const [s, setS]   = useState(emptyState());
  const [step, setStep] = useState(0);
  const [key, setKey]   = useState(0);
  const [apiKey, setApiKey] = useState(getStoredKey);

  const upS  = fn => setS(p => fn(p));
  const upMy = (k,v) => upS(p=>({...p,my:{...p.my,[k]:v}}));
  const toggleMy = (k,v) => upS(p=>{
    const a=p.my[k];
    return {...p,my:{...p.my,[k]:a.includes(v)?a.filter(x=>x!==v):[...a,v]}};
  });
  const upCP = (idx,k,v) => upS(p=>({
    ...p, counterparts:p.counterparts.map((c,i)=>i===idx?{...c,[k]:v}:c)
  }));
  const toggleCP = (idx,k,v) => upS(p=>({
    ...p, counterparts:p.counterparts.map((c,i)=>i!==idx?c:{...c,[k]:c[k].includes(v)?c[k].filter(x=>x!==v):[...c[k],v]})
  }));

  const totalSteps = 4 + s.counterparts.length * 3;

  const nav   = d => { setStep(n=>n+d); setKey(k=>k+1); };
  const navTo = n => { setStep(n);      setKey(k=>k+1); };

  const getInfo = n => {
    if (n===0) return {type:"setup"};
    if (n===1) return {type:"my-purpose"};
    if (n===2) return {type:"my-concerns"};
    if (n===3) return {type:"my-cir"};
    if (n>=totalSteps) return {type:"results"};
    return {type:"cp", cpIdx:Math.floor((n-4)/3), sub:(n-4)%3};
  };
  const info = getInfo(step);
  const cp   = info.cpIdx!==undefined ? s.counterparts[info.cpIdx] : null;
  const cpNm = cp ? (cp.name||`Person ${info.cpIdx+1}`) : "";

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:G.bg, minHeight:"100vh", color:G.text, position:"relative" }}>
      <style>{CSS}</style>
      <div style={{ position:"fixed", top:-100, left:"50%", transform:"translateX(-50%)", width:480, height:260, background:"radial-gradient(ellipse, rgba(0,164,154,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div key={key} className="screen" style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        {info.type!=="results" && (
          <div style={{ padding:"26px 32px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, letterSpacing:".18em", textTransform:"uppercase", color:G.teal, fontWeight:600 }}>Conversant</span>
            {step>0 && <DotNav step={step} total={totalSteps} />}
          </div>
        )}

        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding: info.type==="results" ? "32px 32px 56px" : "48px 32px 40px", maxWidth:660, margin:"0 auto", width:"100%" }}>

          {info.type==="setup" && <Setup s={s} upS={upS} apiKey={apiKey} setApiKey={k=>{setApiKey(k);storeKey(k);}} clearKey={()=>{setApiKey("");clearKey();}} next={()=>nav(1)} />}

          {info.type==="my-purpose" && (
            <SelectStep supra="In this interaction" stem="I am trying to..."
              note="Select all that apply." items={PURPOSES} sel={s.my.purpose}
              toggle={v=>toggleMy("purpose",v)} canNext={s.my.purpose.length>0}
              onBack={()=>nav(-1)} onNext={()=>nav(1)} />
          )}
          {info.type==="my-concerns" && (
            <SelectStep supra="About this interaction" stem="What worries me is that..."
              note="Select all that apply." items={CONCERNS} sel={s.my.concerns}
              toggle={v=>toggleMy("concerns",v)}
              onBack={()=>nav(-1)} onNext={()=>nav(1)} />
          )}
          {info.type==="my-cir" && (
            <SelectStep supra="Going in, I have to account for the fact that..."
              note="Select all that apply." items={CIRCUMSTANCES} sel={s.my.cir}
              toggle={v=>toggleMy("cir",v)}
              onBack={()=>nav(-1)} onNext={()=>nav(1)} />
          )}

          {info.type==="cp" && info.sub===0 && (
            <SelectStep
              supra={`${cpNm}${s.counterparts.length>1?` (${info.cpIdx+1} of ${s.counterparts.length})`:""}  |  Purpose`}
              stem={`In this interaction, ${cpNm} is probably trying to...`}
              note="Your best hypothesis. Select all that apply."
              items={PURPOSES} sel={cp.purpose} faded={cp.purposeDK}
              toggle={v=>{ if(cp.purposeDK) upCP(info.cpIdx,"purposeDK",false); toggleCP(info.cpIdx,"purpose",v); }}
              dkLabel="I don't know yet" dk={cp.purposeDK}
              onDK={()=>{ upCP(info.cpIdx,"purposeDK",!cp.purposeDK); if(!cp.purposeDK) upCP(info.cpIdx,"purpose",[]); }}
              canNext={cp.purpose.length>0||cp.purposeDK}
              onBack={()=>nav(-1)} onNext={()=>nav(1)} />
          )}
          {info.type==="cp" && info.sub===1 && (
            <SelectStep
              supra={`${cpNm}  |  Concerns`}
              stem={`What worries ${cpNm} is that...`}
              note="Your best hypothesis. Select all that apply."
              items={CONCERNS} sel={cp.concerns} faded={cp.concernsDK}
              toggle={v=>{ if(cp.concernsDK) upCP(info.cpIdx,"concernsDK",false); toggleCP(info.cpIdx,"concerns",v); }}
              dkLabel="I don't know yet" dk={cp.concernsDK}
              onDK={()=>{ upCP(info.cpIdx,"concernsDK",!cp.concernsDK); if(!cp.concernsDK) upCP(info.cpIdx,"concerns",[]); }}
              onBack={()=>nav(-1)} onNext={()=>nav(1)} />
          )}
          {info.type==="cp" && info.sub===2 && (
            <SelectStep
              supra={`${cpNm}  |  Circumstances`}
              stem={`${cpNm} has to account for the fact that...`}
              note="Select what you think applies to them."
              items={CIRCUMSTANCES} sel={cp.cir} faded={cp.cirDK}
              toggle={v=>{ if(cp.cirDK) upCP(info.cpIdx,"cirDK",false); toggleCP(info.cpIdx,"cir",v); }}
              dkLabel="I don't know yet" dk={cp.cirDK}
              onDK={()=>{ upCP(info.cpIdx,"cirDK",!cp.cirDK); if(!cp.cirDK) upCP(info.cpIdx,"cir",[]); }}
              onBack={()=>nav(-1)} onNext={()=>nav(1)}
              nextLabel={step===totalSteps-1?"See the map":"Continue"} />
          )}

          {info.type==="results" && (
            <Results s={s} apiKey={apiKey} reset={()=>{ setS(emptyState()); navTo(0); }} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── DotNav ───────────────────────────────────────────────────────── */
function DotNav({step,total}) {
  return (
    <div className="dot-nav">
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} className={`dot${i===step?" active":i<step?" done":""}`} />
      ))}
    </div>
  );
}

/* ── Setup ────────────────────────────────────────────────────────── */
function Setup({s,upS,apiKey,setApiKey,clearKey,next}) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div>
      <div style={{marginBottom:44}}>
        <div style={{fontFamily:"'Cormorant',serif",fontSize:42,fontWeight:500,lineHeight:1.1,color:G.text,marginBottom:14}}>
          Conversation Prep Chart 2.0
        </div>
        <div style={{fontSize:15,color:G.textSub,lineHeight:1.7}}>Map the intersection of purposes, concerns, and circumstances before you walk in.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:440}}>
        <input className="field" placeholder="What's this conversation about?" value={s.topic} onChange={e=>upS(p=>({...p,topic:e.target.value}))} />
        <input className="field" placeholder="Your name (optional)" value={s.myName} onChange={e=>upS(p=>({...p,myName:e.target.value}))} style={{maxWidth:260}} />
        <div style={{marginTop:8}}>
          <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:G.textMuted,marginBottom:12,fontWeight:500}}>Who's in the room?</div>
          {s.counterparts.map((cp,idx)=>(
            <div key={idx} style={{display:"flex",gap:8,marginBottom:9,alignItems:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:cpColor(idx).bg,border:`1.5px solid ${cpColor(idx).border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10.5,color:cpColor(idx).dot,fontWeight:600}}>{cp.name?cp.name[0].toUpperCase():idx+1}</span>
              </div>
              <input className="field" placeholder={`Person ${idx+1}`} value={cp.name} onChange={e=>upS(p=>({...p,counterparts:p.counterparts.map((c,i)=>i===idx?{...c,name:e.target.value}:c)}))} style={{padding:"11px 16px",fontSize:13.5}} />
              {s.counterparts.length>1 && (
                <button onClick={()=>upS(p=>({...p,counterparts:p.counterparts.filter((_,i)=>i!==idx)}))} style={{background:"none",border:"none",cursor:"pointer",color:G.textMuted,fontSize:20,lineHeight:1,padding:"0 4px"}}>x</button>
              )}
            </div>
          ))}
          <button onClick={()=>upS(p=>({...p,counterparts:[...p.counterparts,emptyCP("")]}))} style={{background:"none",border:`1px dashed ${G.border}`,borderRadius:100,padding:"8px 18px",cursor:"pointer",fontSize:12.5,color:G.textMuted,fontFamily:"'Outfit',sans-serif",marginTop:4,transition:"all .18s"}}>
            + add person
          </button>
        </div>

        {/* API key */}
        <div style={{marginTop:16,padding:"18px 20px",borderRadius:14,background:G.surface2,border:`1px solid ${G.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:apiKey?"0":"10"}}>
            <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:G.textMuted,fontWeight:500}}>
              AI features
            </div>
            {apiKey && (
              <button onClick={()=>setShowKey(!showKey)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:G.teal,fontFamily:"'Outfit',sans-serif"}}>
                {showKey?"hide":"change key"}
              </button>
            )}
          </div>
          {apiKey && !showKey ? (
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#2E7D2E"}} />
              <span style={{fontSize:12.5,color:G.textSub}}>API key saved — AI insights will appear in results</span>
            </div>
          ) : (
            <>
              <div style={{fontSize:12,color:G.textSub,lineHeight:1.6,marginBottom:10}}>
                Paste your Anthropic API key to enable AI-generated insights on the results page. Your key is stored only in this browser.
              </div>
              <div style={{display:"flex",gap:8}}>
                <input
                  className="field"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={e=>setApiKey(e.target.value)}
                  style={{padding:"10px 14px",fontSize:13}}
                />
                {apiKey && (
                  <button onClick={()=>{clearKey();}} style={{background:"none",border:`1px solid ${G.border}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:11,color:G.textMuted,fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap"}}>
                    Clear
                  </button>
                )}
              </div>
              <div style={{fontSize:10.5,color:G.textMuted,marginTop:8,lineHeight:1.5}}>
                Without a key, the chart still works — AI sections will be skipped.
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{marginTop:40}}>
        <button className="btn-primary" onClick={next}>Begin</button>
      </div>
    </div>
  );
}

/* ── SelectStep ───────────────────────────────────────────────────── */
function SelectStep({supra,stem,note,items,sel,toggle,faded,dk,onDK,dkLabel,canNext=true,onBack,onNext,nextLabel="Continue"}) {
  return (
    <div>
      {supra && <div style={{fontSize:11,letterSpacing:".12em",textTransform:"uppercase",color:G.teal,marginBottom:18,fontWeight:600}}>{supra}</div>}
      {stem  && <div style={{fontFamily:"'Cormorant',serif",fontSize:30,fontWeight:500,lineHeight:1.3,color:G.text,marginBottom:10}}>{stem}</div>}
      {note  && <div style={{fontSize:13,color:G.textMuted,marginBottom:28}}>{note}</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:9,marginBottom:32}}>
        {items.map(item=>(
          <button key={item} className={`chip${sel.includes(item)&&!faded?" sel":""}`} style={faded?{opacity:0.3}:{}} onClick={()=>toggle(item)}>
            <span className="check">
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {item}
          </button>
        ))}
        {dkLabel && (
          <button className={`chip dk${dk?" sel":""}`} onClick={onDK}>
            <span className="check">
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {dkLabel}
          </button>
        )}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!canNext}>{nextLabel}</button>
      </div>
    </div>
  );
}

/* ── Results ──────────────────────────────────────────────────────── */
function Results({s,apiKey,reset}) {
  const [aiText,       setAiText]       = useState(null);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [curiosityByCP,setCuriosityByCP]= useState([]);
  const [curiosityLoading,setCuriosityLoading]= useState(false);
  const [openingQs,    setOpeningQs]    = useState([]);
  const [openingLoading,setOpeningLoading]= useState(false);

  const meName = s.myName || "You";
  const allNames = [meName, ...s.counterparts.map((cp,i)=>cp.name||`Person ${i+1}`)];

  /* ─ Derived sets ─ */
  const cpPurposes  = s.counterparts.flatMap(cp=>cp.purposeDK ?[]:cp.purpose);
  const cpConcerns  = s.counterparts.flatMap(cp=>cp.concernsDK?[]:cp.concerns);
  const cpCir       = s.counterparts.flatMap(cp=>cp.cirDK     ?[]:cp.cir);

  const sharedP  = s.my.purpose.filter(p=>cpPurposes.includes(p));
  const myOnlyP  = s.my.purpose.filter(p=>!cpPurposes.includes(p));
  const sharedC  = s.my.concerns.filter(c=>cpConcerns.includes(c));
  const myOnlyC  = s.my.concerns.filter(c=>!cpConcerns.includes(c));
  const sharedSi = s.my.cir.filter(si=>cpCir.includes(si));
  const myOnlySi = s.my.cir.filter(si=>!cpCir.includes(si));

  const anyPDK  = s.counterparts.some(cp=>cp.purposeDK);
  const anyCDK  = s.counterparts.some(cp=>cp.concernsDK);
  const anySiDK = s.counterparts.some(cp=>cp.cirDK);

  const intersections = [
    ...sharedP.map(p=>`Everyone trying to: ${p}`),
    ...sharedC.map(c=>`Everyone worried that: ${c}`),
    ...sharedSi.map(si=>`Everyone dealing with: ${si}`),
  ];

  /* ─ Helper: per-item attribution ─ */
  const whoSelected = (item, key) =>
    s.counterparts.map((cp,i)=>({cp,i})).filter(({cp})=>!cp[`${key}DK`]&&cp[key].includes(item));

  /* ─ Candidate curiosity questions ─ */
  const buildCandidates = () => s.counterparts.map((cp,idx)=>{
    const nm = cp.name||`Person ${idx+1}`;
    const qs = [
      ...(cp.purposeDK  ? [`What is ${nm} most trying to accomplish here?`]
                        : cp.purpose.filter(p=>!s.my.purpose.includes(p)).map(p=>PQ[p]?.(nm))),
      ...(cp.concernsDK ? [`What is ${nm} most worried might go wrong?`]
                        : cp.concerns.filter(c=>!s.my.concerns.includes(c)).map(c=>CQ[c]?.(nm))),
      ...(cp.cirDK      ? [`What circumstances is ${nm} navigating that you can't fully see?`]
                        : cp.cir.filter(si=>!s.my.cir.includes(si)).map(si=>SQ[si]?.(nm))),
    ].filter(Boolean);
    return {nm,qs,cp};
  }).filter(g=>g.qs.length>0);

  /* ─ API helpers ─ */
  const parseJSON = raw => {
    const clean = (raw||"").replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
    return JSON.parse(clean);
  };

  const contextBlock = () => `
My purposes: ${s.my.purpose.join("; ")||"not specified"}
My concerns: ${s.my.concerns.join("; ")||"not specified"}
My circumstances: ${s.my.cir.join("; ")||"not specified"}

${s.counterparts.map((cp,i)=>{
    const nm=cp.name||`Person ${i+1}`;
    return `${nm}'s purposes: ${cp.purposeDK?"unknown":cp.purpose.join("; ")||"not specified"}
${nm}'s concerns: ${cp.concernsDK?"unknown":cp.concerns.join("; ")||"not specified"}
${nm}'s circumstances: ${cp.cirDK?"unknown":cp.cir.join("; ")||"not specified"}`;
  }).join("\n\n")}

Shared intersection: ${intersections.join("; ")||"none identified yet"}
Unknown items: ${[
    ...s.counterparts.some(cp=>cp.purposeDK)?["their purpose"]:[],
    ...s.counterparts.some(cp=>cp.concernsDK)?["their concerns"]:[],
    ...s.counterparts.some(cp=>cp.cirDK)?["their circumstances"]:[],
  ].join(", ")||"none"}`.trim();

  /* ─ Authentic purpose ─ */
  const callAI = async () => {
    if (!apiKey) return;
    setAiLoading(true);
    try {
      const prompt = intersections.length>0
        ? `You are helping someone prepare for an important work conversation using the Conversant Conversation Prep Chart framework.
People in the room: ${allNames.join(", ")}
Group intersection , what everyone shares:
${intersections.map(i=>`- ${i}`).join("\n")}
Write ONE paragraph (2-3 sentences, max 60 words) expressing the authentic purpose of this conversation , the magnetic meeting point everyone could genuinely get behind. Direct, honest, human. Not corporate. Not a list. Start from what this conversation is FOR. Make it feel worth showing up for. No preamble, no label. Just the paragraph.`
        : `You are helping someone prepare for an important work conversation using the Conversant Conversation Prep Chart framework.
People in the room: ${allNames.join(", ")}
No items overlapped yet between participants' selections. This is not a failure , the intersection has not been found yet, and this conversation is the opportunity to create it.
What each person is carrying:
${[`${meName}: purposes: ${s.my.purpose.join("; ")||"not specified"}; concerns: ${s.my.concerns.join("; ")||"not specified"}; circumstances: ${s.my.cir.join("; ")||"not specified"}`,
   ...s.counterparts.map((cp,i)=>{const nm=cp.name||`Person ${i+1}`;return `${nm}: purposes: ${cp.purposeDK?"unknown":cp.purpose.join("; ")||"not specified"}; concerns: ${cp.concernsDK?"unknown":cp.concerns.join("; ")||"not specified"}; circumstances: ${cp.cirDK?"unknown":cp.cir.join("; ")||"not specified"}`;})
  ].join("\n")}
Given what each person is carrying, write ONE paragraph (2-3 sentences, max 60 words) naming the conversation only these people can have together , the one that would be lost if they don't have it. Not what they agree on, but what makes their being in the room together necessary. Direct, honest, human. No preamble, no label. Just the paragraph.`;

      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:anthropicHeaders(apiKey),body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const d = await res.json();
      const t = d.content?.find(b=>b.type==="text")?.text;
      if (t) setAiText(t.trim());
    } catch(e){console.error(e);}
    setAiLoading(false);
  };

  /* ─ Curiosity questions ─ */
  const curateCuriosityQuestions = async (candidates) => {
    if (!apiKey) { setCuriosityByCP(candidates.map(({nm,qs})=>({nm,qs:qs.slice(0,3)}))); return; }
    setCuriosityLoading(true);
    try {
      const results = await Promise.all(candidates.map(async ({nm,qs,cp})=>{
        if (qs.length<=2) return {nm,qs};
        const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:anthropicHeaders(apiKey),body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`You are helping someone prepare a work conversation using the Conversant Conversation Prep Chart framework.
${contextBlock()}
Candidate questions to ask ${nm}:
${qs.map((q,i)=>`${i+1}. ${q}`).join("\n")}
Select the 2 or 3 questions that would most open up the conversation and reduce resistance , prioritizing the biggest unknown, the widest gap, or the concern most likely to block progress. Return ONLY a raw JSON array of the selected question strings. No markdown fences, no preamble.`}]})});
        const d = await res.json();
        const raw = d.content?.find(b=>b.type==="text")?.text?.trim()||"";
        try { const p=parseJSON(raw); if(Array.isArray(p)&&p.length>0) return {nm,qs:p.slice(0,3)}; } catch(e){console.error("curiosity parse:",e,raw);}
        return {nm,qs:qs.slice(0,3)};
      }));
      setCuriosityByCP(results);
    } catch(e){
      setCuriosityByCP(buildCandidates().map(({nm,qs})=>({nm,qs:qs.slice(0,3)})));
    }
    setCuriosityLoading(false);
  };

  /* ─ Opening questions ─ */
  const callOpeningAI = async () => {
    if (!apiKey) return;
    setOpeningLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:anthropicHeaders(apiKey),body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`You are helping someone prepare for an important work conversation using the Conversant framework.

${contextBlock()}

Your task: Generate 2 or 3 questions that this person could offer in the conversation to open up the authentic purpose together , questions that invite the group to build something, not just report their positions.

Rules:
- Questions must be rooted in a specific tension, gap, or pattern visible in the data above. No generic questions.
- They must be genuinely open , pointing toward the intersection, not toward a predetermined answer.
- They are designed to be spoken aloud to the group, not for private reflection.
- If there are unknown items, at least one question should create space for what's not yet on the table.
- If the person's own purposes and concerns are in tension, one question should surface that tension in a way that invites others to engage with it, not resolve it.
- Maximum 25 words per question.
- Return ONLY a raw JSON array of question strings. No markdown fences, no preamble. Example: ["Question one?","Question two?"]`}]})});
      const d = await res.json();
      const raw = d.content?.find(b=>b.type==="text")?.text?.trim()||"";
      try {
        const p = parseJSON(raw);
        if (Array.isArray(p)&&p.length>0){setOpeningQs(p.slice(0,3));setOpeningLoading(false);return;}
      } catch(e){console.error("opening parse:",e,raw);}
    } catch(e){console.error(e);}
    setOpeningLoading(false);
  };

  useEffect(()=>{
    callAI();
    const candidates = buildCandidates();
    if (candidates.length>0) curateCuriosityQuestions(candidates);
    callOpeningAI();
  },[]);

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:11,letterSpacing:".18em",textTransform:"uppercase",color:G.teal,fontWeight:600,marginBottom:10}}>Conversant</div>
          <div style={{fontFamily:"'Cormorant',serif",fontSize:32,fontWeight:500,lineHeight:1.2}}>
            {s.topic||"Your intersection map"}
          </div>
        </div>
        <div style={{display:"flex",gap:8}} className="no-print">
          <button className="btn-export" onClick={()=>window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="btn-ghost" onClick={reset} style={{fontSize:12.5,padding:"9px 16px"}}>Start over</button>
        </div>
      </div>

      {/* People legend */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {/* Me */}
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px 7px 10px",borderRadius:100,background:G.tealDim,border:`1px solid rgba(0,164,154,0.25)`}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:G.teal,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:9.5,color:"#fff",fontWeight:700}}>{meName[0].toUpperCase()}</span>
          </div>
          <span style={{fontSize:12.5,color:G.teal,fontWeight:500}}>{meName}</span>
        </div>
        {/* Counterparts */}
        {s.counterparts.map((cp,i)=>{
          const nm=cp.name||`Person ${i+1}`;
          const c=cpColor(i);
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px 7px 10px",borderRadius:100,background:c.bg,border:`1px solid ${c.border}`}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:c.dot,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:9.5,color:"#fff",fontWeight:700}}>{nm[0].toUpperCase()}</span>
              </div>
              <span style={{fontSize:12.5,color:c.text,fontWeight:500}}>{nm}</span>
            </div>
          );
        })}
      </div>

      {/* Map */}
      <MapGrid
        my={s.my} counterparts={s.counterparts} meName={meName}
        sharedP={sharedP} myOnlyP={myOnlyP} anyPDK={anyPDK}
        sharedC={sharedC} myOnlyC={myOnlyC} anyCDK={anyCDK}
        sharedSi={sharedSi} myOnlySi={myOnlySi} anySiDK={anySiDK}
        whoSelected={whoSelected}
      />

      {/* Authentic purpose (AI) */}
      {apiKey && (
        <div style={{marginTop:24,marginBottom:28}}>
          <div style={{borderRadius:16,padding:"26px 28px",background:"#F0FDFB",border:`1px solid rgba(0,164,154,0.22)`}}>
            <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:G.teal,fontWeight:600,marginBottom:14}}>
              {intersections.length>0?"Authentic purpose":"The conversation to create"}
            </div>
            {aiLoading
              ? <div style={{color:G.textSub,fontSize:13.5}}>Generating...</div>
              : aiText
                ? <div style={{fontFamily:"'Cormorant',serif",fontSize:22,lineHeight:1.65,color:"#00433F",fontWeight:400}}>{aiText}</div>
                : <div style={{color:G.textSub,fontSize:13.5}}>...</div>
            }
          </div>
        </div>
      )}

      {/* Curiosity questions */}
      {(curiosityLoading||curiosityByCP.length>0) && (
        <div style={{marginBottom:32}}>
          <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:G.textMuted,fontWeight:600,marginBottom:18}}>Bring these with curiosity</div>
          {curiosityLoading
            ? <div style={{fontSize:13.5,color:G.textSub,padding:"12px 0"}}>Selecting the best questions...</div>
            : curiosityByCP.map((group,gi)=>(
              <div key={gi} style={{marginBottom:20}}>
                {curiosityByCP.length>1 && (
                  <div style={{fontSize:11,fontWeight:600,color:cpColor(gi).dot,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>{group.nm}</div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {group.qs.map((q,i)=>(
                    <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"13px 17px",borderRadius:12,background:G.surface,border:`1px solid ${G.border}`}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:G.tealDim,border:`1px solid ${G.teal}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        <span style={{fontSize:9.5,fontWeight:700,color:G.teal}}>{i+1}</span>
                      </div>
                      <div style={{fontSize:14,lineHeight:1.7,color:G.textSub}}>{q}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Opening questions (AI) */}
      {apiKey && (openingLoading||openingQs.length>0) && (
        <div style={{background:"#F6FBF9",border:`1.5px solid rgba(0,164,154,0.18)`,borderRadius:18,padding:"28px 28px 24px",marginTop:8}}>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:G.teal,fontWeight:700,marginBottom:6}}>To open the conversation</div>
            <div style={{fontSize:13,color:G.textSub,lineHeight:1.6}}>Questions you can offer in the room to build the purpose together.</div>
          </div>
          {openingLoading
            ? <div style={{fontSize:13.5,color:G.textSub}}>Generating questions...</div>
            : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {openingQs.map((q,i)=>(
                  <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"16px 20px",borderRadius:12,background:"#FFFFFF",border:`1px solid rgba(0,164,154,0.15)`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:G.teal,borderRadius:"3px 0 0 3px"}} />
                    <div style={{width:22,height:22,borderRadius:"50%",background:G.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{i+1}</span>
                    </div>
                    <div style={{fontSize:14.5,lineHeight:1.7,color:G.text,fontWeight:400}}>{q}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

/* ── MapGrid ──────────────────────────────────────────────────────── */
function MapGrid({my,counterparts,meName,sharedP,myOnlyP,anyPDK,sharedC,myOnlyC,anyCDK,sharedSi,myOnlySi,anySiDK,whoSelected}) {
  const hasPRow  = my.purpose.length||counterparts.some(cp=>cp.purpose.length||cp.purposeDK);
  const hasCRow  = my.concerns.length||counterparts.some(cp=>cp.concerns.length||cp.concernsDK);
  const hasSiRow = my.cir.length    ||counterparts.some(cp=>cp.cir.length    ||cp.cirDK);

  const totalShared = sharedP.length+sharedC.length+sharedSi.length;

  return (
    <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${G.border}`,background:G.surface,marginBottom:4}}>
      {/* Column headers */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.1fr 1fr",borderBottom:`1px solid ${G.border}`}}>
        {[meName,"Intersection","Others"].map((h,i)=>(
          <div key={i} style={{padding:"13px 15px",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",fontWeight:600,color:i===1?G.teal:G.textMuted,textAlign:"center",borderRight:i<2?`1px solid ${G.border}`:"none",background:i===1?"rgba(0,164,154,0.04)":"transparent"}}>{h}</div>
        ))}
      </div>

      <div style={{position:"relative"}}>
        {totalShared>0 && <div style={{position:"absolute",top:0,left:"33.33%",width:"33.33%",bottom:0,background:"linear-gradient(to bottom,rgba(0,164,154,0.04),rgba(0,164,154,0.02))",pointerEvents:"none",zIndex:0}} />}

        {hasPRow  && <MapRow label="Purpose"      myItems={myOnlyP}  sharedItems={sharedP}  counterparts={counterparts} dimKey="purposeDK"  cpKey="purpose"  whoSel={item=>whoSelected(item,"purpose")}  anyDK={anyPDK} />}
        {hasCRow  && <MapRow label="Concerns"     myItems={myOnlyC}  sharedItems={sharedC}  counterparts={counterparts} dimKey="concernsDK" cpKey="concerns" whoSel={item=>whoSelected(item,"concerns")} anyDK={anyCDK} />}
        {hasSiRow && <MapRow label="Circumstances" myItems={myOnlySi} sharedItems={sharedSi} counterparts={counterparts} dimKey="cirDK"      cpKey="cir"      whoSel={item=>whoSelected(item,"cir")}      anyDK={anySiDK} isLast />}
      </div>
    </div>
  );
}

function MapRow({label,myItems,sharedItems,counterparts,dimKey,cpKey,whoSel,anyDK,isLast=false}) {
  const allTheirItems = [...new Set(counterparts.flatMap(cp=>cp[dimKey]?[]:cp[cpKey]))];
  const theirOnlyItems = allTheirItems.filter(it=>!myItems.includes(it)&&!sharedItems.includes(it));

  return (
    <div style={{position:"relative",zIndex:1,borderBottom:isLast?"none":`1px solid ${G.border}`}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.1fr 1fr"}}>
        {/* Mine */}
        <div style={{padding:"13px 13px",borderRight:`1px solid ${G.border}`,minHeight:50}}>
          <div style={{fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:G.textMuted,marginBottom:7,fontWeight:500}}>{label}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {myItems.map((it,i)=><span key={i} className="tag-mine">{it}</span>)}
          </div>
        </div>
        {/* Shared */}
        <div style={{padding:"13px 13px",borderRight:`1px solid ${G.border}`,background:sharedItems.length?"rgba(0,164,154,0.04)":"transparent",minHeight:50}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,paddingTop:16}}>
            {sharedItems.length>0
              ? sharedItems.map((it,i)=><span key={i} className="tag-shared">{it}</span>)
              : <div style={{fontSize:11,color:G.textMuted,textAlign:"center",width:"100%",paddingTop:2}}>-</div>
            }
          </div>
        </div>
        {/* Theirs */}
        <div style={{padding:"13px 13px",minHeight:50}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,paddingTop:16}}>
            {theirOnlyItems.map((it,i)=>{
              const authors = whoSel(it);
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4,width:"100%"}}>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    {authors.map(({i:ci,cp:acp})=>(
                      <div key={ci} style={{width:8,height:8,borderRadius:"50%",background:cpColor(ci).dot,flexShrink:0}} title={acp.name||`Person ${ci+1}`} />
                    ))}
                  </div>
                  <span className="tag-mine" style={{margin:0}}>{it}</span>
                </div>
              );
            })}
            {anyDK && counterparts.some(cp=>cp[dimKey]) && (
              <span className="tag-unknown">not sure yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
