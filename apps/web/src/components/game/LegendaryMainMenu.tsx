import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronRight, Gamepad2, Map, Settings, Sparkles, Swords, UserRound } from "lucide-react";
import { useRunner } from "../../lib/stores/useRunner";

export default function LegendaryMainMenu() {
  const [selected, setSelected] = useState(0);
  const setGameState = useRunner((s) => s.setGameState);
  const setTrainingSession = useRunner((s) => s.setTrainingSession);
  const profiles = useRunner((s) => s.profiles);
  const activeProfileIndex = useRunner((s) => s.activeProfileIndex);
  const totalScore = useRunner((s) => s.totalScore);
  const completed = useRunner((s) => s.completedStoryMissionIds);
  const lastPlayed = profiles?.[activeProfileIndex]?.lastPlayedTitle;

  const items = useMemo(() => [
    { id:"continue", label:lastPlayed ? "CONTINUE" : "STORY", detail:lastPlayed ? lastPlayed : "Begin the Raging City campaign", icon:Map, action:()=>setGameState("campaign-map"), accent:"text-amber-300" },
    { id:"adventure", label:"ADVENTURE", detail:"Roam, train and explore the city", icon:Gamepad2, action:()=>{setTrainingSession(false);setGameState("adventure");}, accent:"text-cyan-300" },
    { id:"combat", label:"COMBAT ARENA", detail:"1v1 battles and mastery", icon:Swords, action:()=>setGameState("versus-select"), accent:"text-rose-300" },
    { id:"characters", label:"CHARACTERS", detail:"Fighters, forms and customization", icon:UserRound, action:()=>setGameState("customization"), accent:"text-purple-300" },
    { id:"archive", label:"LEGENDS ARCHIVE", detail:"Lore, bloodlines, factions and memories", icon:BookOpen, action:()=>setGameState("lore-hub"), accent:"text-sky-300" },
    { id:"settings", label:"SETTINGS", detail:"Audio, graphics and controls", icon:Settings, action:()=>setGameState("settings"), accent:"text-slate-300" },
  ], [lastPlayed, setGameState, setTrainingSession]);

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(e.key==="ArrowDown"||e.key.toLowerCase()==="s"){e.preventDefault();setSelected(v=>(v+1)%items.length);}
      else if(e.key==="ArrowUp"||e.key.toLowerCase()==="w"){e.preventDefault();setSelected(v=>(v-1+items.length)%items.length);}
      else if(e.key==="Enter"||e.key===" "){e.preventDefault();items[selected]?.action();}
    };
    window.addEventListener("keydown",key); return()=>window.removeEventListener("keydown",key);
  },[items,selected]);

  const level=Math.floor(totalScore/1000)+1;

  return (
    <div data-testid="new-main-menu" className="relative h-screen w-full overflow-hidden bg-[#020308] text-white">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:'url("/brand/kai-jax-vs-architect.png")'}}/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,8,.98)_0%,rgba(2,3,8,.90)_34%,rgba(2,3,8,.28)_66%,rgba(2,3,8,.72)_100%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,transparent_0%,rgba(2,3,8,.08)_32%,rgba(2,3,8,.82)_100%)]"/>
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-transparent via-cyan-300/70 to-transparent"/>

      <main className="relative z-10 flex h-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-14">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black tracking-[.42em] text-amber-300">THE RAGING CITY SAGA</p>
            <h1 className="mt-2 font-['Bebas_Neue'] text-4xl sm:text-5xl leading-none">LEGENDS OF <span className="text-cyan-300">KAI-JAX</span></h1>
            <p className="mt-1 text-[10px] font-bold tracking-[.34em] text-white/40">THE MEMORY HERO</p>
          </div>
          <div className="hidden sm:block border-r-2 border-cyan-300/70 pr-4 text-right">
            <p className="text-[10px] tracking-[.28em] text-white/40">MEMORY PROFILE {activeProfileIndex+1}</p>
            <p className="mt-1 text-sm font-black">LEVEL {level} · {completed.length} MEMORIES CLEARED</p>
          </div>
        </header>

        <section className="my-auto w-full max-w-xl">
          <p className="mb-4 text-xs font-black tracking-[.35em] text-white/40">{lastPlayed ? "RESUME YOUR LEGEND" : "CHOOSE YOUR PATH"}</p>
          <div className="space-y-1.5">
            {items.map((item,index)=>{
              const active=index===selected; const Icon=item.icon;
              return <button key={item.id} data-testid={`main-menu-${item.id}`} onMouseEnter={()=>setSelected(index)} onClick={item.action}
                className={`group flex w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-all ${active?"border-amber-300 bg-white/10 translate-x-2":"border-white/10 bg-black/25 hover:bg-white/5"}`}>
                <Icon className={`h-5 w-5 shrink-0 ${active?item.accent:"text-white/35"}`}/>
                <div className="min-w-0 flex-1">
                  <p className={`font-['Bebas_Neue'] text-2xl tracking-[.08em] ${active?"text-white":"text-white/72"}`}>{item.label}</p>
                  <p className="truncate text-xs text-white/38">{item.detail}</p>
                </div>
                <ChevronRight className={`h-5 w-5 transition ${active?"translate-x-1 text-amber-300":"text-white/15"}`}/>
              </button>;
            })}
          </div>
        </section>

        <footer className="flex items-end justify-between text-[10px] font-bold tracking-[.22em] text-white/30">
          <div><span className="text-cyan-300/70">↑ ↓</span> NAVIGATE · <span className="text-amber-300/70">ENTER</span> SELECT</div>
          <div className="hidden sm:flex items-center gap-2"><Sparkles className="h-3 w-3"/> ONE BODY · THREE IDENTITIES · ONE LEGEND</div>
        </footer>
      </main>
    </div>
  );
}
