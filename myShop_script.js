const SHOP_DATA = {
	drink: { name: "飲料店", icon: "🥤", price: 65, cost: 22, demandMin: 40, demandMax: 58, personnel: 2400 },//1548~2365
	bakery: { name: "烘焙坊", icon: "🥐", price: 180, cost: 55, demandMin: 18, demandMax: 22, personnel: 3000 },//2250~2750
	game: { name: "電玩店", icon: "🎮", price: 1800, cost: 1100, demandMin: 1, demandMax: 5, personnel: 2400 },//700~3500
	hobby: { name: "玩具店", icon: "🧸", price: 900, cost: 500, demandMin: 6, demandMax: 8, personnel: 3600 }//2400~3200
};

const BUFF_POOL = [
	{ name: "📰 網路廣告", desc: "客流 +20%", buy: 3000, dSum: 0.20 },
	{ name: "🤖 自動結帳", desc: "單位成本 90%", buy: 3500, cMul: 0.9 },
	//{ name: "💎 尊榮會員", desc: "客流 +10%, 售價 +15%", buy: 4000, dSum: 0.1, pSum: 0.15 },
	{ name: "⏰ 延長工時", desc: "客流 +25%, 人事 +30%", buy: 1500, dSum: 0.25, persSum: 0.3 },
	{ name: "🎫 優惠禮券", desc: "客流 +25%, 售價 -2%", buy: 2500, dSum: 0.25, pSum: -0.2 },
	//{ name: "🧹 門面裝修", desc: "客流 +15%, 售價 +10%", buy: 5000, dSum: 0.15, pSum: 0.10 },
	{ name: "📦 批發採購", desc: "單位成本 75%, 客流 -10%", buy: 2000, cMul: 0.75, dSum: -0.1 },
	{ name: "👨‍🍳 專業培訓", desc: "售價 +35%, 人事 +20%", buy: 4000, pSum: 0.35, persSum: 0.2 },
	{ name: "🏗️ 擴大店面", desc: "客流 +30%, 房租 +2000", buy: 8500, dSum: 0.30, rentAdd: 2000 },
	{ name: "🏢 開設分店", desc: "客流 +100%, 房租 200%, 人事 +100%", buy: 15000, dSum: 1.0, rMul: 2.0, persSum: 1.0 },
	
	{ name: "🧹 門面裝修", desc: "前 3 天施工：客流 -35%；之後：客流 +20%, 售價 +15%", buy: 5000, currentStage: 0,
		stages: [{ duration: 3, dSum: -0.5, log: "門面裝修施工中，客流減少" },
				 { duration: Infinity, dSum: 0.2, pSum: 0.15, log: "裝修完成！店面煥然一新" }]},
    { name: "📖 研發新產品",desc: "前 2 天研發：人事 +20%；之後：售價 +25%", buy: 3000, currentStage: 0,
		stages: [{ duration: 2, persSum: 0.2, log: "廚師正在研發新菜單..." },
				 { duration: Infinity, pSum: 0.25, log: "新菜單大獲好評！" }]},
	{ name: "📢 外出宣傳", desc: "花 1 天宣傳：人事 +100%；之後：客流 +30%", buy: 2500, currentStage: 0, 
		stages: [{ duration: 1, persSum: 1.0, log: "員工正在街頭派發傳單，人事成本增加" },
				 { duration: Infinity, dSum: 0.3, log: "宣傳效果顯現，店面知名度提升" }]},
];

//沒有duration等於永久活動
/*
 * * --- 以下為各屬性的計算器 (分類：加減Sum / 乘除Mul / 絕對值Add) ---
 * pSum, pMul: 售價的累加比率 (起始1.0) 與 連乘權重 (起始1.0)
 * cSum, cMul: 成本的累加比率 與 連乘權重
 * dSum, dMul: 客流的累加比率 與 連乘權重
 * persSum, persMul: 人事費的累加比率 與 連乘權重
 * * rAdd, dAdd: 房租與客流的「絕對數值」加減 (例如固定增加 $1500 房租)
 * rentAdd, rMul
 */

