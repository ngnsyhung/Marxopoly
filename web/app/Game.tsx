"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Delta, events, GameEvent, playerColors, playerSymbols, tiles } from "./game-data";
import CourseGraphic from "./CourseGraphic";
import ExploreMap from "./ExploreMap";
import SplashScreen from "./SplashScreen";
import TrailerVideo from "./TrailerVideo";

const Dice3D = dynamic(() => import("./Dice3D"), {
  ssr: false,
  loading: () => <div className="dice-model dice-model--loading" aria-hidden="true"><span>…</span></div>,
});

const AudioContextConstructor = typeof window !== "undefined"
  ? window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  : undefined;
const audioCtx = AudioContextConstructor ? new AudioContextConstructor() : null;

function playSound(type: "move" | "buy" | "cash") {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === "move") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } else if (type === "buy") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === "cash") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }
}

function playDiceRollSound() {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") void audioCtx.resume();
  const start = audioCtx.currentTime;

  for (let hit = 0; hit < 22; hit += 1) {
    const duration = 0.035 + Math.random() * 0.025;
    const buffer = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      const envelope = 1 - index / samples.length;
      samples[index] = (Math.random() * 2 - 1) * envelope * envelope;
    }
    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 520 + Math.random() * 1250;
    filter.Q.value = 1.1;
    const volume = 0.12 * (1 - hit / 30);
    gain.gain.setValueAtTime(volume, start + hit * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, start + hit * 0.1 + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(start + hit * 0.1 + Math.random() * 0.025);
  }

  [0.56, 1.28, 2.08].forEach((delay, index) => {
    const impact = audioCtx.createOscillator();
    const impactGain = audioCtx.createGain();
    impact.type = "triangle";
    impact.frequency.setValueAtTime(145 - index * 18, start + delay);
    impact.frequency.exponentialRampToValueAtTime(70, start + delay + 0.055);
    impactGain.gain.setValueAtTime(0.1 - index * 0.02, start + delay);
    impactGain.gain.exponentialRampToValueAtTime(0.001, start + delay + 0.07);
    impact.connect(impactGain);
    impactGain.connect(audioCtx.destination);
    impact.start(start + delay);
    impact.stop(start + delay + 0.08);
  });
}

type Player = {
  name: string;
  color: string;
  symbol: string;
  position: number;
  cash: number;
  workers: number;
  factories: number;
  tech: number;
  surplus: number;
  society: number;
  happiness: number;
  integration: number;
  monopoly: number;
  lastProfits: number[];
};

type Phase = "setup" | "roll" | "manage" | "finished";
type Wage = "low" | "standard" | "fair";
type GuideTarget = { id: "map" | "trailer" | "infographic" | "play"; left: number; top: number; width: number; height: number };

const guideCopy = {
  map: { title: "BẢN ĐỒ KHÁM PHÁ", text: "Chạm để bước vào các câu chuyện và chọn hướng đi của bạn." },
  trailer: { title: "XEM TRAILER", text: "Mở video giới thiệu thế giới Marxopoly ở chế độ toàn màn hình." },
  infographic: { title: "KHÁM PHÁ INFOGRAPHIC", text: "Xem bức tranh lớn về các dòng chảy kinh tế trong game." },
  play: { title: "BẮT ĐẦU TRÒ CHƠI", text: "Chọn người chơi, đặt tên và vào bàn cờ." },
} as const;