const BIG_EVENTS = [
	{	title: "⚖️ 法定工資調漲",
		desc: "政府宣布調高基本時薪，這將影響近期的經營成本（持續 5 天）。",
		options: [{	text: "精簡人力 (人事 +10%, 客流 80%)",	impact: { persSum: 0.1, dMul: 0.80, log: "短期：精簡人力導致服務品質下降", duration: 5 }},
				  {	text: "全面調薪 (人事 +30%, 售價 110%)", 	impact: { persSum: 0.30, pMul: 1.1, log: "短期：調薪提升士氣與產品價值", duration: 5 }}]
	},
				  
	{	title: "🏗️ 捷運完工轉型",
		desc: "店門口的捷運站正式完工啟用！這將帶來穩定的人潮，但地段租金也隨之暴漲。",
		options: [{ text: "原地升級 (客流 +30%, 租金 130%)", 	impact: { dSum: 0.30, rMul: 1.3, log: "長期：捷運站帶來龐大客流，但租金成本大幅提升"}},
				  {	text: "搬遷避險 (客流 90%, 租金 70%)", 	impact: { dMul: 0.9, rMul: 0.7, log: "長期：搬遷至較遠地段，避開租金壓力但人氣下滑"}}]
	},
				  
	{	title: "🌀 強力颱風侵襲",
		desc: "氣象局發布陸上警報，影響預計僅限明日。",
		options: [{ text: "防颱加固 (開銷 +1,000, 客流 60%)", 	impact: { rentAdd: 1000, dMul: 0.6, log: "短期：加固設施支出", duration: 1 }},
				  {	text: "停業一天 (當天零客流, 零人事費用)", 	impact: { dMul: 0.0, persMul: 0.0, log: "短期：停業避災", duration: 1 }}]
	},
				  
	{	title: "✈️ 國際旅遊節",
		desc: "大量國外旅客湧入，這是一次性的觀光熱潮（持續 3 天）。",
		options: [{ text: "外籍友善 (人事 200%, 客流 180%)", 	impact: { persMul: 2.0, dMul: 1.8, log: "短期：增聘臨時翻譯人員", duration: 3 }},
				  {	text: "推出套裝 (售價 120%, 客流 120%)", 	impact: { pMul: 1.2, dMul: 1.2, log: "短期：觀光限定套裝", duration: 3 }}]
	},
				  
	{	title: "🌍 供應鏈危機",
		desc: "全球物料短缺，預計會造成短期的成本波動（持續 5 天）。",
		options: [{ text: "吸收成本 (成本 110%)", 				impact: { cMul: 1.1, log: "短期：公司吸收物料漲幅", duration: 5 }},
				  {	text: "調整配方 (客流 85%)", 				impact: { dMul: 0.85, log: "短期：配方更換導致客流流失", duration: 5 }}]
	},

	{	title: "🚧 門口修路",
		desc: "店門口進行地下管線施工，預計持續 3 天，進出不便。",
		options: [{ text: "忍受不便 (客流 70%)", 				impact: { dMul: 0.7, log: "短期：施工阻擋了客流", duration: 3 }},
				  {	text: "補貼吸引 (開銷 +1,500, 客流 90%)",	impact: { rentAdd: 1500, dMul: 0.9, log: "短期：投入行銷經費補貼", duration: 3 }}]
	}
];

let state = {
	shop: null, money: 50000, day: 1, 
	activeBuffs: [], historyEvents: [],
	difficulty: 'normal', eventCycle: 5,
	rent: 1000, personnel: 2400,
	expenseMod: 1, dailyRev: 0, dailySold: 0,
	gameSpeed: 1,
	expansionLevel: 0,
	branchPositions: [],
	historyData: []
};

function chooseDiff(key) {
	state.shop = { ...SHOP_DATA[key] };
	document.getElementById('setup-content').innerHTML = `<h2 style="font-size:28px;">⚙️ 第二步：選擇經營難度</h2>
		<div class="diff-grid">
			<button class="btn-diff" onclick="finalize('easy', 120000, 800, 7)">
				<h4>🟢 簡單</h4>
				<p>資金充足 ($12萬)<br>店租: $800 / 天<br><b>每 7 天</b>一事件</p>
			</button>
			<button class="btn-diff" onclick="finalize('normal', 60000, 1000, 5)">
				<h4>🟡 標準</h4>
				<p>創業資金 ($6萬)<br>店租: $1,000 / 天<br><b>每 5 天</b>一事件</p>
			</button>
			<button class="btn-diff" onclick="finalize('hard', 30000, 1200, 3)">
				<h4>🔴 困難</h4>
				<p>資金吃緊 ($3萬)<br>店租: $1,200 / 天<br><b>每 3 天</b>一事件</p>
			</button>
		</div>`;
}

function finalize(diff, m, r, cycle) {
	state.difficulty = diff; 
	state.money = m; 
	state.rent = r;           // 難度決定的租金
	state.eventCycle = cycle;
	
	// 直接抓取該店型的純人事費
	state.personnel = state.shop.personnel; 
	
	document.getElementById('setup-modal').style.display = 'none';
	document.getElementById('shop-node').style.display = 'flex';
	document.getElementById('shop-sub-icon').textContent = state.shop.icon;
	document.getElementById('ui-shop-name').textContent = state.shop.name;
	if(diff=="easy"){document.getElementById('ui-day').style.color = "green";}
	else if(diff=="normal"){document.getElementById('ui-day').style.color = "#6366f1";}
	else if(diff=="hard"){document.getElementById('ui-day').style.color = "red";}
	updateUI();
}

function calculateCurrentStats() {
	/*
	 * * --- 以下為各屬性的計算器 (分類：加減Sum / 乘除Mul / 絕對值Add) ---
	 * pSum, pMul: 售價的累加比率 (起始1.0) 與 連乘權重 (起始1.0)
	 * cSum, cMul: 成本的累加比率 與 連乘權重
	 * dSum, dMul: 客流的累加比率 與 連乘權重
	 * persSum, persMul: 人事費的累加比率 與 連乘權重
	 * * rAdd, dAdd: 房租與客流的「絕對數值」加減 (例如固定增加 $1500 房租)
	 */

	let p = state.shop.price, c = state.shop.cost;
	let baseRent = state.rent;
	let basePers = state.personnel;

	// 初始化計算器
	let pSum = 0, pMul = 1.0;
	let cSum = 0, cMul = 1.0;
	let dSum = 0, dMul = 1.0;
	let persSum = 0, persMul = 1.0;
	let rAdd = 0, dAdd = 0;
	let rMul = 1.0;

	// 定義統一的數據處理邏輯 (處理 Buffs 與 Events)
	const processImpact = (item) => {
		const impact = item.stages ? item.stages[item.currentStage] : item;
		
		// --- 售價 (Price) --- 修正名稱為 pSum
		if (impact.pSum !== undefined) pSum += impact.pSum;
		if (impact.pMul !== undefined) pMul *= impact.pMul;

		// --- 成本 (Cost) --- 修正名稱為 cSum
		if (impact.cSum !== undefined) cSum += impact.cSum;
		if (impact.cMul !== undefined) cMul *= impact.cMul;

		// --- 客流 (Demand) --- 修正名稱為 dSum
		if (impact.dSum !== undefined) dSum += impact.dSum;
		if (impact.dMul !== undefined) dMul *= impact.dMul;
		if (impact.dAdd !== undefined) dAdd += impact.dAdd;

		// --- 人事 (Personnel) --- 修正名稱為 persSum
		if (impact.persSum !== undefined) persSum += impact.persSum;
		if (impact.persMul !== undefined) persMul *= impact.persMul;

		// --- 房租 (Rent) --- 修正名稱為 rentAdd
		if (impact.rentAdd !== undefined) rAdd += impact.rentAdd;
		if (impact.rMul !== undefined) rMul *= impact.rMul;
		
	};

	// 1. 計算每日決策 (Buffs)
	state.activeBuffs.forEach(processImpact);

	// 2. 計算大事件 (Events)
	state.historyEvents.forEach(processImpact);

	// 最終合成計算：(初始值 * 加減總和比率 * 乘除連乘權重)
	// 使用 Math.max 確保不會出現負數或 0 導致遊戲無法運作
	const finalPrice = Math.max(1, Math.floor(p * (1 + pSum) * pMul));
	const finalCost  = Math.max(1, Math.floor(c * (1 + cSum) * cMul));
	const finalPers  = Math.max(0, Math.floor(basePers * (1 + persSum) * persMul));
	const finalRent  = Math.max(0, (baseRent + rAdd) * rMul);

	// 計算最終總加成率 (回傳給 UI 顯示用，例如 +8.9%)
	const finalDRateTotal = ((1 + dSum) * dMul) - 1;

	return { 
		price: finalPrice, 
		cost: finalCost, 
		expense: finalPers + finalRent, 
		Statrent: finalRent,
		StatPersonnel: finalPers,
		dRate: finalDRateTotal,
		dAdd: dAdd
	};
}