function HomeGuide({ onDismiss }: { onDismiss: () => void }) {
  const [targets, setTargets] = useState<GuideTarget[]>([]);

  useEffect(() => {
    const updateTargets = () => setTargets(Array.from(document.querySelectorAll<HTMLElement>("[data-home-guide]")).map((element) => {
      const rect = element.getBoundingClientRect();
      return { id: element.dataset.homeGuide as GuideTarget["id"], left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }).filter((target) => target.width > 0 && target.height > 0));
    updateTargets();
    window.addEventListener("resize", updateTargets);
    window.addEventListener("scroll", updateTargets, true);
    return () => { window.removeEventListener("resize", updateTargets); window.removeEventListener("scroll", updateTargets, true); };
  }, []);

  return <motion.button type="button" className="home-guide" aria-label="Đóng hướng dẫn tương tác" onClick={onDismiss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <span className="home-guide-intro">KHÁM PHÁ MARXOPOLY <small>Nhấn bất kỳ đâu để bắt đầu</small></span>
    {targets.map((target) => <span key={target.id} className={`home-guide-target home-guide-target--${target.id}`} style={{ left: target.left, top: target.top, width: target.width, height: target.height }}>
      <span className="home-guide-tip"><b>{guideCopy[target.id].title}</b><small>{guideCopy[target.id].text}</small></span>
    </span>)}
  </motion.button>;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const money = (value: number) => `${value.toFixed(value % 1 ? 1 : 0)} V`;
const topicName: Record<GameEvent["topic"], string> = {
  T2: "Vận hành",
  T3: "Đầu tư",
  T4: "Cạnh tranh",
  T6: "Thế giới",
};

function newPlayer(name: string, index: number): Player {
  return {
    name,
    color: playerColors[index],
    symbol: playerSymbols[index],
    position: 0,
    cash: 20,
    workers: 5,
    factories: 1,
    tech: 3,
    surplus: 0,
    society: 50,
    happiness: 60,
    integration: 0,
    monopoly: 0,
    lastProfits: [],
  };
}

function tilePosition(id: number): React.CSSProperties {
  if (id === 0) return { gridColumn: 1, gridRow: 11 };
  if (id < 10) return { gridColumn: id + 1, gridRow: 11 };
  if (id === 10) return { gridColumn: 11, gridRow: 11 };
  if (id < 20) return { gridColumn: 11, gridRow: 21 - id };
  if (id === 20) return { gridColumn: 11, gridRow: 1 };
  if (id < 30) return { gridColumn: 31 - id, gridRow: 1 };
  if (id === 30) return { gridColumn: 1, gridRow: 1 };
  return { gridColumn: 1, gridRow: id - 29 };
}

function applyDelta(player: Player, delta: Delta): Player {
  return {
    ...player,
    cash: player.cash + (delta.cash ?? 0),
    workers: clamp(player.workers + (delta.workers ?? 0), 1, 10),
    factories: clamp(player.factories + (delta.factories ?? 0), 1, 5),
    tech: clamp(player.tech + (delta.tech ?? 0), 0, 12),
    surplus: Math.max(0, player.surplus + (delta.surplus ?? 0)),
    society: clamp(player.society + (delta.society ?? 0)),
    happiness: clamp(player.happiness + (delta.happiness ?? 0)),
    integration: clamp(player.integration + (delta.integration ?? 0), 0, 10),
    monopoly: clamp(player.monopoly + (delta.monopoly ?? 0), 0, 10),
  };
}

function score(player: Player, assetCount: number) {
  const netWorth = player.cash + assetCount * 8 + player.factories * 8 + player.tech * 2;
  const asset = clamp(netWorth);
  const surplus = clamp((player.surplus / 50) * 100);
  const avgProfit = player.lastProfits.length
    ? player.lastProfits.reduce((a, b) => a + b, 0) / player.lastProfits.length
    : 0;
  const profit = clamp((avgProfit / 80) * 100);
  const integration = player.integration * 10;
  let total = asset * 0.4 + surplus * 0.2 + profit * 0.15 + player.society * 0.15 + integration * 0.1;
  if (player.society < 30) total -= 15;
  if (player.happiness < 25) total -= 10;
  if (player.society >= 70 && player.happiness >= 70) total += 5;
  return { total: clamp(total), netWorth, asset, surplus, profit, integration };
}

export default function Game() {
  const [showSplash, setShowSplash] = useState(true);
  const [showHomeGuide, setShowHomeGuide] = useState(true);
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Tập đoàn Sao Việt", "Liên hiệp Tương Lai", "Công ty Đại Đồng", "Xí nghiệp Đông Dương"]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [owners, setOwners] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("setup");
  const [dice, setDice] = useState<[number, number]>([0, 0]);
  const [pendingEvent, setPendingEvent] = useState<GameEvent | null>(null);
  const [wage, setWage] = useState<Wage>("standard");
  const [demand, setDemand] = useState<-1 | 0 | 1>(0);
  const [produced, setProduced] = useState(false);
  const [message, setMessage] = useState("Chào mừng đến với thời đại công nghiệp 4.0.");
  const [log, setLog] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isRevealingDice, setIsRevealingDice] = useState(false);

  const active = players[current];
  const tile = active ? tiles[active.position] : tiles[0];
  const ranking = useMemo(
    () => players.map((player, index) => ({
      index,
      player,
      ...score(player, Object.values(owners).filter((owner) => owner === index).length),
    })).sort((a, b) => b.total - a.total),
    [players, owners],
  );

  useEffect(() => {
    if (phase !== "setup") {
      localStorage.setItem("ong-trum-tu-ban", JSON.stringify({ players, owners, current, round, phase, demand, log }));
    }
  }, [players, owners, current, round, phase, demand, log]);

  function addLog(text: string) {
    setLog((items) => [text, ...items].slice(0, 18));
    setMessage(text);
  }

  function updateActive(updater: (player: Player) => Player) {
    setPlayers((list) => list.map((player, index) => index === current ? updater(player) : player));
  }

  function startGame() {
    const roster = Array.from({ length: playerCount }, (_, index) => newPlayer(names[index].trim() || `Doanh nghiệp ${index + 1}`, index));
    setPlayers(roster);
    setOwners({});
    setCurrent(0);
    setRound(1);
    setDice([0, 0]);
    setDemand(0);
    setLog([]);
    setProduced(false);
    setIsRevealingDice(false);
    setPhase("roll");
    addLog(`${roster[0].name} mở màn cuộc cạnh tranh.`);
  }

  function drawEvent(topic?: GameEvent["topic"]) {
    const pool = topic ? events.filter((event) => event.topic === topic) : events;
    setPendingEvent(pool[Math.floor(Math.random() * pool.length)]);
  }

  function landingNarrative(landed: typeof tiles[number], player: Player) {
    const narratives: Record<typeof landed.kind, string[]> = {
      corner: [`${player.name} bước vào điểm chuyển pha của thị trường.`],
      factory: [player.workers < player.factories ? "Xưởng có công suất nhưng thiếu đội vận hành." : "Xưởng đang là nơi biến kế hoạch thành sản lượng."],
      technology: [player.tech < 3 ? "Công nghệ mới mở ra một lợi thế còn chưa được khai thác." : "Hệ công nghệ hiện tại có thể kết nối thêm một mắt xích mới."],
      industrial: [player.factories === 0 ? "Khu công nghiệp là cơ hội dựng năng lực sản xuất đầu tiên." : "Hạ tầng khu công nghiệp giúp tối ưu dòng hàng và thời gian."],
      realestate: [player.cash < 10 ? "Tài sản này hấp dẫn, nhưng dòng tiền cần được cân nhắc trước." : "Giá trị vị trí chỉ bền vững khi gắn với khai thác thực."],
      finance: [player.cash < 6 ? "Điểm vốn này có thể giúp xoay vòng, đồng thời tăng áp lực trả nợ." : "Nguồn vốn đang sẵn sàng cho một phương án phân bổ mới."],
      international: [player.integration < 3 ? "Đây là cửa ngõ đầu tiên để thử sức với thị trường bên ngoài." : "Mạng lưới quốc tế hiện có giúp chuyến đi này ít rủi ro hơn."],
      event: ["Một biến động mới đang chờ quyết định của doanh nghiệp."],
      regulation: [player.monopoly >= 5 ? "Quy mô lớn khiến doanh nghiệp cần minh bạch hơn với cơ quan quản lý." : "Khung quy định tạo ranh giới an toàn cho cạnh tranh."],
      labor: [player.happiness < 50 ? "Đội ngũ đang cần một tín hiệu thiện chí từ doanh nghiệp." : "Quan hệ lao động ổn định đang là lợi thế vận hành."],
    };
    return `${landed.name}: ${narratives[landed.kind][0]}`;
  }

  function resolveLanding(position: number, landedPlayer: Player) {
    const landed = tiles[position];
    const owner = owners[position];
    if (owner !== undefined && owner !== current && landed.rent) {
      const monopolyBonus = players[owner].monopoly >= 6 ? 1 : 0;
      const rent = landed.rent + monopolyBonus;
      setPlayers((list) => list.map((player, index) => {
        if (index === current) return { ...player, cash: player.cash - rent };
        if (index === owner) return { ...player, cash: player.cash + rent };
        return player;
      }));
      addLog(`${landedPlayer.name} trả ${rent}V phí sử dụng cho ${players[owner].name}.`);
      return;
    }
    if (landed.kind === "event") {
      const topic: GameEvent["topic"] = [2, 7, 24].includes(position) ? "T2" : position === 13 ? "T4" : "T6";
      drawEvent(topic);
      return;
    }
    if (position === 10) {
      drawEvent(Math.random() > 0.5 ? "T3" : "T6");
      return;
    }
    if (position === 20) {
      if (landedPlayer.happiness < 40) {
        updateActive((player) => applyDelta(player, { cash: -3, society: -5, happiness: 8 }));
        addLog(`Đình công: ${landedPlayer.name} mất 3V để thương lượng.`);
      } else {
        updateActive((player) => applyDelta(player, { society: 3 }));
        addLog(`Quan hệ lao động ổn định: uy tín +3.`);
      }
      return;
    }
    if (position === 30) {
      const penalty = landedPlayer.monopoly >= 6 ? Math.max(4, Math.ceil(landedPlayer.cash * 0.1)) : 0;
      updateActive((player) => applyDelta(player, penalty ? { cash: -penalty, monopoly: -3, society: -5 } : { monopoly: -1 }));
      addLog(penalty ? `Thanh tra phạt ${penalty}V và giảm quyền lực thị trường.` : `Thanh tra không phát hiện vị thế thống lĩnh.`);
      return;
    }
    if (position === 4) {
      updateActive((player) => applyDelta(player, { cash: -2 }));
      addLog(`${landedPlayer.name} nộp 2V thuế nhà nước.`);
    } else if (position === 22) {
      updateActive((player) => applyDelta(player, { tech: 1 }));
      addLog(`Cách mạng công nghiệp: công nghệ +1.`);
    } else if (position === 38) {
      const tax = clamp(Math.ceil(landedPlayer.cash * 0.1), 2, 6);
      updateActive((player) => applyDelta(player, { cash: -tax }));
      addLog(`Thuế lũy tiến: nộp ${tax}V.`);
    } else if (landed.kind === "international" && landed.price) {
      updateActive((player) => applyDelta(player, { integration: 1 }));
      addLog(`Tiếp cận thị trường mới: quốc tế +1.`);
    } else {
      addLog(landingNarrative(landed, landedPlayer));
    }
  }

  function rollDice() {
    if (!active || phase !== "roll" || isRolling || isRevealingDice) return;
    setIsRolling(true);
    setMessage(`${active.name} đang tung xúc xắc…`);
    playDiceRollSound();
    let rolls = 0;
    const interval = setInterval(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      rolls++;
      if (rolls > 20) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const oldPosition = active.position;
        const position = (oldPosition + d1 + d2) % 40;
        const passedStart = position < oldPosition;
        const moved = { ...active, position, cash: active.cash + (passedStart ? 2 : 0) };
        setDice([d1, d2]);
        setIsRolling(false);
        setIsRevealingDice(true);
        setMessage(`Kết quả: ${d1} + ${d2} = ${d1 + d2}. Chuẩn bị di chuyển…`);

        window.setTimeout(() => {
          playSound("move");
          setPlayers((list) => list.map((player, index) => index === current ? moved : player));
          setPhase("manage");
          setProduced(false);
          setIsRevealingDice(false);
          if (passedStart) {
            addLog(`${active.name} qua Khởi nghiệp và nhận 2V.`);
            playSound("cash");
          }
          resolveLanding(position, moved);
        }, 1400);
      }
    }, 110);
  }

  function buyAsset() {
    if (!active || !tile.price || owners[tile.id] !== undefined || active.cash < tile.price) return;
    updateActive((player) => {
      const next = applyDelta(player, {
        cash: -tile.price!,
        factories: tile.kind === "factory" ? 1 : 0,
        tech: tile.kind === "technology" ? 1 : 0,
        integration: tile.kind === "international" ? 1 : 0,
        monopoly: 1,
      });
      return next;
    });
    setOwners((map) => ({ ...map, [tile.id]: current }));
    playSound("buy");
    addLog(`${active.name} mua ${tile.name} với giá ${tile.price}V.`);
  }

  function produce() {
    if (!active || produced) return;
    const capacity = Math.min(active.workers, active.factories * 2 + Math.floor(active.tech / 3));
    const n = Math.max(1, Math.min(capacity, 4));
    const wageValue = wage === "low" ? 1 : wage === "standard" ? 2 : 3;
    const c = 2 * n;
    const v = wageValue * n;
    const m = 4 * n - v;
    const profit = m + demand * n + Math.floor(active.tech / 4);
    const rate = Math.round((profit / (c + v)) * 100);
    updateActive((player) => ({
      ...applyDelta(player, {
        cash: profit,
        surplus: m,
        happiness: wage === "low" ? -7 * n : wage === "fair" ? 4 * n : 0,
        society: wage === "low" ? -5 : wage === "fair" ? 5 : 0,
      }),
      lastProfits: [...player.lastProfits, rate].slice(-3),
    }));
    setProduced(true);
    playSound("cash");
    addLog(`Kinh doanh: chi ${c + v} V, lời ${profit} V, tỷ suất lời ${rate}%.`);
  }

  function management(delta: Delta, text: string) {
    if (!active) return;
    const cost = -(delta.cash ?? 0);
    if (cost > active.cash) {
      addLog(`Không đủ vốn cho hành động này.`);
      return;
    }
    updateActive((player) => applyDelta(player, delta));
    addLog(text);
  }

  function chooseEvent(choiceIndex: number) {
    if (!pendingEvent || !active) return;
    const choice = pendingEvent.choices[choiceIndex];
    updateActive((player) => applyDelta(player, choice.delta));
    addLog(`${pendingEvent.title}: ${choice.label} — ${choice.effect}.`);
    setPendingEvent(null);
  }

  function endTurn() {
    if (!active || phase !== "manage" || pendingEvent) return;
    if (active.cash < -10) {
      setPhase("finished");
      addLog(`${active.name} mất khả năng tái cấu trúc. Ván chơi kết thúc.`);
      return;
    }
    const next = (current + 1) % players.length;
    if (next === 0) {
      const nextRound = round + 1;
      if (nextRound > 20) {
        setPhase("finished");
        addLog(`Hoàn thành 20 vòng. Tiến hành chấm điểm.`);
        return;
      }
      setRound(nextRound);
      setDemand(([-1, 0, 1] as const)[Math.floor(Math.random() * 3)]);
    }
    setCurrent(next);
    setDice([0, 0]);
    setPhase("roll");
    setProduced(false);
    setIsRevealingDice(false);
    setMessage(`Đến lượt ${players[next].name}.`);
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (phase === "setup") {
    return (
      <main className="setup-shell">
        <section className="setup-card">
          <ExploreMap guideTarget />
          <div className="eyebrow">BOARD GAME CHIẾN LƯỢC • 2–4 NGƯỜI</div>
          <h1>Ông Trùm<br /><span>Tư Bản</span></h1>
          <p className="setup-lead">Mua tài sản, mở rộng kinh doanh và về đích với một đế chế vừa giàu mạnh, vừa bền vững.</p>
          <div className="setup-controls">
            <label>Số người chơi
              <div className="segmented">
                {[2, 3, 4].map((count) => <button key={count} className={playerCount === count ? "selected" : ""} onClick={() => setPlayerCount(count)}>{count}</button>)}
              </div>
            </label>
            <div className="name-grid">
              {names.slice(0, playerCount).map((name, index) => (
                <label key={index} style={{ "--player": playerColors[index] } as React.CSSProperties}>
                  <span>{playerSymbols[index]} Người chơi {index + 1}</span>
                  <input value={name} maxLength={28} onChange={(event) => setNames((items) => items.map((item, i) => i === index ? event.target.value : item))} />
                </label>
              ))}
            </div>
          </div>
          <button className="primary start" data-home-guide="play" onClick={startGame}>Vào bàn chơi <span>→</span></button>
          <div className="setup-footer"><span>20 V tiền mặt</span><span>5 nhân sự</span><span>1 xưởng</span><span>3 công nghệ</span></div>
        </section>
        <aside className="setup-art"><span className="market-radar" aria-hidden="true" /><CourseGraphic guideTarget /><TrailerVideo guideTarget /></aside>
        <AnimatePresence>
          {showHomeGuide && <HomeGuide onDismiss={() => setShowHomeGuide(false)} />}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">ÔT</span><div><strong>ÔNG TRÙM TƯ BẢN</strong><small>Ai sẽ làm chủ bàn cờ?</small></div></div>
        <div className="round-box"><small>VÒNG</small><strong>{String(round).padStart(2, "0")}<span>/20</span></strong></div>
        <div className="market-box"><small>SỨC MUA</small><div className={`demand demand-${demand}`}>{demand < 0 ? "CHẬM −1" : demand > 0 ? "TỐT +1" : "ỔN ĐỊNH"}</div></div>
        <button className="ghost" onClick={() => setShowRules(true)}>Cách chơi</button>
      </header>

      <section className="game-grid">
        <aside className="players-panel panel">
          <div className="panel-heading"><span>NGƯỜI CHƠI</span><small>{players.length} người</small></div>
          <div className="player-list">
            {players.map((player, index) => {
              const assets = Object.values(owners).filter((owner) => owner === index).length;
              return (
                <article key={player.name} className={`player-card ${current === index ? "active" : ""}`} style={{ "--player": player.color } as React.CSSProperties}>
                  <div className="player-title"><b>{player.symbol}</b><div><strong>{player.name}</strong><small>{current === index ? "Đang tới lượt" : `${assets} tài sản`}</small></div><span>{money(player.cash)}</span></div>
                  <div className="mini-stats"><span>Nhân sự <b>{player.workers}</b></span><span>Xưởng <b>{player.factories}</b></span><span>Công nghệ <b>{player.tech}</b></span><span>Lợi nhuận <b>{player.surplus}</b></span></div>
                  <div className="meter-row"><label>Uy tín</label><i><em style={{ width: `${player.society}%` }} /></i><b>{player.society}</b></div>
                  <div className="meter-row"><label>Hài lòng</label><i><em style={{ width: `${player.happiness}%` }} /></i><b>{player.happiness}</b></div>
                  <div className="meter-row"><label>Quốc tế</label><i><em style={{ width: `${player.integration * 10}%` }} /></i><b>{player.integration}</b></div>
                </article>
              );
            })}
          </div>
          <div className="legend"><span><i className="factory" /> Nhà máy</span><span><i className="technology" /> Công nghệ</span><span><i className="realestate" /> Nhà đất</span><span><i className="international" /> Quốc tế</span></div>
        </aside>

        <motion.section className="board-wrap" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="board" aria-label="Bàn cờ 40 ô">
            <div className="pawns-layer">
              {tiles.map((item) => (
                <div key={`pawn-cell-${item.id}`} style={tilePosition(item.id)}>
                  <AnimatePresence>
                    {players.map((player) => player.position === item.id && (
                      <motion.b layoutId={`pawn-${player.name}`} key={player.name} style={{ background: player.color }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                        {player.symbol}
                      </motion.b>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {tiles.map((item) => (
              <div key={item.id} className={`tile ${item.kind} ${active?.position === item.id ? "landed" : ""}`} style={tilePosition(item.id)} title={`${item.id}. ${item.name}: ${item.hint}`}>
                <span className="tile-id">{String(item.id).padStart(2, "0")}</span>
                <strong>{item.name}</strong>
                <small>{item.price ? `${item.price}V • phí ${item.rent}V` : item.hint}</small>
                {owners[item.id] !== undefined && <i className="owner-dot" style={{ background: players[owners[item.id]].color }} />}
              </div>
            ))}
            <div className="board-center">
              <div className="board-center-content">
                <div className="turn-pill"><i style={{ background: active?.color }} /> LƯỢT CỦA {active?.name}</div>
                <h2>ÔNG TRÙM<br /><span>TƯ BẢN</span></h2>
                <div className="formula">MUA • XÂY • KINH DOANH • DẪN ĐẦU</div>
                <div className="turn-message">{message}</div>
                <div className={`dice-area ${isRevealingDice ? "showing-result" : ""}`}>
                  <div className="dice-stage">
                    <div className="dice-pair">
                      <Dice3D value={dice[0]} rolling={isRolling} revealed={isRevealingDice} variant={0} />
                      <Dice3D value={dice[1]} rolling={isRolling} revealed={isRevealingDice} variant={1} />
                    </div>
                    {isRevealingDice && <div className="dice-total" aria-live="polite"><small>KẾT QUẢ</small><strong>{dice[0] + dice[1]}</strong></div>}
                  </div>
                  <button className="primary billboard-btn" onClick={rollDice} disabled={phase !== "roll" || isRolling || isRevealingDice}>
                    {isRolling ? "Đang tung…" : isRevealingDice ? "Đang di chuyển…" : "Tung xúc xắc"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <aside className="action-panel panel">
          <div className="panel-heading"><span>VIỆC CÓ THỂ LÀM</span><small>{phase === "roll" ? "Hãy tung xúc xắc" : "Chọn hành động"}</small></div>
          <div className="landing-card">
            <small>VỊ TRÍ HIỆN TẠI • Ô {String(tile.id).padStart(2, "0")}</small>
            <strong>{tile.name}</strong>
            <span>{tile.hint}</span>
            {tile.price && owners[tile.id] === undefined && <button className="buy" disabled={phase !== "manage" || active.cash < tile.price} onClick={buyAsset}>Mua ngay <b>{tile.price} V</b></button>}
            {owners[tile.id] !== undefined && <div className="owned">Chủ sở hữu: {players[owners[tile.id]].name}</div>}
          </div>
          <div className="action-section">
            <h3>KINH DOANH</h3>
            <div className="wage-select">
              {(["low", "standard", "fair"] as Wage[]).map((item) => <button key={item} className={wage === item ? "selected" : ""} onClick={() => setWage(item)}>{item === "low" ? "Tiết kiệm" : item === "standard" ? "Cân bằng" : "Hào phóng"}</button>)}
            </div>
            <button className="action-main" onClick={produce} disabled={phase !== "manage" || produced}><span>⚙</span><div><strong>{produced ? "Đã kinh doanh lượt này" : "Kinh doanh ngay"}</strong><small>Tạo lợi nhuận từ nhân sự và xưởng</small></div></button>
          </div>
          <div className="action-section">
            <h3>MỞ RỘNG</h3>
            <div className="action-grid">
              <button onClick={() => management({ cash: -1, workers: 1 }, `Tuyển 1 nhân sự với phí 1V.`)} disabled={phase !== "manage"}><span>+ Nhân sự</span><small>−1 V</small></button>
              <button onClick={() => management({ cash: -4, tech: 1 }, `Nâng công nghệ với phí 4V.`)} disabled={phase !== "manage"}><span>+ Công nghệ</span><small>−4 V</small></button>
              <button onClick={() => management({ cash: 5, monopoly: 1, society: -2 }, `Vay 5V, sức mạnh thị trường tăng.`)} disabled={phase !== "manage"}><span>Vay vốn</span><small>+5 V</small></button>
              <button onClick={() => management({ cash: -2, integration: 1 }, `Mở thị trường quốc tế với phí 2V.`)} disabled={phase !== "manage" || active.integration < 2}><span>Ra quốc tế</span><small>Cần mức 2</small></button>
            </div>
          </div>
          <button className="end-turn" onClick={endTurn} disabled={phase !== "manage" || !!pendingEvent}>Kết thúc lượt <span>→</span></button>
          <div className="log"><h3>DIỄN BIẾN GẦN ĐÂY</h3>{log.slice(0, 5).map((item, index) => <p key={`${item}-${index}`}><i />{item}</p>)}</div>
        </aside>
      </section>

      {pendingEvent && <div className="modal-backdrop"><section className={`event-modal topic-${pendingEvent.topic}`}><div className="event-top"><span>THẺ {topicName[pendingEvent.topic]} • CHỌN MỘT</span><b>{topicName[pendingEvent.topic].slice(0, 2).toUpperCase()}</b></div><h2>{pendingEvent.title}</h2><p>{pendingEvent.situation}</p><div className="choices">{pendingEvent.choices.map((choice, index) => <button key={choice.label} onClick={() => chooseEvent(index)}><i>{String.fromCharCode(65 + index)}</i><span><strong>{choice.label}</strong><small>{choice.effect}</small></span></button>)}</div><div className="concept"><b>MẸO KINH DOANH</b><p>{pendingEvent.concept}</p></div></section></div>}

      {showRules && <div className="modal-backdrop"><section className="rules-modal"><button className="close" aria-label="Đóng" onClick={() => setShowRules(false)}>×</button><div className="eyebrow">CÁCH CHƠI</div><h2>Xây doanh nghiệp trong 20 vòng</h2><p>Mỗi người bắt đầu với tiền mặt, nhân sự và một mục tiêu chung: tăng trưởng mà không đánh đổi niềm tin của xã hội.</p><h3>1. Tung và chờ kết quả</h3><p>Nhấn <b>Tung xúc xắc</b>. Hai viên xúc xắc dừng rõ kết quả trước khi quân cờ di chuyển. Qua ô Khởi nghiệp, doanh nghiệp nhận thêm 2 V vốn lưu động.</p><h3>2. Đọc bối cảnh tại ô đến</h3><p>Ô tài sản chưa có chủ có thể được mua nếu đủ vốn. Ô đã có chủ yêu cầu trả phí sử dụng. Ô cơ hội mở một thẻ vận: hãy đọc tình huống, cân nhắc ba hành động riêng cho sự kiện đó rồi chọn một.</p><h3>3. Quản trị sau khi di chuyển</h3><p>Ở pha quản trị, bạn có thể mua tài sản tại nơi đang đứng, tổ chức kinh doanh một lần, hoặc đầu tư vào nhân sự, xưởng và công nghệ. Sản lượng phụ thuộc vào nhân sự, xưởng và công nghệ; tiền công ảnh hưởng trực tiếp đến lợi nhuận, hài lòng và uy tín.</p><h3>4. Theo dõi các chỉ số</h3><p><b>Vốn (V)</b> giúp mua và đầu tư. <b>Hài lòng</b> phản ánh sức khỏe quan hệ lao động. <b>Uy tín</b> là niềm tin xã hội. <b>Quốc tế</b> là năng lực mở rộng thị trường. <b>Thị phần</b> giúp tăng lợi thế, nhưng quá cao có thể dẫn đến thanh tra.</p><h3>5. Kết thúc lượt và chấm điểm</h3><p>Nhấn <b>Kết thúc lượt</b> để chuyển sang doanh nghiệp tiếp theo. Sau 20 vòng, điểm tổng hợp gồm tài sản, lợi nhuận, hiệu quả kinh doanh, uy tín và mức độ hội nhập. Doanh nghiệp có tổng điểm cao nhất chiến thắng; quá ít hài lòng hoặc uy tín sẽ làm giảm điểm đáng kể.</p></section></div>}

      {phase === "finished" && <div className="modal-backdrop"><section className="results-modal"><div className="eyebrow">KẾT QUẢ SAU {round} VÒNG</div><h2>{ranking[0]?.player.name} chiến thắng</h2><p>Một đế chế mạnh cần cả tài sản, lợi nhuận, uy tín và khả năng vươn ra thế giới.</p><div className="ranking">{ranking.map((item, index) => <article key={item.player.name} style={{ "--player": item.player.color } as React.CSSProperties}><b>{index + 1}</b><span><strong>{item.player.name}</strong><small>Tài sản {money(item.netWorth)} • Uy tín {item.player.society} • Quốc tế {item.player.integration}</small></span><em>{item.total.toFixed(1)}</em></article>)}</div><button className="primary" onClick={() => setPhase("setup")}>Chơi ván mới</button></section></div>}
    </main>
  );
}