function updateUI() {
		const stats = calculateCurrentStats();
		document.getElementById('ui-money').textContent = Math.floor(state.money).toLocaleString();
		document.getElementById('ui-day').textContent = state.day;
		document.getElementById('ui-price').textContent = stats.price.toLocaleString();
		document.getElementById('ui-cost').textContent = stats.cost.toLocaleString();
		document.getElementById('ui-expense').textContent = Math.floor(stats.expense).toLocaleString();
		
		document.getElementById('ui-expense-hint').textContent = 
			`💡 固定成本：店租 ${stats.Statrent.toLocaleString()}元 + 人事 ${stats.StatPersonnel.toLocaleString()}元 = ${Math.floor(stats.expense).toLocaleString()}元/天`;
			
		const finalDRate = stats.dRate; // 這是 ((1 + dSum) * dMul) - 1
		const minDemand = Math.max(0, Math.floor(state.shop.demandMin * (1 + finalDRate)) + stats.dAdd);
		const maxDemand = Math.max(0, Math.floor(state.shop.demandMax * (1 + finalDRate)) + stats.dAdd);
		
		document.getElementById('ui-demand-range').textContent = `${minDemand} ~ ${maxDemand}`;
					
		const buffDiv = document.getElementById('history-buffs-inline');
		const eventDiv = document.getElementById('history-events-inline');
		
		if (buffDiv) {
			// 1. 統計次數
			const counts = {};
			state.activeBuffs.forEach(b => {
				counts[b.name] = (counts[b.name] || 0) + 1;
			});

			// 2. 轉換成顯示文字
			const displayTags = Object.keys(counts).map(name => {
				const count = counts[name];
				const countText = count > 1 ? ` *${count}` : ""; // 超過1個才顯示 *幾
				return `<span class="status-tag">${name}${countText}</span>`;
			});

			buffDiv.innerHTML = displayTags.join('') || "無";
		}
		
		if (eventDiv) {
			eventDiv.innerHTML = state.historyEvents.map(e => {
				// 如果有 duration 就顯示剩餘天數，否則顯示永久
				const countdown = e.duration !== undefined ? ` (剩餘 ${e.duration+1} 天)` : " (永久)";
				return `<div style="font-size:12px; color:#64748b; border-bottom:1px solid #eee; padding:2px 0;">
					• ${e.log} <b style="color:var(--danger)">${countdown}</b>
				</div>`;
			}).join('') || "無";
		}
		const shopNode = document.getElementById('shop-node');
		const subStoreContainer = document.getElementById('sub-stores-container');
		if (!subStoreContainer) return;

		// 處理擴大店面縮放
		state.expansionLevel = state.activeBuffs.filter(b => b.name.includes("擴大店面")).length;
		if (state.expansionLevel > 0) {
			const scale = 1 + (state.expansionLevel * 0.1);
			// 動態計算位移：每級向上提 10px 避免破底
			const translateY = state.expansionLevel * -1;
			
			shopNode.style.transform = `translateX(-50%) scale(${scale}) translateY(${translateY}%)`;
			shopNode.style.transformOrigin = "bottom center";
		} else {
			shopNode.style.transform = `translateX(-50%) scale(1) translateY(0px)`;
		}

		// --- 處理分店核心邏輯 (防止重疊版本) ---
		const currentBranchBuffs = state.activeBuffs.filter(b => b.name.includes("開設分店")).length;
		const targetGraphicCount = currentBranchBuffs; 

		// 初始化 state 中的 branchPositions（如果還沒有的話）
		if (!state.branchPositions) state.branchPositions = [];

		while (state.branchPositions.length < targetGraphicCount) {
			const storeEmojis = ['🏠', '🏘️', '🏤', '🏢', '🏬', '🏪', '🏨', '🏦'];
			let newLeft, isOverlap, attempts = 0;

			do {
				isOverlap = false;
				const side = Math.random() > 0.5 ? 'left' : 'right';
				newLeft = (side === 'left') ? (Math.random() * 28) : (72 + Math.random() * 25);
				
				for (let existing of state.branchPositions) {
					// 如果兩個座標水平距離小於 8%，視為重疊 (數字越大分得越開)
					if (Math.abs(existing.left - newLeft) < 15) {
						isOverlap = true;
						break;
					}
				}
				attempts++;
			} while (isOverlap && attempts < 50);

			state.branchPositions.push({
				emoji: storeEmojis[Math.floor(Math.random() * storeEmojis.length)],
				left: newLeft,
				top: (Math.random() * 10), 
				scale: 0.8 + (Math.random() * 0.3)
			});
		}

		// 渲染 HTML：只有當數量增加時才重新繪製，保留原本分店的位置
		if (subStoreContainer.childElementCount !== state.branchPositions.length) {
			subStoreContainer.innerHTML = '';
			state.branchPositions.forEach(pos => {
				const span = document.createElement('span');
				span.className = 'branch-icon';
				span.textContent = pos.emoji;
				span.style.left = `${pos.left}%`;
				span.style.top = `${pos.top}%`;
				span.style.transform = `scale(${pos.scale})`;
				subStoreContainer.appendChild(span);
			});
		}
}

async function startDay() {
	const btn = document.getElementById('btn-start');
	btn.disabled = true;
	btn.textContent = "🏪 營業中..."; // 顯示效果
	
	state.dailyRev = 0; 
	state.dailySold = 0;
	const stats = calculateCurrentStats();
	
	const range = state.shop.demandMax - state.shop.demandMin + 1;
	const baseDemand = Math.floor(Math.random() * range) + state.shop.demandMin; 
	
	const finalCount = Math.max(0, Math.floor(baseDemand * (1 + stats.dRate)) + stats.dAdd);
	
	// 等待所有客人都走完
	await playBusinessAnimation(finalCount, stats.price);
	
	const totalIncome = state.dailyRev;
	const totalCost = (state.dailySold * stats.cost) + stats.expense;
	const netProfit = totalIncome - totalCost;
	state.money += netProfit;
	
	state.historyData.push({
		day: state.day,
		sold: state.dailySold,
		profit: Math.floor(netProfit),
		cash: Math.floor(state.money)
	});
	
	btn.textContent = "開店!"; // 結算後改回原樣
	showSettlement(state.dailySold, totalIncome, totalCost, netProfit, state.money);
}

async function playBusinessAnimation(total, currentPrice) {
	return new Promise(resolve => {
		const canvas = document.getElementById('game-canvas');
		let spawned = 0;
		let finished = 0; 
		const s = state.gameSpeed; 
		
		const baseDuration = 10000; // 基礎總時長 (1倍速下10秒)
		const baseMoveTime = 3000;
		const baseStayTime = 800;
		const baseCoinTime = 1000;

		// --- 設定視覺上限 ---
		const VISUAL_LIMIT = 100; // 最多畫面上出現的小人數
		const visualTotal = Math.min(total, VISUAL_LIMIT);
		const silentTotal = total > VISUAL_LIMIT ? total - VISUAL_LIMIT : 0;

		if (total === 0) {
			setTimeout(resolve, 500 / s);
			return;
		}

		function spawnCustomer() {
			if (spawned >= visualTotal) {
				// 超過上限的部分：直接快速清算
				if (silentTotal > 0) {
					state.dailyRev += (silentTotal * currentPrice);
					state.dailySold += silentTotal;
					document.getElementById('ui-money').textContent = Math.floor(state.money + state.dailyRev).toLocaleString();
					// 如果原本就只有清算，或清算完畢且小人都走完了
					if (finished === visualTotal) resolve();
				}
				return;
			}

			spawned++;
			const c = document.createElement('div');
			c.className = 'customer';
			c.textContent = ['🚶', '🧍', '🚶‍♀️', '🧍‍♂️', '🏃'][Math.floor(Math.random() * 5)];
			const yOffset = Math.random() * 15;
			c.style.bottom = (5 + yOffset) + "px";
			const xOffset = (Math.random() * 80) - 40;
			c.style.transform = `translateX(${xOffset}px)`;
			canvas.appendChild(c);

			// 第一階段：走到店門口
			setTimeout(() => {
				c.style.transition = `left ${baseMoveTime / s}ms linear`;
				c.style.left = "46%";

				// 第二階段：消費
				setTimeout(() => {
					c.style.opacity = "0";
					const coin = document.createElement('div');
					coin.className = 'coin-pop';
					coin.style.animationDuration = `${baseCoinTime / s}ms`; 
					coin.innerHTML = `💰 +${currentPrice}`;
					document.getElementById('shop-node').appendChild(coin);

					state.dailyRev += currentPrice;
					state.dailySold += 1;
					document.getElementById('ui-money').textContent = Math.floor(state.money + state.dailyRev).toLocaleString();

					// 第三階段：離開
					setTimeout(() => {
						c.style.opacity = "1";
						c.style.transition = `left ${baseMoveTime / s}ms linear`;
						c.style.left = "-20%";
						
						// 第四階段：移除
						setTimeout(() => {
							c.remove();
							coin.remove();
							finished++;
							// 當視覺上的最後一位客人走完，且清算也完成時
							if (finished === visualTotal) {
								resolve();
							}
						}, baseMoveTime / s);
					}, baseStayTime / s);
				}, baseMoveTime / s);
			}, 50 / s);

			if (spawned < visualTotal) {
				// 這裡的間隔改由 visualTotal 來分配，確保動畫在時間內跑完
				const nextDelay = (baseDuration / visualTotal) * (Math.random() * 0.5 + 0.75) / s;
				setTimeout(spawnCustomer, nextDelay);
			} else if (silentTotal > 0) {
				// 如果有需要清算的，在最後一個動畫產生的瞬間立刻執行清算
				state.dailyRev += (silentTotal * currentPrice);
				state.dailySold += silentTotal;
				document.getElementById('ui-money').textContent = Math.floor(state.money + state.dailyRev).toLocaleString();
			}
		}

		spawnCustomer();
	});
}

function showSettlement(count, rev, cost, profit, money) {
	// 如果已經達到30天或資金為負，雖然顯示報表，但點擊按鈕應指向結束畫面
	const isGameOver = state.money < 0 || state.day >= 30;
	const liveStats = calculateCurrentStats();
	
	const currentPrice = document.getElementById('ui-price').innerText;
	const currentCost = document.getElementById('ui-cost').innerText;
	const currentExpense = document.getElementById('ui-expense').innerText;
	
	document.getElementById('settle-ui-price').innerText = `$${liveStats.price.toLocaleString()}`;
    document.getElementById('settle-ui-cost').innerText = `$${liveStats.cost.toLocaleString()}`;
	document.getElementById('settle-ui-rent').innerText = `$${liveStats.Statrent.toLocaleString()}`;
	document.getElementById('settle-ui-personnel').innerText = liveStats.StatPersonnel.toLocaleString();
	
	const minD = Math.max(0, Math.floor(state.shop.demandMin * (1 + liveStats.dRate)) + liveStats.dAdd);
    const maxD = Math.max(0, Math.floor(state.shop.demandMax * (1 + liveStats.dRate)) + liveStats.dAdd);
    document.getElementById('settle-ui-demand').innerText = `${minD}~${maxD}`;

    document.getElementById('settle-ui-rent').innerText = `$${liveStats.Statrent.toLocaleString()}`;
    document.getElementById('settle-ui-personnel').innerText = `$${liveStats.StatPersonnel.toLocaleString()}`;
	
	const modal = document.getElementById('settle-modal');
	document.getElementById('settle-report').innerHTML = `
		📦 銷量：<b>${count}</b> 件 <br>
		📥 收入：<span style="color:var(--success); font-weight:800;">+$${rev.toLocaleString()}</span><br>
		📤 支出：<span style="color:var(--danger); font-weight:800;">-$${Math.floor(cost).toLocaleString()}</span><br>
		✨ 純利：<b style="color:${profit>=0?'green':'red'}; font-size: 26px;">$${Math.floor(profit).toLocaleString()}</b><br>
		💰 餘額：<b style="font-size: 26px;">$${Math.floor(money).toLocaleString()}</b>
	`;
	log(`Day ${state.day}：銷量 ${count} | 營收 ${rev.toLocaleString()} 元 | 淨利 ${Math.floor(profit).toLocaleString()} 元`) ;

	const optBox = document.getElementById('buff-options');
	const investTitle = modal.querySelector('h3'); // 抓取「每日投資決策」標題
	const skipBtn = modal.querySelector('.btn-main[onclick="checkEventAfterSettle()"]');

	if (isGameOver) {
		optBox.style.display = 'none'; // 隱藏策略卡片
		
		if (state.money < 0) {
			investTitle.textContent = "❌ 經營失敗：公司已宣告破產";
			skipBtn.textContent = "查看最終報表";
		} else {
			investTitle.textContent = "🎉 經營期滿：30天創業旅程結束";
			skipBtn.textContent = "查看結算總結";
		}
    } else {
		// 正常顯示投資選項
		optBox.style.display = 'grid';
		if(investTitle) investTitle.innerHTML = `💡 每日投資決策<button onclick="showEffectPanel()" class="settle-Buff-detail">查看詳細加成</button>`;
		skipBtn.textContent = "跳過投資";
		
		optBox.innerHTML = '';
		[...BUFF_POOL].sort(() => 0.5-Math.random()).slice(0,3).forEach(b => {
			const btn = document.createElement('div');
			btn.className = 'btn-buff-card';
			btn.innerHTML = `
				<div class="buff-name-label">${b.name}</div>
				<div class="buff-desc-label">${b.desc}</div>
				<div class="buff-cost-label">$${b.buy.toLocaleString()}</div>
			`;
			btn.onclick = () => {
				if(state.money < b.buy) {
					showWarning("⚠️ 資金不足！");
					return;
				}
				state.money -= b.buy;
				const newBuff = JSON.parse(JSON.stringify(b));
				state.activeBuffs.push(newBuff);
				updateUI();
				checkEventAfterSettle();
			};
			optBox.appendChild(btn);
		});
	}
	modal.style.display = 'flex';
}

function checkEventAfterSettle() {
	document.getElementById('settle-modal').style.display = 'none';
	const isEndOfGame = state.day >= 30 || state.money < 0;
    
    if (!isEndOfGame && state.day % state.eventCycle === 0) {
        triggerBigEvent(); 
    } else {
        nextDay();
    }
}

function triggerBigEvent() {
	const ev = BIG_EVENTS[Math.floor(Math.random() * BIG_EVENTS.length)];
	document.getElementById('event-title').textContent = `🔥 第 ${state.day} 天 ${ev.title}`;
	document.getElementById('event-desc').textContent = ev.desc;
	const optBox = document.getElementById('event-options');
	optBox.innerHTML = '';
	ev.options.forEach(opt => {
		const btn = document.createElement('button');
		btn.className = 'btn-main';
		btn.textContent = opt.text;
		btn.onclick = () => {
			const newImpact = { ...opt.impact };
			if(newImpact.duration){log(`<span style="color:var(--warning)">[事件] ${newImpact.log} (持續 ${newImpact.duration} 天，預計 ${state.day + newImpact.duration+1} 日恢復)</span>`);}
			else {log(`<span style="color:var(--warning)">[事件] ${newImpact.log} (永久)</span>`);}
			
			state.historyEvents.push(newImpact);
			document.getElementById('event-modal').style.display = 'none';
			updateUI(); 
			nextDay();
		};
		optBox.appendChild(btn);
	});
	document.getElementById('event-modal').style.display = 'flex';
}

function nextDay() {
	if (state.money < 0) {
		gameOver("破產！這裡是最終經營總結報告。");
		return;
	}
	
	state.activeBuffs.forEach(buff => {
        if (buff.stages) {
            let current = buff.stages[buff.currentStage];
            
            // 如果當前階段有時間限制
            if (current.duration !== Infinity) {
                current.duration--;

                // 如果時間到了，切換到下一階段
                if (current.duration < 0 && buff.currentStage < buff.stages.length - 1) {
                    buff.currentStage++;
                    let next = buff.stages[buff.currentStage];
                    log(`<span style="color:var(--primary)">[升級] ${buff.name}：${next.log}</span>`);
                }
            }
        }
    });
	
	state.historyEvents.forEach(event => {
		if (event.duration !== undefined) {
			event.duration--;
		}
	});

	const originalCount = state.historyEvents.length;
	state.historyEvents = state.historyEvents.filter(event => 
		event.duration === undefined || event.duration > -1
	);

	if (state.historyEvents.length < originalCount) {
		log(`<span style="color:var(--success)">[事件] 部分暫時性事件影響已結束。</span>`);
	}

	state.day++;
	if (state.day > 30) {
		state.day = 30; // 固定在30天
		gameOver("30 天經營結束！這裡是最終經營總結報告。");
		return;
	}

	updateUI(); 
	document.getElementById('btn-start').disabled = false;
	
}

function setSpeed(speed) {
	state.gameSpeed = speed;
	document.querySelectorAll('.btn-speed').forEach(btn => btn.classList.remove('active'));
	document.getElementById(`speed-${speed}`).classList.add('active');
}

function gameOver(title) {
	document.getElementById('btn-start').classList.add('hidden-area');
	//document.getElementById('game-canvas').classList.add('hidden-area');

	const strategyArea = document.querySelector('.strategy-history-area');
	if (strategyArea) strategyArea.classList.add('expanded-card');

	const logArea = document.getElementById('game-log');
	logArea.classList.add('fully-visible');
	
	updateUI(); 
	log(`<b style='color:var(--primary); font-size:24px;'>${title}</b>`);
	drawChart();
}

function showWarning(text) {
	const toast = document.createElement('div');
	toast.className = 'insufficient-funds-toast';
	toast.textContent = text;
	document.body.appendChild(toast);
	
	setTimeout(() => {
		toast.remove();
	}, 1500);
}
function log(msg) {
	const l = document.getElementById('game-log');
	l.innerHTML = `[${state.day}日] ${msg}<br>` + l.innerHTML;
}
function showEffectPanel() {
    const list = document.getElementById('effect-detail-list');
    list.innerHTML = "";

    // 定義屬性，加入 reverse: true 表示「數值上升是壞事」
    const props = [
        { keySum: 'dSum', keyMul: 'dMul', keyAdd: 'dAdd', label: '📈 客流量', unit: '%', isRate: true, reverse: false },
        { keySum: 'pSum', keyMul: 'pMul', label: '💰 售價', unit: '%', isRate: true, reverse: false },
        { keySum: 'cSum', keyMul: 'cMul', label: '📦 成本', unit: '%', isRate: true, reverse: true }, // 成本高=壞
        { keySum: 'persSum', keyMul: 'persMul', label: '👥 人事費', unit: '%', isRate: true, reverse: true }, // 人事費高=壞
        { keyAdd: 'rentAdd', keyMul: 'rMul', label: '🏢 房租變動', unit: '元', isRate: false, reverse: true }// 房租高=壞
    ];

    let hasAnyEffect = false;

    props.forEach(prop => {
        let items = [];
        let currentSum = 0;
        let currentMul = 1.0;
        let currentAdd = 0;

        const collectData = (sourceArray, typeName) => {
            sourceArray.forEach(obj => {
				const impact = obj.stages ? obj.stages[obj.currentStage] : obj;
                if (prop.keySum && impact[prop.keySum] !== undefined) {
					items.push({ 
						name: obj.name || (obj.log ? obj.log.split('：')[0] : "未知事件"), 
						val: impact[prop.keySum], 
						type: typeName, 
						method: '加法' 
					});
					currentSum += impact[prop.keySum];
				}
				if (prop.keyMul && impact[prop.keyMul] !== undefined) {
					items.push({ 
						name: obj.name || (obj.log ? obj.log.split('：')[0] : "未知事件"), 
						val: impact[prop.keyMul], 
						type: typeName, 
						method: '乘法' 
					});
					currentMul *= impact[prop.keyMul];
				}
				if (prop.keyAdd && impact[prop.keyAdd] !== undefined) {
					items.push({ 
						name: obj.name || (obj.log ? obj.log.split('：')[0] : "未知事件"), 
						val: impact[prop.keyAdd], 
						type: typeName, 
						method: '數值' 
					});
					currentAdd += impact[prop.keyAdd];
				}
            });
        };

        collectData(state.activeBuffs, '策略');
        collectData(state.historyEvents, '事件');

        if (items.length > 0) {
            hasAnyEffect = true;
            
            // --- 計算總計文字與顏色 ---
            let summaryText = "";
            let summaryColor = "";
            
            if (prop.isRate) {
                const finalRate = ((1 + currentSum) * currentMul) - 1;
                const pct = (finalRate * 100).toFixed(1);
                const prefix = finalRate >= 0 ? "+" : "";
                
                // 顏色邏輯：若為 reverse 且數值增加，顯示紅色
                const isPositiveEffect = prop.reverse ? finalRate <= 0 : finalRate >= 0;
                summaryColor = isPositiveEffect ? 'var(--success)' : 'var(--danger)';
                
                summaryText = `總加成：<span style="color:${summaryColor}">${prefix}${pct}%</span>`;
            } else {
                const prefix = currentAdd >= 0 ? "+" : "";
                const isPositiveEffect = prop.reverse ? currentAdd <= 0 : currentAdd >= 0;
                summaryColor = isPositiveEffect ? 'var(--success)' : 'var(--danger)';
                
				if (currentMul !== 1) {
					summaryText = `幅度：<span style="color:${summaryColor}">x${currentMul.toFixed(2)}</span>`;
				} else {
					summaryText = `總計：<span style="color:${summaryColor}">${prefix}${currentAdd.toLocaleString()}元</span>`;
				}
				
                //summaryText = `總計：<span style="color:${summaryColor}">${prefix}${currentAdd.toLocaleString()}元</span>`;
            }

            let groupHTML = `
                <div style="margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
                        <b style="font-size: 18px; color: #1e293b;">${prop.label}</b>
                        <b style="font-size: 16px;">${summaryText}</b>
                    </div>`;
            
            // --- 計算細項顏色 ---
            items.forEach(item => {
                let displayVal = "";
                let itemColor = "";
                let prefix = "";
                let isGood = true;

                if (item.method === '加法') {
                    displayVal = `${(item.val * 100).toFixed(0)}%`;
                    prefix = item.val >= 0 ? "+" : "";
                    isGood = prop.reverse ? item.val <= 0 : item.val >= 0;
                } else if (item.method === '乘法') {
                    displayVal = `x${item.val.toFixed(2)}`;
                    isGood = prop.reverse ? item.val <= 1 : item.val >= 1;
                } else {
                    displayVal = `${item.val.toLocaleString()}元`;
                    prefix = item.val >= 0 ? "+" : "";
                    isGood = prop.reverse ? item.val <= 0 : item.val >= 0;
                }
                
                itemColor = isGood ? 'var(--success)' : 'var(--danger)';
                
                groupHTML += `
                    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-top: 4px; color: #475569;">
                        <span>
                            <small style="background:#fff; border:1px solid #ddd; padding:0px 4px; border-radius:4px; margin-right:5px; font-size:10px;">${item.type}</small> 
                            ${item.name} 
                        </span>
                        <span style="color:${itemColor}">${prefix}${displayVal}</span>
                    </div>`;
            });
            groupHTML += `</div>`;
            list.innerHTML += groupHTML;
        }
    });

    if (!hasAnyEffect) {
        list.innerHTML = "<div style='text-align:center; padding:40px; color:#94a3b8;'>目前沒有任何加成效果</div>";
    }

    document.getElementById('effect-modal').style.display = 'flex';
}

function resetGame() {
    if (!confirm("確定要放棄目前的進度並重新開始嗎？")) return;

    // 1. 回歸初始狀態 (與你宣告 state 時一致)
    state = {
        shop: null,
        money: 50000,
        day: 1, 
        activeBuffs: [],
        historyEvents: [],
        difficulty: 'normal',
        eventCycle: 5,
        rent: 1000,
        personnel: 2400,
        expenseMod: 1,
        dailyRev: 0,
        dailySold: 0,
        gameSpeed: 1,
        expansionLevel: 0,
        branchPositions: [],
		historyData: []
    };
	
    // 2. 清除畫面上的動態元素
    document.getElementById('game-log').innerHTML = ""; // 清空紀錄
    document.getElementById('sub-stores-container').innerHTML = ""; // 移除所有分店
    
    // 3. 重設 UI 樣式 (例如縮放後的店面)
    const shopNode = document.getElementById('shop-node');
    shopNode.style.display = 'none';
    shopNode.style.transform = `translateX(-50%) scale(1)`;
	if (window.myChartInstance instanceof Chart) {
        window.myChartInstance.destroy();
        window.myChartInstance = null; // 清空引用
    }
	document.getElementById('chart-container').style.display = 'none';
    // 4. 回到初始選單
    document.getElementById('setup-modal').style.display = 'flex';
    document.getElementById('setup-content').innerHTML = `
        <h2 style="font-size: 28px;">🏬 第一步：選擇你的事業起源</h2>
        <div class="type-grid">
            <button class="btn-type" onclick="chooseDiff('drink')"><h4>🥤 飲料店</h4><p>客流量極大、低單價、低成本。</p></button>
            <button class="btn-type" onclick="chooseDiff('bakery')"><h4>🥐 烘焙坊</h4><p>低成本、需求穩定、中等人事費。</p></button>
            <button class="btn-type" onclick="chooseDiff('game')"><h4>🎮 電玩店</h4><p>高單價、高利潤、需求不穩定。</p></button>
            <button class="btn-type" onclick="chooseDiff('hobby')"><h4>🧸 玩具店</h4><p>高單價、需求穩定、高人事費。</p></button>
        </div>
    `;

    // 5. 恢復開店按紐 (如果是 GameOver 狀態會被隱藏)
    document.getElementById('btn-start').classList.remove('hidden-area');
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-start').textContent = "開店!";

    // 6. 重設速度按鈕
    setSpeed(1);
}

function drawChart() {
    const ctx = document.getElementById('businessChart').getContext('2d');
    document.getElementById('chart-container').style.display = 'block';

    const labels = state.historyData.map(d => `第${d.day}天`);
    if (window.myChartInstance instanceof Chart) {
        window.myChartInstance.destroy();
    }
	
    window.myChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                /*{
                    label: '銷量',
                    data: state.historyData.map(d => d.sold),
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b',
                    yAxisID: 'y1', // 銷量通常數字較小，用右邊座標軸
                    tension: 0.3
                },*/
                {
                    label: '淨利',
                    data: state.historyData.map(d => d.profit),
                    borderColor: '#10b981',
                    backgroundColor: '#10b981',
                    yAxisID: 'y1',
                    tension: 0.3
                },
                {
                    label: '💰 現金',
                    data: state.historyData.map(d => d.cash),
                    borderColor: '#6366f1',
                    backgroundColor: '#6366f1',
                    yAxisID: 'y',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
			maintainAspectRatio: false, // 關鍵：讓它能聽從 CSS 的高度設定
            plugins: {
                legend: {
                    position: window.innerWidth > 768 ? 'top' : 'bottom', // 手機版將圖例移到下方
                }
            },
			elements: {
				point: {
					radius: 0 // 將數據點半徑設為 0，即隱藏
				}
			},
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { // 左邊座標軸：金額
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '現金 (元)' }
                },
                y1: { // 右邊座標軸：數量
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false }, // 避免兩組網格線重疊
                    title: { display: true, text: '淨利 (元)' }
                }
            }
        }
    });
}