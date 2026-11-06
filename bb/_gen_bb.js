// 블랙프라이데이 블라인드 배너 생성기 — spotlight/_gen_spotlight.js 를 바탕으로 시안 AC(블라인드)를 기본 적용, 16 사이즈 ui / dev 생성 (2026-11-04)
// 실행 : node bb/_gen_bb.js   → bb/ui/openRtb_bb_{w}_{h}_ui.html · bb/dev/openRtb_bb_{w}_{h}.html · bb_banners_view.html
// 고칠 때는 이 파일을 고치고 재실행 (생성 HTML 을 직접 고치면 재생성 시 덮어씀). spotlight 생성기를 고쳐도 여기엔 반영 안 됨
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT_UI = path.join(__dirname, 'ui');
const OUT_DEV = path.join(__dirname, 'dev');
for (const d of [OUT_UI, OUT_DEV]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

// ───────── 사이즈 정의 ─────────
// f : card(사진 꽉 채움 + 글자 아래 + 썸네일 우상단 세로) · strip(사진 | 글자 | 썸네일 가로) · mini(사진 | 글자 | 썸네일 세로)
//     tiny(사진 | 글자 | 썸네일 가로, 50~60 높이) · tower(사진 위 + 글자 + 썸네일 격자 아래)
// r : 스포트 반지름, th : 썸네일 한 변, thumbs : 썸네일 개수(= 최대 상품 수), head/cta/badge : 글자 크기
// 2026-11-03 사용자 : 상품 수는 728x90 만 1~5개, 나머지 사이즈는 1~4개 (max). 썸네일은 정사각형 또는 3:4(ratio = 세로/가로, 1 또는 4/3).
//   50~60px 초소형(tiny)은 썸네일이 안 들어가 금색 점(dots)으로 대신함 (점에 마우스 → 전환). 상품 1개면 썸네일/점 숨김
const DEFAULT_MAX = 4;
const SIZES = [
	// card : 썸네일 세로 한 줄, th 한 변, tgap 간격
	{ w: 300, h: 250, f: 'card', r: 125, th: 34, tgap: 5, head: 30, cta: 14, badge: 10, pad: 12, shade: 55, gapY: 8 },
	{ w: 336, h: 280, f: 'card', r: 140, th: 38, tgap: 5, head: 34, cta: 15, badge: 11, pad: 14, shade: 55, gapY: 9 },
	{ w: 250, h: 250, f: 'card', r: 105, th: 30, tgap: 5, head: 24, cta: 12, badge: 9, pad: 10, txt: 13, shade: 52, gapY: 7 },
	{ w: 200, h: 200, f: 'card', r: 85, th: 26, tgap: 4, head: 19, cta: 11, badge: 9, pad: 8, txt: 11, shade: 50, gapY: 6 },
	{ w: 300, h: 150, f: 'card', r: 75, th: 30, tgap: 4, head: 24, cta: 13, badge: 9, pad: 10, txt: 13, shade: 45, gapY: 6 },
	// strip : 728 은 남는 폭을 5개가 나눔. sq 는 높이에서 세로를 계산해 고정, grid 는 cols x rows 격자, ratio 4/3 이면 3:4 세로
	// 2026-11-03 사용자 "가로형 썸네일 최대한 키워" : 사진·글자 영역을 줄이고 위아래 여백을 3~6px 로 → 728 ≈ 79 x 84, 970 116 정사각형, 468 50 정사각형, 320x100 34, 300x100 30
	{ w: 728, h: 90, f: 'strip', max: 5, r: 48, img: 150, one: 330 /* 상품 1개일 때 사진 폭 (2026-11-04) */, bg: 152, ml: 8, head: 20, cta: 13, badge: 10, tp: '3px 4px 3px 4px', tg: 3, gapY: 6 },
	// n3 : 상품 3개일 때 전용 배치 (2026-11-03 사용자 "3개는 세로로 일렬") — 970 은 정사각형 75 세 개를 세로 한 줄로 (높이 250 - 여백 12 - 간격 12) / 3
	{ w: 970, h: 250, f: 'strip', r: 130, img: 390, one: 600 /* 상품 1개일 때 사진 폭 (2026-11-04) */, ml: 16, /* 2026-11-03 "이미지 영역 더 넓게" 330 → 390 (글자 ≈ 304 + 썸네일 2x2 254 를 뺀 폭) */ head: 38, cta: 18, badge: 13, sq: true, grid: { cols: 2, rows: 2 }, ratio: 1, tpv: 6, tph: 8, tg: 6, gapY: 12, n3: { side: 75 } },
	{ w: 468, h: 60, f: 'strip', r: 34, img: 108, one: 200 /* 상품 1개일 때 사진 폭 (2026-11-04) */, ml: 8, /* 2026-11-03 wide(남는 폭 전부, 1개면 ≈320) 는 "너무 넓어" → 고정 108 (처음 90) */ head: 15, cta: 10, badge: 8, sq: true, ratio: 1, tpv: 5, tph: 5, tg: 3, gapY: 4 },
	// mini : 썸네일 2 x 2 정사각형 격자
	// 2026-11-03 사용자 "왼쪽 상품 정사각형으로" : 사진 100x100. 폭이 빠듯해 글자를 줄이고(300 은 배지·CTA 가 두 줄로 접힘)
	// 2026-11-03 "왼쪽 이미지 가로 최대한" : 사진은 남는 폭 전부(flex), 글자 BLACK/FRIDAY 두 줄로 좁게
	// → "너무 넓어졌다" 130/120 → "너무 좁아졌어" : 사진 폭 고정 150 / 138
	{ w: 320, h: 100, f: 'mini', r: 56, img: 150, one: 200 /* 상품 1개일 때 사진 폭 (2026-11-04) */, head: 18, cta: 10, badge: 9 /* 2026-11-04 배지 8 → 9 */, th: 30, px: 6, gapY: 5, stack: true },
	{ w: 300, h: 100, f: 'mini', r: 54, img: 138, one: 186 /* 상품 1개일 때 사진 폭 (2026-11-04) */, head: 18, cta: 10 /* 2026-11-04 320x100 과 같게 : 17·9 → 18·10 */, badge: 9 /* 2026-11-04 배지 8 → 9 */, th: 28, px: 5, gapY: 5, stack: true },
	// tiny : 점 (헤드라인 옆)
	// 2026-11-03 사용자 "초소형 이미지 영역 더 넓게" : 70/66/60 → 120/105/76 (글자+점 블록 ≈ 170 을 뺀 나머지)
	{ w: 320, h: 50, f: 'tiny', r: 32, img: 145, head: 13, cta: 10, badge: 9, dots: true, dot: 4, dotGap: 7, px: 6, gapY: 5 /* 2026-11-04 "BLACK FRIDAY 와 아래 문구 간격 1px 더" 3 → 4 → 5 */ },
	{ w: 300, h: 50, f: 'tiny', r: 30, img: 128, head: 12, cta: 10, badge: 8, dots: true, dot: 4, dotGap: 7, px: 6, gapY: 5 /* 2026-11-04 3 → 4 → 5 */ },
	{ w: 234, h: 60, f: 'tiny', r: 32, img: 86, head: 13, cta: 10, badge: 9, dots: true, dot: 3, dotGap: 6, px: 6, gapY: 7 /* 2026-11-04 3 → 5 → 7 */, wrapHead: true },
	// tower : cols x rows 격자, ratio 세로/가로. 사진 높이는 남는 만큼(flex)
	// 300x600 : 사용자 "꽉 차게" (2026-11-03) → card 로 사진을 전체에 채우고 BLACK/FRIDAY 두 줄, 썸네일 정사각형 56 세로 한 줄
	// bottomThumbs : 썸네일을 하단 가로 한 줄로 (사용자 2026-11-03), 글자는 그 위. 4개 3:4(62x83) · 3개 3:4(85x113) · 2개 정사각형 133
	// 300x600 도 tower (2026-11-03 "FRIDAY 아래로는 이미지 안 가리게" : 헤드라인만 사진 위, 배지·CTA 는 사진 밖). n3row : 3개도 가로 한 줄(3:4)
	{ w: 300, h: 600, f: 'tower', r: 150, head: 46, cta: 16, badge: 12, cols: 4, rows: 1, ratio: 4 / 3, pad: 16, gapY: 10, stack: true, n3row: true },
	// 160·120 은 3개면 정사각형 세 개를 세로 한 줄로(n3col 한 변)
	// tower 는 글자를 사진 아래쪽에 겹쳐 올리고(shade) 썸네일은 검정 바탕 하단 (2026-11-03 "160 3개 별로" → 3개면 정사각형 96/88 세로 한 줄)
	{ w: 160, h: 600, f: 'tower', r: 80, head: 32 /* 2026-11-04 26 → 32 */, cta: 13, badge: 12 /* 2026-11-04 배지 9 → 10 → 11 → 12, CTA 12 → 13 */, cols: 2, rows: 2, ratio: 4 / 3, pad: 12, gapY: 10 /* 2026-11-04 글자 위아래 여백 조금 더 8 → 10 */, stack: true, rowCol: true, fill: true, n3col: 90 },
	{ w: 120, h: 600, f: 'tower', r: 60, head: 24 /* 2026-11-04 20 → 24 */, cta: 12, badge: 10 /* 2026-11-04 CTA 11 → 12, 배지 9 → 10 */, cols: 2, rows: 2, ratio: 4 / 3, pad: 10, gapY: 8 /* 2026-11-04 6 → 8 */, stack: true, rowCol: true, fill: true, n3col: 80 },
];
for (const s of SIZES) s.max = s.max || DEFAULT_MAX; // 스포트 반지름 r · shade 는 표 값 그대로 (시안 J 와 동일)

// 미리보기용 상품 (magazine 과 동일 구조)
const PRODUCTS = `[{
					img: "https://cafe24img.poxo.com/dabainsang/web/product/small/202607/e623213db5bca94aa297685e252f0857.webp",
					pnm: "코튼 벨티드 원피스",
					dc_rate: "25",
					prdt_prmct: "9,989,900",
					price: "198,000",
					pcode: "test1",
					purl: "javascript:void(0)",
					advrtsReplcCode: "01",
					advrtsReplcNm: ""
				},
				{
					img: "https://cafe24img.poxo.com/dabainsang/web/product/small/202607/34d5572c55d7962dc09e3688c031d90e.jpg",
					pnm: "베이직 라운드 반팔 티셔츠",
					dc_rate: "15",
					prdt_prmct: "15,900",
					price: "19,000",
					pcode: "test2",
					purl: "javascript:void(0)",
					advrtsReplcCode: "01",
					advrtsReplcNm: ""
				},
				{
					img: "https://cafe24img.poxo.com/dabainsang/web/product/small/202607/228785c2d74d7238046842d7afaab05b.webp",
					pnm: "와이드 핏 데님 팬츠",
					dc_rate: "20",
					prdt_prmct: "29,900",
					price: "38,000",
					pcode: "test3",
					purl: "javascript:void(0)",
					advrtsReplcCode: "01",
					advrtsReplcNm: ""
				},
				{
					img: "https://cafe24img.poxo.com/dabainsang/web/product/small/202605/4d1d0b5a8cb9825defe09be105af08cb.jpg",
					pnm: "여름 린넨 밴딩 쇼츠",
					dc_rate: "",
					prdt_prmct: "",
					price: "28,000",
					pcode: "test4",
					purl: "javascript:void(0)",
					advrtsReplcCode: "01",
					advrtsReplcNm: ""
				},
				{
					img: "https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg",
					pnm: "쿨링 썸머 카라넥 원피스",
					dc_rate: "30",
					prdt_prmct: "39,900",
					price: "57,000",
					pcode: "test5",
					purl: "javascript:void(0)",
					advrtsReplcCode: "01",
					advrtsReplcNm: ""
				}
			]`;

// ───────── CSS ─────────
const commonCss = s => {
	/* 스포트 밖 밝기 = 시안 J 와 동일 (card/tower .5, 가로형 .72). 2026-11-03 한때 .8/.9 까지 밝혔다가 사용자 "시안 J 정도로 어두울 필요" 로 복귀 */
	const dim = (s.f === 'card' || s.f === 'tower') ? '.5' : '.72';
	const bpad = s.f === 'tiny' ? '2px 5px' : '3px 7px';
	return `
		/* 1. 웹 폰트 head 에서 비동기 로드 */

		/* 2. 배너 & 이미지 규격 */
		:root {
			--width: ${s.w}px;
			--height: ${s.h}px;
			--gold: #e6e8eb;
			--gold-dark: #7d828a;
			--gold-rgb: 230, 232, 235;
			--bg: #0b1730;
			--bg-rgb: 11, 23, 48;
			--panel: #162540;
			--r: ${s.r}px;
		}

		/* 3. 공통사항 */
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		.mobonLogo {
			position: absolute;
			top: 2px;
			right: 2px;
			width: 11px;
			height: 11px;
			background: url('https://img.mobon.net/newAd/img/logoImg/mobonLogo02.png') center center;
			background-size: 11px 11px;
			opacity: 0.8;
			z-index: 1001;
			cursor: pointer;
		}

		.mobonLogo:hover {
			width: 73px;
			height: 15px;
			background: url('https://img.mobon.net/newAd/img/logoImg/mobonLogo_over02.png') center center;
			background-size: 73px 15px;
		}

		/* 4. 해당 사이즈 배너 */
		.mobon_reset {
			position: relative;
			width: var(--width);
			height: var(--height);
			font-family: "pretendard", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif;
			color: #fff;
			background: var(--bg);
			overflow: hidden;
		}

		.mobon_banner {
			position: relative;
			display: flex;
			width: 100%;
			height: 100%;
			cursor: pointer;
		}

		.img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
		}

		.img.is-panning {
			object-position: left top;
			animation: panImage 5s ease-in-out infinite alternate;
		}

		@keyframes panImage {
			0% {
				object-position: left top;
			}

			100% {
				object-position: right bottom;
			}
		}

		.slider_wrap {
			position: relative;
			flex-shrink: 0;
			overflow: hidden;
			background: var(--panel);
			z-index: 1;
		}

		.slider_wrap .img {
			position: absolute;
			top: 0;
			left: 0;
		}

		.slider_wrap > .img {
			filter: brightness(${dim}) saturate(.8);
		}

		.lit {
			position: absolute;
			inset: 0;
			animation: spot 7s ease-in-out infinite;
		}

		.lit .img {
			filter: none;
		}

		@keyframes spot {
			0%, 100% {
				clip-path: circle(var(--r) at 35% 40%);
			}

			33% {
				clip-path: circle(calc(var(--r) * .9) at 68% 32%);
			}

			66% {
				clip-path: circle(calc(var(--r) * 1.1) at 55% 62%);
			}
		}

		.slider_wrap.follow .lit {
			animation: none;
			clip-path: circle(var(--r) at var(--mx) var(--my));
			transition: clip-path .12s ease-out;
		}

		.bg {
			position: relative;
			display: flex;
			flex-direction: column;
			gap: ${s.gapY}px;
			z-index: 2;
		}

		.head {
			font-size: ${s.head}px;
			font-weight: 900;
			line-height: 1;
			letter-spacing: -.5px;
			white-space: nowrap;
			background: linear-gradient(100deg, var(--gold-dark) 0%, var(--gold) 45%, var(--gold) 55%, var(--gold-dark) 100%);
			background-size: 220% 100%;
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
			animation: sweep 3.2s linear infinite;
		}

		@keyframes sweep {
			0% {
				background-position: 120% 0;
			}

			100% {
				background-position: -120% 0;
			}
		}

		.row {
			display: flex;
			align-items: center;
			gap: ${s.f === 'tiny' ? 5 : 8}px;
		}

		.badge {
			flex-shrink: 0;
			font-size: ${s.badge}px;
			font-weight: 800;
			line-height: 1;
			color: var(--gold);
			border: 1px solid var(--gold);
			padding: ${bpad};
			white-space: nowrap;
		}

		.badge .b_sale,
		.head .b_sale {
			display: none;
		}

		.head .hl {
			white-space: nowrap;
		}

		.badge.sale .b_sale,
		.head.sale .b_sale {
			display: inline;
		}

		.badge.sale .b_default,
		.head.sale .b_default {
			display: none;
		}

		.cta {
			display: inline-flex;
			align-items: center;
			gap: 3px;
			font-size: ${s.cta}px;
			font-weight: 700;
			color: #fff;
			white-space: nowrap;
		}

		.cta .arrow {
			flex-shrink: 0;
			color: var(--gold);
			animation: nudge .9s ease-in-out infinite;
		}

		@keyframes nudge {
			0%, 100% {
				transform: translateX(0);
			}

			50% {
				transform: translateX(3px);
			}
		}

		.thumb_wrap {
			position: relative;
			display: flex;
			z-index: 2;
		}

		.thumb {
			position: relative;
			flex-shrink: 0;
			overflow: hidden;
			background: var(--panel);
			border: 1px solid rgba(var(--gold-rgb), .35);
			cursor: pointer;
		}

		.thumb.active {
			border: 2px solid var(--gold);
		}

		.thumb .img {
			position: absolute;
			top: 0;
			left: 0;
		}
`;
};

const familyCss = s => {
	switch (s.f) {
		case 'card': return `
		/* 5. card */
		.slider_wrap {
			position: absolute;
			inset: 0;
		}

		.shade {
			position: absolute;
			inset: 0;
			background: linear-gradient(180deg, rgba(var(--bg-rgb), 0) ${s.shade}%, rgba(var(--bg-rgb), .9) 100%);
			z-index: 1;
			pointer-events: none;
		}

${s.bottomThumbs ? (() => {
	/* 하단 가로 썸네일 : 폭을 n 등분, 세로는 3:4 (2개면 정사각형). 글자는 썸네일 위로 */
	const dims = n => { const w = Math.floor((s.w - s.pad * 2 - (n - 1) * 6) / n); return { w, h: n >= 3 ? Math.round(w * 4 / 3) : w }; };
	return `
		.thumb_wrap {
			position: absolute;
			left: ${s.pad}px;
			right: ${s.pad}px;
			bottom: ${s.pad}px;
			gap: 6px;
		}

		.thumb {
			flex: 1 1 0;
			min-width: 0;
		}

		.bg {
			position: absolute;
			left: ${s.pad}px;
			right: ${s.pad}px;
			bottom: ${s.pad}px;
		}
${[4, 3, 2].map(n => { const d = dims(n); return `
		.items-${n} .thumb {
			height: ${d.h}px;
		}

		.items-${n} .slider_wrap,
		.items-${n} .shade {
			bottom: ${s.pad + d.h + 8}px;
		}

		.items-${n} .bg {
			bottom: ${s.pad + d.h + 20}px;
		}
`; }).join('')}`; })() : `
		.thumb_wrap {
			position: absolute;
			top: ${s.pad}px;
			right: ${s.pad}px;
			flex-direction: column;
			gap: ${s.tgap}px;
		}

		.thumb {
			width: ${s.th}px;
			height: ${s.th}px;
		}

		.bg {
			position: absolute;
			left: ${s.txt || s.pad}px;
			right: ${s.txt || s.pad}px;
			bottom: ${s.txt || s.pad}px;
		}
`}${s.stack ? `
		.head {
			white-space: normal;
			line-height: 1.05;
		}
` : ''}`;
		case 'strip': return `
		/* 5. strip */
		.mobon_banner {
			align-items: center;
		}

		.slider_wrap {
			${s.wide ? 'flex: 1 1 auto; min-width: 0;' : `width: ${s.img}px;`}
			height: 100%;
			-webkit-mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
			mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
		}

		.bg {
			${s.sq && !s.wide ? 'flex: 1 1 auto; min-width: 0;' : 'flex: 0 0 auto;'}
			margin-left: ${s.ml}px;
			justify-content: center;
		}
${s.one ? `
		.items-1 .slider_wrap {
			width: ${s.one}px;
			flex: 0 0 ${s.one}px;
		}

		.items-1 .bg {
			flex: 0 1 auto;
			min-width: 0;
			margin: 0 auto;
		}
` : ''}${s.sq ? (() => {
	/* 고정 썸네일 : 세로 = (높이 - 위아래 여백 - 격자 간격) / 행 수, 가로 = 세로 / ratio (1 정사각형 · 4/3 → 3:4) */
	const rows = s.grid ? s.grid.rows : 1;
	const cols = s.grid ? s.grid.cols : s.max;
	const thH = Math.floor((s.h - s.tpv * 2 - (rows - 1) * s.tg) / rows);
	const thW = Math.round(thH / s.ratio);
	return `
		.thumb_wrap {
			flex: 0 0 auto;
			height: 100%;
			width: ${cols * thW + (cols - 1) * s.tg + s.tph * 2}px;
			${s.grid ? 'flex-wrap: wrap; align-content: center; justify-content: center;' : 'align-items: center; justify-content: flex-end;'}
			padding: ${s.tpv}px ${s.tph}px;
			gap: ${s.tg}px;
		}

		.thumb {
			width: ${thW}px;
			height: ${thH}px;
		}
${s.n3 ? `
		.items-3 .thumb_wrap {
			width: auto;
			flex-direction: column;
			flex-wrap: nowrap;
			justify-content: center;
		}

		.items-3 .thumb {
			width: ${s.n3.side}px;
			height: ${s.n3.side}px;
		}
` : ''}`; })() : `
		.thumb_wrap {
			flex: 1 1 0;
			min-width: 0;
			height: 100%;
			justify-content: flex-end;
			padding: ${s.tp};
			gap: ${s.tg}px;
			margin-left: 6px;
		}

		.thumb {
			flex: 1 1 0;
			min-width: 0;
			max-width: ${s.h - 10}px;
		}
`}`;
		case 'mini': return `
		/* 5. mini */
		.mobon_banner {
			align-items: center;
		}

		.slider_wrap {
			flex: 0 0 ${s.img}px;
			height: 100%;
			-webkit-mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
			mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
		}

		.bg {
			flex: 1 1 auto;
			min-width: 0;
			padding: 0 ${s.px}px 0 4px;
			justify-content: center;
		}

		.bg {
			gap: 7px;
		}
${s.one ? `
		.items-1 .slider_wrap {
			flex: 0 0 ${s.one}px;
		}

		.items-1 .bg {
			flex: 0 1 auto;
			margin: 0 auto;
			padding-left: 0;
		}
` : ''}
		.head {
			line-height: .98;
			letter-spacing: 0;
		}

		.row {
			display: contents;
		}

		.row .badge {
			order: -1;
			align-self: flex-start;
			padding: 2px 5px;
		}

		.thumb_wrap {
			flex: 0 0 auto;
			width: ${s.th * 2 + 4}px;
			flex-wrap: wrap;
			align-content: center;
			justify-content: center;
			gap: 4px;
			margin-right: 5px;
		}

		.thumb {
			width: ${s.th}px;
			height: ${s.th}px;
		}
${(() => { const t3 = Math.floor((s.h - 16) / 3); return `
		.items-3 .thumb_wrap {
			width: ${t3}px;
			flex-direction: column;
			flex-wrap: nowrap;
		}

		.items-3 .thumb {
			width: ${t3}px;
			height: ${t3}px;
		}
`; })()}`;
		case 'tiny': return `
		/* 5. tiny */
		.mobon_banner {
			align-items: center;
		}

		.slider_wrap {
			flex: 0 0 ${s.img}px;
			height: 100%;
			-webkit-mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
			mask-image: linear-gradient(90deg, #000 0%, #000 50%, rgba(0, 0, 0, .85) 62%, rgba(0, 0, 0, .55) 75%, rgba(0, 0, 0, .25) 87%, rgba(0, 0, 0, .07) 95%, transparent 100%);
		}

		.bg {
			flex: 1 1 auto;
			min-width: 0;
			padding: 0 ${s.px + 2}px 0 4px;
			justify-content: center;
		}

		.top_row {
			display: flex;
			align-items: center;
			gap: 10px;
			${s.wrapHead ? 'flex-wrap: wrap; gap: 2px 10px;' : ''}
		}

		.thumb_wrap {
			flex: 0 0 auto;
			align-items: center;
			gap: ${s.dotGap || 8}px;
			padding: 2px 0;
		}

		.thumb.dot {
			width: ${s.dot || 6}px;
			height: ${s.dot || 6}px;
			border-radius: 50%;
			border: 0;
			background: rgba(var(--gold-rgb), .35);
			transition: background .2s, transform .2s;
		}

		.thumb.dot.active {
			background: var(--gold);
			transform: scale(1.3);
		}
`;
		case 'tower': return `
		/* 5. tower */
		.mobon_banner {
			flex-direction: column;
		}

		.slider_wrap {
			flex: 1 1 auto;
			width: 100%;
			min-height: 0;
			background: var(--bg);
		}

		.slider_wrap.fit {
			flex: 0 0 auto;
		}

		.slider_wrap .img,
		.slider_wrap .img.is-panning {
			object-fit: contain;
			object-position: center top;
			animation: none;
		}

		.bg {
			flex: 1 1 auto;
			justify-content: center;
			padding: ${s.pad}px;
		}
${s.fill ? `
		.slider_wrap .img {
			object-fit: cover;
			object-position: center 15%;
		}

		.slider_wrap .img.is-panning {
			object-fit: cover;
			object-position: left 15%;
			animation: panX 5s ease-in-out infinite alternate;
		}

		@keyframes panX {
			0% {
				object-position: left 15%;
			}

			100% {
				object-position: right 15%;
			}
		}

		.slider_wrap .img.is-panning.pan-y {
			object-position: center top;
			animation-name: panY;
		}

		@keyframes panY {
			0% {
				object-position: center top;
			}

			100% {
				object-position: center bottom;
			}
		}

		.slider_wrap {
			-webkit-mask-image: linear-gradient(180deg, #000 0%, #000 86%, rgba(0, 0, 0, .6) 93%, transparent 100%);
			mask-image: linear-gradient(180deg, #000 0%, #000 86%, rgba(0, 0, 0, .6) 93%, transparent 100%);
		}

		.bg {
			flex: 0 0 auto;
			padding: ${s.pad + 2}px ${s.pad}px ${s.pad - 2}px;
		}

		.thumb_wrap {
			padding-top: ${s.pad - 2}px;
		}

		.items-1 .bg {
			padding-bottom: ${s.pad * 2}px;
		}
` : ''}

		.head {
			white-space: normal;
			line-height: 1.05;
		}

		.row {
${s.rowCol ? `			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
` : ''}		}
${(() => {
	/* 썸네일 격자 : 폭을 열 수로 나눠 한 변을 정하고, 세로는 ratio(1 정사각형 · 4/3 세로 3:4) 로. 4개 2x2 · 2개 한 줄 · 3개는 n3row 면 가로 한 줄, 아니면 정사각형 세로 한 줄 */
	const g = 10;
	const thW = Math.floor((s.w - s.pad * 2 - (s.cols - 1) * g) / s.cols);
	const thH = Math.round(thW * s.ratio);
	const wN = n => Math.floor((s.w - s.pad * 2 - (n - 1) * g) / n);
	return `
		.thumb_wrap {
			flex: 0 0 auto;
			flex-wrap: wrap;
			justify-content: center;
			gap: ${g}px;
			padding: ${s.pad}px ${s.pad}px ${s.pad}px;
		}

		.thumb {
			width: ${thW}px;
			height: ${thH}px;
		}
${s.n3row ? [3, 2].map(n => `
		.items-${n} .thumb {
			width: ${wN(n)}px;
			height: ${n === 2 ? wN(n) : Math.round(wN(n) * s.ratio)}px;
		}
`).join('') : `
		.items-3 .thumb_wrap {
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: center;
		}

		.items-3 .thumb {
			width: ${s.n3col}px;
			height: ${s.n3col}px;
		}
`}`; })()}`;
	}
	return '';
};

// ───────── 시안 AC 블라인드 (spotlight_looks_view 의 시안 AC 를 기본으로 적용, 2026-11-04) ─────────
// 사진은 원본 밝기(스포트라이트 끔), 상품이 바뀔 때마다 세로 블라인드가 걷히듯 열림 (.slider_wrap.rv 재시작)
// 확정 2026-11-04 : 블라인드 1 반투명 (어두운 줄 .5 · 선 .5) — 처음 안(검정 줄 + 금선 .9)은 블라인드 시안 0 으로 남김
const acCss = s => {
	const tiny = s.h <= 60;
	return `
		.look-ac .slider_wrap > .img {
			filter: none;
		}

		.look-ac .lit {
			display: none;
		}

		@property --bw {
			syntax: '<length>';
			inherits: false;
			initial-value: 0px;
		}

		.look-ac .slider_wrap::after {
			content: '';
			position: absolute;
			inset: 0;
			--bw: 0px;
			background: repeating-linear-gradient(90deg, rgba(var(--bg-rgb), .5) 0, rgba(var(--bg-rgb), .5) var(--bw), rgba(var(--gold-rgb), .5) var(--bw), rgba(var(--gold-rgb), .5) calc(var(--bw) + 1px), transparent calc(var(--bw) + 1px), transparent ${tiny ? 14 : 22}px);
			opacity: 0;
			pointer-events: none;
			z-index: 2;
		}

		.look-ac .slider_wrap.rv::after {
			animation: lookBlind 1s cubic-bezier(.6, 0, .3, 1);
		}

		@keyframes lookBlind {
			0%, 15% {
				--bw: ${tiny ? 14 : 22}px;
				opacity: 1;
			}

			90% {
				opacity: 1;
			}

			100% {
				--bw: 0px;
				opacity: 0;
			}
		}
`;
};

// 대체배너 이미지 규격 — 같은 규격 이미지가 없는 사이즈는 매거진 dev 와 같은 대체 규격 사용
const FALLBACK_IMG = { '234x60': '300x65', '300x100': '320x100', '300x50': '720x120' };

// ───────── 색상 시안 (2026-11-05 사용자 선택으로 5개만: 로즈골드·라벤더·미드나잇+실버·아이스 블루 (+확정 네이비+실버)) ─────────
// 미리보기(ui) 전용 ?theme=k → .mobon_reset 에 .theme-k. 확정 2026-11-05 : 네이비 + 실버(--bg #0b1730) → :root 기본값으로 반영(dev 포함), 이전 확정 미드나잇은 시안 x 로 남김. 포인트 색만 있는 시안은 검정 바탕
// accent : 포인트 색(--gold 계열) [밝은색, 어두운색, rgb] · bg : 바탕 [바탕, rgb, 썸네일 바탕]
const THEMES = [
	{ k: 'r', n: '로즈골드', accent: ['#f4b7a3', '#8c4d3c', '244, 183, 163'] },
	{ k: 'b', n: '아이스 블루', accent: ['#7fd3ff', '#1f5f88', '127, 211, 255'] },
	{ k: 'l', n: '라벤더', accent: ['#d6c2ff', '#6a56a0', '214, 194, 255'] },
	{ k: 'x', n: '미드나잇 + 실버', accent: ['#e6e8eb', '#7d828a', '230, 232, 235'], bg: ['#0a1020', '10, 16, 32', '#162036'] },
];
const themeCss = () => THEMES.map(t => `
		.theme-${t.k} {${t.accent ? `
			--gold: ${t.accent[0]};
			--gold-dark: ${t.accent[1]};
			--gold-rgb: ${t.accent[2]};` : ''}${t.bg ? `
			--bg: ${t.bg[0]};
			--bg-rgb: ${t.bg[1]};
			--panel: ${t.bg[2]};` : `
			--bg: #000;
			--bg-rgb: 0, 0, 0;
			--panel: #1a1a1a;`}
		}
`).join('');

const fallbackCss = `
		/* 대체 배너 */
		.fallback_banner {
			display: none;
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}

		.fallback_link {
			display: block;
			width: 100%;
			height: 100%;
			cursor: pointer;
		}

		.fallback_banner img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			background-position: center center;
		}
`;

// ───────── HTML ─────────
const arrow = s => `<svg class="arrow" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

const bodyHtml = s => {
	const ambient = false; // 2026-11-03 사용자 "검정 영역에 상품 배경 보이는 건 아니야" → 앰비언트 배경 사용 안 함 (검정은 검정 그대로)
	return `
	<div class="mobon_banner">
${ambient ? `			<!-- 앰비언트 배경 (현재 상품 사진) -->
			<div class="ambient"><img class="img ambient_img" src="" alt="" decoding="async"></div>
` : ''}
			<!-- 메인 이미지 -->
			<div class="slider_wrap">
				<img class="img main_img" src="" alt="메인 이미지" fetchpriority="high">
				<div class="lit"><img class="img lit_img" src="" alt="" decoding="async"></div>
			</div>
${s.f === 'card' ? `			<div class="shade"></div>
` : ''}
${s.f === 'tower' ? `			<!-- 텍스트 정보 영역 -->
			<div class="bg">
				<div class="head"><span class="b_default"><span class="hl">SNS</span><br><span class="hl">HOT ITEM</span></span><span class="b_sale">BLACK<br>FRIDAY</span></div>
				<div class="row">
					<span class="badge"><span class="b_default">구매 찬스</span><span class="b_sale">비밀특가</span></span>
					<span class="cta"><span class="cta_txt">최종구매가 확인</span>${arrow(s.cta)}</span>
				</div>
			</div>` : `			<!-- 텍스트 정보 영역 -->
			<div class="bg">
${s.dots ? `				<div class="top_row">
					<div class="head"><span class="b_default">SNS HOT ITEM</span><span class="b_sale">BLACK FRIDAY</span></div>
					<!-- 상품 점 (동적 생성) -->
					<div class="thumb_wrap dots"></div>
				</div>
` : `				<div class="head">${s.stack ? '<span class="b_default"><span class="hl">SNS</span><br><span class="hl">HOT ITEM</span></span><span class="b_sale">BLACK<br>FRIDAY</span>' : '<span class="b_default">SNS HOT ITEM</span><span class="b_sale">BLACK FRIDAY</span>'}</div>
`}				<div class="row">
					<span class="badge"><span class="b_default">구매 찬스</span><span class="b_sale">비밀특가</span></span>
					<span class="cta"><span class="cta_txt">최종구매가 확인</span>${arrow(s.cta)}</span>
				</div>
			</div>`}
${s.dots ? '' : `
			<!-- 썸네일 리스트 영역 (동적 생성) -->
			<div class="thumb_wrap"></div>
`}		</div>`;
};

// ───────── JS ─────────
const bannerJs = (s, dev) => `
		(() => {
			const banner = document.querySelector('.mobon_banner');
			const sliderWrap = document.querySelector('.slider_wrap');
			const mainImgEl = document.querySelector('.main_img');
			const litImgEl = document.querySelector('.lit_img');
			const ambientImgEl = document.querySelector('.ambient_img');
			const badgeEls = document.querySelectorAll('.badge, .head');
			const thumbWrap = document.querySelector('.thumb_wrap');
			const MAX_ITEMS = ${s.max};
${dev ? `			const frameWidth = {{w}};
			const frameHeight = {{h}};
			const mainBanner = document.getElementById('noHiddenMobon');
			const fallbackBanner = document.getElementById('hiddenMobon');

			const allProducts = window.__mobonProducts;
` : `
			const allProducts = ${PRODUCTS};
			/* 미리보기 전용: ?sale=1|0 비밀특가/구매 찬스 강제, ?items=n 상품 수, ?theme=k 색상 시안 */
			(() => {
				const p = new URLSearchParams(window.location.search);
				const theme = p.get('theme');
				if (theme) document.querySelector('.mobon_reset').classList.add('theme-' + theme);
				const sale = p.get('sale');
				if (sale === '1') allProducts.forEach(x => { if (!x.prdt_prmct) x.prdt_prmct = x.price; });
				if (sale === '0') allProducts.forEach(x => { x.prdt_prmct = ''; x.dc_rate = ''; });
				const itemsCount = p.get('items');
				if (itemsCount) allProducts.length = Math.min(allProducts.length, parseInt(itemsCount, 10));
			})();
`}
			new MutationObserver(() => { sliderWrap.classList.remove('rv'); void sliderWrap.offsetWidth; sliderWrap.classList.add('rv'); }).observe(mainImgEl, { attributes: true, attributeFilter: ['src'] });
			if (allProducts.length > MAX_ITEMS) allProducts.length = MAX_ITEMS;
			const totalImages = allProducts.length;
			document.querySelector('.mobon_reset').classList.add('items-' + totalImages);

			const isDots = thumbWrap.classList.contains('dots');
			thumbWrap.innerHTML = allProducts.map((item, index) =>
				isDots ?
				'<span class="thumb dot" data-index="' + index + '"></span>' :
				'<div class="thumb" data-index="' + index + '">' +
				'<img class="img" src="' + item.img + '" alt="' + item.pnm + '" data-pcode="' + item.pcode + '" fetchpriority="' + (index === 0 ? 'high' : 'low') + '" decoding="async">' +
				'</div>'
			).join('');
			if (totalImages <= 1) thumbWrap.style.display = 'none';
			if (isDots) {
				allProducts.slice(1).forEach(item => { const im = new Image(); im.src = item.img; });
			}
			const thumbs = document.querySelectorAll('.thumb');

			let currentIndex = 0;
			let intervalId;

			const checkPanning = (img) => {
				const wrap = img.parentElement;
				if (!wrap.clientWidth || !wrap.clientHeight) return;

				const wrapRatio = wrap.clientWidth / wrap.clientHeight;
				const imgRatio = img.naturalWidth / img.naturalHeight;

				const overflowPx = imgRatio > wrapRatio ?
					(wrap.clientHeight * imgRatio) - wrap.clientWidth :
					(wrap.clientWidth / imgRatio) - wrap.clientHeight;

				const overflowRatio = imgRatio > wrapRatio ?
					overflowPx / wrap.clientWidth :
					overflowPx / wrap.clientHeight;

				if (overflowRatio > 0.3) {
					img.classList.add('is-panning');
					img.classList.toggle('pan-y', imgRatio <= wrapRatio);
					img.style.animationDuration = overflowPx <= 40 ? '3s' : '5s';
				} else {
					img.classList.remove('is-panning', 'pan-y');
					img.style.animationDuration = '';
				}
			};

			const syncLit = () => {
				const on = mainImgEl.classList.contains('is-panning');
				const dur = mainImgEl.style.animationDuration;
				const y = mainImgEl.classList.contains('pan-y');
				[mainImgEl, litImgEl].forEach(img => {
					img.classList.remove('is-panning');
					void img.offsetWidth;
					img.style.animationDuration = on ? dur : '';
					img.classList.toggle('pan-y', on && y);
					if (on) img.classList.add('is-panning');
				});
			};

${s.f === 'tower' ? `			const textEl = document.querySelector('.mobon_banner > .bg');
			const fitTower = () => {
				if (${s.fill ? 'true' : 'false'}) return;
				if (!mainImgEl.naturalWidth) return;
				sliderWrap.classList.remove('fit');
				sliderWrap.style.height = '';
				textEl.style.flex = '0 0 auto';
				const avail = document.querySelector('.mobon_reset').clientHeight - textEl.offsetHeight - thumbWrap.offsetHeight;
				textEl.style.flex = '';
				const want = Math.round(sliderWrap.clientWidth * mainImgEl.naturalHeight / mainImgEl.naturalWidth);
				sliderWrap.style.height = Math.min(avail, want) + 'px';
				sliderWrap.classList.add('fit');
			};
` : `			const fitTower = () => {};
`}
			thumbs.forEach(thumb => {
				const thumbImg = thumb.querySelector('.img');
				if (!thumbImg) return;
				if (thumbImg.complete && thumbImg.naturalWidth > 0) {
					checkPanning(thumbImg);
				} else {
					thumbImg.addEventListener('load', () => checkPanning(thumbImg), { once: true });
				}
			});

			function showProduct(index) {
				thumbs.forEach(t => t.classList.remove('active'));
				if (thumbs[index]) thumbs[index].classList.add('active');

				const product = allProducts[index];
				if (!product) return;

				mainImgEl.src = product.img;
				mainImgEl.alt = product.pnm;
				mainImgEl.dataset.pcode = product.pcode;
				litImgEl.src = product.img;
				if (ambientImgEl) ambientImgEl.src = product.img;

				const onReady = () => { checkPanning(mainImgEl); syncLit(); fitTower(); };
				if (mainImgEl.complete && mainImgEl.naturalWidth > 0) {
					onReady();
				} else {
					mainImgEl.addEventListener('load', onReady, { once: true });
				}

				const isSale = !!product.prdt_prmct;
				badgeEls.forEach(b => b.classList.toggle('sale', isSale));
				fitHead();
			}

			function fitHead() {
				document.querySelectorAll('.head .hl').forEach(el => {
					el.style.fontSize = '';
					const max = el.closest('.head').clientWidth, w = el.offsetWidth;
					if (w > max && max > 0) el.style.fontSize = Math.floor(parseFloat(getComputedStyle(el).fontSize) * max / w * 2) / 2 + 'px';
				});
			}
			if (document.fonts) document.fonts.ready.then(fitHead);

			function nextProduct() {
				currentIndex = (currentIndex + 1) % totalImages;
				showProduct(currentIndex);
			}

			function startSlider() {
				if (totalImages <= 1) return;
				stopSlider();
				intervalId = setInterval(nextProduct, 3000);
			}

			function stopSlider() {
				clearInterval(intervalId);
			}

			banner.addEventListener('mouseenter', stopSlider);
			banner.addEventListener('mouseleave', startSlider);

			thumbs.forEach(thumb => {
				thumb.addEventListener('mouseenter', () => {
					currentIndex = parseInt(thumb.getAttribute('data-index'));
					showProduct(currentIndex);
				});

				thumb.addEventListener('click', (e) => {
					e.stopPropagation();
					const purl = allProducts[parseInt(thumb.getAttribute('data-index'))].purl;
					if (purl && purl !== "javascript:void(0)") {
						window.open(purl, '_blank');
					}
				});
			});

			banner.addEventListener('click', () => {
				const purl = allProducts[currentIndex].purl;
				if (purl && purl !== "javascript:void(0)") {
					window.open(purl, '_blank');
				}
			});

			banner.addEventListener('mousemove', (e) => {
				const r = sliderWrap.getBoundingClientRect();
				const x = e.clientX - r.left;
				const y = e.clientY - r.top;
				if (x < 0 || y < 0 || x > r.width || y > r.height) {
					sliderWrap.classList.remove('follow');
					return;
				}
				sliderWrap.style.setProperty('--mx', x + 'px');
				sliderWrap.style.setProperty('--my', y + 'px');
				sliderWrap.classList.add('follow');
			});
			banner.addEventListener('mouseleave', () => sliderWrap.classList.remove('follow'));
${dev ? `
			const handleImageErrors = () => {
				const allBannerImages = document.querySelectorAll('.img');
				let isFallbackTriggered = false;
				const handleImageError = (event) => {
					if (isFallbackTriggered) return;
					isFallbackTriggered = true;
					const pcode = event.target.dataset.pcode || '';
					if (mainBanner) mainBanner.style.display = 'none';
					if (fallbackBanner) {
						fallbackBanner.style.display = 'block';
						fallbackBanner.style.width = frameWidth + 'px';
						fallbackBanner.style.height = frameHeight + 'px';
					}
					const errorUrl = '{{HTTP_DR}}/rtbShop?uid=' + encodeURIComponent("{{UUID}}") + '&u={{USER}}&pc=' + pcode + '&itlTpCode={{ITL_TP_CODE}}';
					(new Image()).src = errorUrl;
				};
				allBannerImages.forEach(img => {
					if (img.getAttribute('src') && img.complete && img.naturalHeight === 0) {
						handleImageError({ target: img });
					} else {
						img.addEventListener('error', handleImageError);
					}
				});
			};
			handleImageErrors();
` : ''}
			showProduct(currentIndex);
			startSlider();
		})();
`;

// ───────── 페이지 ─────────
const page = (s, dev) => `<!DOCTYPE html>
<html lang="ko">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>구글RTB 배너 블랙프라이데이 블라인드 (가격 없음) ${s.w}x${s.h}</title>
	<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
${dev ? `	<script>
		window.__mobonProducts = [{{productList}}];
		window.__mobonPreload = (() => {
			try {
				const first = window.__mobonProducts[0];
				if (!first || !first.img) return;
				const link = document.createElement('link');
				link.rel = 'preload';
				link.as = 'image';
				link.href = first.img;
				link.fetchPriority = 'high';
				document.head.appendChild(link);
			} catch (e) {}
		})();
	</script>
` : ''}	<style>${commonCss(s)}${familyCss(s)}${acCss(s)}${dev ? fallbackCss : themeCss()}	</style>
</head>

<body>
	<div class="mobon_reset look-ac"${dev ? ' id="noHiddenMobon"' : ''}>
		<div class="mobonLogo" onclick="window.open('{{HTTP}}/ad/linfo.php')"></div>${bodyHtml(s)}
	</div>
${dev ? `
	<!-- 노출 추적 태그 -->
	{{wp_imgtag}}

	<!-- 대체 배너 영역 -->
	<div class="fallback_banner" id="hiddenMobon">
		<div class="mobonLogo" onclick="window.open('{{HTTP}}/ad/linfo.php')"></div>
		<div class="fallback_link" onclick="window.open('https://mobon.net/bridge/')">
			<img src="{{HTTP}}/servlet/image/mobon/${FALLBACK_IMG[s.w + 'x' + s.h] || s.w + 'x' + s.h}.png" alt="대체배너">
		</div>
	</div>
` : ''}
	<script>${bannerJs(s, dev)}	</script>
</body>

</html>
`;

const written = [];
for (const s of SIZES) {
	const ui = path.join(OUT_UI, `openRtb_bb_${s.w}_${s.h}_ui.html`);
	const dev = path.join(OUT_DEV, `openRtb_bb_${s.w}_${s.h}.html`);
	fs.writeFileSync(ui, page(s, false), 'utf8');
	fs.writeFileSync(dev, page(s, true), 'utf8');
	written.push(ui, dev);
}

// 뷰 공통 CSS (simpleMagazine_noprice_banners_view.html 과 동일)
const viewCss = "\n\t\t@import url(\"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css\");\n\n\t\thtml {\n\t\t\tscroll-behavior: smooth;\n\t\t}\n\n\t\t* {\n\t\t\tmargin: 0;\n\t\t\tpadding: 0;\n\t\t\tbox-sizing: border-box;\n\t\t}\n\n\t\tbody {\n\t\t\tfont-family: \"pretendard\";\n\t\t\tbackground-color: #f4f5f7;\n\t\t\tpadding: 50px;\n\t\t}\n\n\t\t.control-panel {\n\t\t\tposition: sticky;\n\t\t\ttop: 0;\n\t\t\tbackground: rgba(255, 255, 255, 0.75);\n\t\t\tbackdrop-filter: blur(12px);\n\t\t\t-webkit-backdrop-filter: blur(12px);\n\t\t\tpadding: 16px 40px;\n\t\t\tmargin: -50px -50px 40px -50px;\n\t\t\tborder-bottom: 1px solid rgba(0, 0, 0, 0.06);\n\t\t\tbox-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);\n\t\t\tz-index: 100;\n\t\t\tdisplay: flex;\n\t\t\talign-items: center;\n\t\t\tjustify-content: space-between;\n\t\t\tgap: 20px;\n\t\t\tflex-wrap: wrap;\n\t\t}\n\n\t\t.toggle-switch {\n\t\t\tposition: relative;\n\t\t\tdisplay: inline-flex;\n\t\t\talign-items: center;\n\t\t\tcursor: pointer;\n\t\t\tgap: 12px;\n\t\t}\n\n\t\t.toggle-switch input[type=\"checkbox\"] {\n\t\t\topacity: 0;\n\t\t\twidth: 0;\n\t\t\theight: 0;\n\t\t\tposition: absolute;\n\t\t}\n\n\t\t.toggle-switch .slider {\n\t\t\tposition: relative;\n\t\t\twidth: 52px;\n\t\t\theight: 28px;\n\t\t\tbackground-color: #d1d5db;\n\t\t\tborder-radius: 34px;\n\t\t\ttransition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n\t\t}\n\n\t\t.toggle-switch .slider:before {\n\t\t\tposition: absolute;\n\t\t\tcontent: \"\";\n\t\t\theight: 22px;\n\t\t\twidth: 22px;\n\t\t\tleft: 3px;\n\t\t\tbottom: 3px;\n\t\t\tbackground-color: white;\n\t\t\tborder-radius: 50%;\n\t\t\ttransition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n\t\t\tbox-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);\n\t\t}\n\n\t\t.toggle-switch input[type=\"checkbox\"]:checked+.slider {\n\t\t\tbackground: linear-gradient(135deg, #FF416C, #FF4B2B);\n\t\t\tbox-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);\n\t\t}\n\n\t\t.toggle-switch input[type=\"checkbox\"]:checked+.slider:before {\n\t\t\ttransform: translateX(24px);\n\t\t}\n\n\t\t.toggle-switch .label-text {\n\t\t\tfont-size: 15px;\n\t\t\tfont-weight: 700;\n\t\t\tcolor: #1a1a1a;\n\t\t\tuser-select: none;\n\t\t\tletter-spacing: -0.3px;\n\t\t}\n\n\t\t.items-tabs {\n\t\t\tdisplay: inline-flex;\n\t\t\tgap: 2px;\n\t\t\tpadding: 3px;\n\t\t\tbackground-color: #f1f3f5;\n\t\t\tborder-radius: 8px;\n\t\t}\n\n\t\t.item-tab {\n\t\t\tborder: 0;\n\t\t\tbackground: transparent;\n\t\t\tcolor: #717171;\n\t\t\tfont-family: inherit;\n\t\t\tfont-size: 13px;\n\t\t\tfont-weight: 600;\n\t\t\tletter-spacing: -0.3px;\n\t\t\twhite-space: nowrap;\n\t\t\tpadding: 7px 12px;\n\t\t\tborder-radius: 6px;\n\t\t\tcursor: pointer;\n\t\t\ttransition: color 0.15s ease, background-color 0.15s ease;\n\t\t}\n\n\t\t.item-tab:hover {\n\t\t\tcolor: #1a1a1a;\n\t\t}\n\n\t\t.item-tab.active {\n\t\t\tbackground-color: #fff;\n\t\t\tcolor: #1a1a1a;\n\t\t\tfont-weight: 700;\n\t\t\tbox-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);\n\t\t}\n\n\t\t.item-tab:focus-visible {\n\t\t\toutline: 2px solid #1a1a1a;\n\t\t\toutline-offset: 1px;\n\t\t}\n\n\t\t.section {\n\t\t\tmargin-bottom: 60px;\n\t\t\tscroll-margin-top: 115px;\n\t\t}\n\n\t\t.section-title {\n\t\t\tfont-size: 20px;\n\t\t\tfont-weight: 800;\n\t\t\tcolor: #1a1a1a;\n\t\t\tmargin-bottom: 30px;\n\t\t\tpadding-bottom: 12px;\n\t\t\tborder-bottom: 1px solid #e0e0e0;\n\t\t\tdisplay: flex;\n\t\t\talign-items: center;\n\t\t\tgap: 8px;\n\t\t}\n\n\t\t.section-title .picked {\n\t\t\tdisplay: inline-block;\n\t\t\tfont-size: 13px;\n\t\t\tfont-weight: 700;\n\t\t\tcolor: #fff;\n\t\t\tbackground: #FF416C;\n\t\t\tborder-radius: 4px;\n\t\t\tpadding: 3px 8px;\n\t\t\tmargin-left: 4px;\n\t\t}\n\n\t\t.group-title {\n\t\t\tfont-size: 16px;\n\t\t\tfont-weight: 700;\n\t\t\tcolor: #495057;\n\t\t\tmargin: 30px 0 15px;\n\t\t\tpadding-left: 10px;\n\t\t\tborder-left: 4px solid #1a1a1a;\n\t\t\tline-height: 1.2;\n\t\t}\n\n\t\t.variant-desc {\n\t\t\tfont-size: 13px;\n\t\t\tcolor: #555;\n\t\t\tline-height: 1.6;\n\t\t\tmax-width: 820px;\n\t\t\tmargin-bottom: 14px;\n\t\t\tword-break: keep-all;\n\t\t}\n\n\t\t.tooltip-wrap {\n\t\t\tposition: relative;\n\t\t\tdisplay: inline-flex;\n\t\t\talign-items: center;\n\t\t\tjustify-content: center;\n\t\t\tcursor: pointer;\n\t\t}\n\n\t\t.tooltip-icon {\n\t\t\tdisplay: inline-flex;\n\t\t\talign-items: center;\n\t\t\tjustify-content: center;\n\t\t\twidth: 20px;\n\t\t\theight: 20px;\n\t\t\tborder-radius: 50%;\n\t\t\tbackground-color: #e0e0e0;\n\t\t\tcolor: #666;\n\t\t\tfont-size: 14px;\n\t\t\tfont-weight: bold;\n\t\t}\n\n\t\t.tooltip-wrap:hover .tooltip-icon {\n\t\t\tbackground-color: #666;\n\t\t\tcolor: #fff;\n\t\t}\n\n\t\t.tooltip-content {\n\t\t\tdisplay: none;\n\t\t\tposition: absolute;\n\t\t\tleft: 100%;\n\t\t\ttop: 50%;\n\t\t\ttransform: translateY(-50%);\n\t\t\tmargin-left: 10px;\n\t\t\tbackground-color: #333;\n\t\t\tcolor: #fff;\n\t\t\tpadding: 8px 12px;\n\t\t\tborder-radius: 6px;\n\t\t\tfont-size: 14px;\n\t\t\tfont-weight: 500;\n\t\t\tline-height: 1.7;\n\t\t\twhite-space: nowrap;\n\t\t\tz-index: 10;\n\t\t\tbox-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n\t\t}\n\n\t\t.tooltip-content::before {\n\t\t\tcontent: '';\n\t\t\tposition: absolute;\n\t\t\tright: 100%;\n\t\t\ttop: 50%;\n\t\t\ttransform: translateY(-50%);\n\t\t\tborder-width: 5px;\n\t\t\tborder-style: solid;\n\t\t\tborder-color: transparent #333 transparent transparent;\n\t\t}\n\n\t\t.tooltip-wrap:hover .tooltip-content {\n\t\t\tdisplay: block;\n\t\t}\n\n\t\t.banner-grid {\n\t\t\tdisplay: flex;\n\t\t\tflex-wrap: wrap;\n\t\t\tgap: 40px;\n\t\t\tjustify-content: flex-start;\n\t\t\talign-items: flex-start;\n\t\t\tmargin-bottom: 20px;\n\t\t}\n\n\t\t.compare .banner-grid {\n\t\t\tgap: 20px;\n\t\t}\n\n\t\t.banner-container {\n\t\t\tdisplay: flex;\n\t\t\tflex-direction: column;\n\t\t\talign-items: center;\n\t\t\tbackground: #ffffff;\n\t\t\tpadding: 30px;\n\t\t\tborder-radius: 16px;\n\t\t\tbox-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);\n\t\t\ttransition: transform 0.2s ease;\n\t\t}\n\n\t\t.compare .banner-container {\n\t\t\tpadding: 16px;\n\t\t\tborder-radius: 10px;\n\t\t}\n\n\t\t.banner-container:hover {\n\t\t\ttransform: translateY(-5px);\n\t\t}\n\n\t\t.banner-title {\n\t\t\tfont-size: 18px;\n\t\t\tfont-weight: 700;\n\t\t\tmargin-bottom: 20px;\n\t\t\tcolor: #1a1a1a;\n\t\t\tletter-spacing: -0.5px;\n\t\t}\n\n\t\t.compare .banner-title {\n\t\t\tfont-size: 12px;\n\t\t\tcolor: #717171;\n\t\t\tmargin-bottom: 10px;\n\t\t}\n\n\t\tiframe {\n\t\t\tbox-sizing: content-box;\n\t\t\tdisplay: block;\n\t\t\tborder: 1px solid #e6e6e6;\n\t\t\tbackground-color: #fff;\n\t\t}\n\n\t\t@media (max-width: 600px) {\n\t\t\tbody {\n\t\t\t\tpadding: 20px 10px;\n\t\t\t}\n\n\t\t\t.section {\n\t\t\t\tmargin-bottom: 40px;\n\t\t\t}\n\n\t\t\t.section-title {\n\t\t\t\twidth: 100%;\n\t\t\t\tfont-size: 15px;\n\t\t\t\tmargin-bottom: 20px;\n\t\t\t\tpadding-bottom: 10px;\n\t\t\t\tline-height: 1.4;\n\t\t\t}\n\n\t\t\t.tooltip-wrap {\n\t\t\t\tdisplay: none;\n\t\t\t}\n\n\t\t\t.banner-grid {\n\t\t\t\tgap: 20px;\n\t\t\t}\n\n\t\t\t.banner-container {\n\t\t\t\twidth: 100%;\n\t\t\t\tmax-width: 100%;\n\t\t\t\tpadding: 30px 0;\n\t\t\t}\n\n\t\t\t.banner-title {\n\t\t\t\tfont-size: 14px;\n\t\t\t\tmargin-bottom: 15px;\n\t\t\t}\n\t\t}\n\t";
// ───────── 뷰 (매거진 뷰와 같은 구성) → bb_banners_view.html ─────────
const SIZE_GROUPS = [
	{ title: '정방형 / 사각형', sizes: ['336_280', '300_250', '250_250', '200_200'] },
	{ title: '가로형', sizes: ['970_250', '728_90', '468_60'] },
	{ title: '세로형1', sizes: ['300_600'] },
	{ title: '세로형2', sizes: ['160_600', '120_600'] },
	{ title: '모바일형1', sizes: ['300_150', '320_100', '300_100'] },
	{ title: '모바일형2', sizes: ['320_50', '300_50', '234_60'] }
];
const maxOf = Object.fromEntries(SIZES.map(s => [s.w + '_' + s.h, s.max]));
const view = `<!DOCTYPE html>
<html lang="ko">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>비비배너 (Black Friday Blind) Banners Preview</title>
	<style>${viewCss}</style>
</head>

<body>
	<div class="control-panel">
		<div style="display: flex; flex-direction: column; gap: 12px;">
			<div style="display: flex; align-items: center; gap: 24px;">
				<h1 style="font-size: 22px; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.5px;">Google & Kakao RTB
					<b style="color: #FF416C;">비비배너 (Black Friday Blind)</b> <span style="font-size: 15px; font-weight: 700;">가격 없음</span>
				</h1>
			</div>
		</div>
		<div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
			<div class="items-tabs">
				<button class="item-tab active" data-items="max">상품 최대 (728x90 5개 · 나머지 4개)</button>
				<button class="item-tab" data-items="3">상품 3개</button>
				<button class="item-tab" data-items="2">상품 2개</button>
				<button class="item-tab" data-items="1">상품 1개</button>
			</div>

			<label style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #1a1a1a;">색상
				<select id="theme" style="font-family: inherit; font-size: 13px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; background: #fff;">
					<option value="">확정 (네이비 + 실버)</option>
${THEMES.map(t => `					<option value="${t.k}">${t.n}</option>
`).join('')}				</select>
			</label>

			<label class="toggle-switch">
				<input type="checkbox" id="toggle-sale" checked>
				<span class="slider"></span>
				<div style="display: flex; flex-direction: column; gap: 3px; margin-left: 4px;">
					<span class="label-text" style="line-height: 1.2;">할인 상품 UI로 보기</span>
					<span style="font-size: 12px; color: #717171; font-weight: 500; letter-spacing: -0.3px;">스위치를 끄면 정가
						상품(SNS HOT ITEM · 구매 찬스) UI로 변경됩니다.</span>
				</div>
			</label>
		</div>
	</div>

	<div class="section">
		<p class="variant-desc">할인 상품 : BLACK FRIDAY · 비밀특가, &nbsp; 정가 상품 : SNS HOT ITEM · 구매 찬스 <br>상품이 바뀔 때마다 세로 블라인드가 걷히듯 열리고 3초마다 자동 롤링</p>
${SIZE_GROUPS.map(g => `		<h3 class="group-title">${g.title}</h3>
		<div class="banner-grid">
${g.sizes.map(s => { const [w, h] = s.split('_'); return `			<div class="banner-container">
				<div class="banner-title">${w} x ${h}</div>
				<iframe data-size="${s}" data-max="${maxOf[s]}" width="${w}" height="${h}" scrolling="no" loading="lazy"></iframe>
			</div>`; }).join('\n')}
		</div>
`).join('')}	</div>

	<script>
		document.addEventListener('DOMContentLoaded', () => {
			const DIR = 'bb/ui/';
			const src = (size) => DIR + 'openRtb_bb_' + size + '_ui.html';

			let currentItems = 'max';
			const toggleSale = document.getElementById('toggle-sale');
			const saleParam = () => toggleSale.checked ? '1' : '0';
			const themeSel = document.getElementById('theme');
			const iframes = document.querySelectorAll('iframe[data-size]');

			function updateAllIframesSrc() {
				iframes.forEach(iframe => {
					const items = currentItems === 'max' ? iframe.getAttribute('data-max') : currentItems;
					iframe.src = src(iframe.getAttribute('data-size')) + '?items=' + items + '&sale=' + saleParam() + (themeSel.value ? '&theme=' + themeSel.value : '');
				});
			}

			document.querySelectorAll('.item-tab').forEach(tab => {
				tab.addEventListener('click', () => {
					document.querySelectorAll('.item-tab').forEach(t => t.classList.remove('active'));
					tab.classList.add('active');
					currentItems = tab.getAttribute('data-items');
					updateAllIframesSrc();
				});
			});

			toggleSale.addEventListener('change', updateAllIframesSrc);
			themeSel.addEventListener('change', updateAllIframesSrc);

			updateAllIframesSrc();
		});
	</script>
</body>

</html>
`;
const viewPath = path.join(ROOT, 'bb_banners_view.html');
fs.writeFileSync(viewPath, view, 'utf8');
written.push(viewPath);
// ───────── 색상 한눈에 비교 (색상마다 대표 사이즈 4개 한 줄) → bb_colors_view.html ─────────
const C_SIZES = [[300, 250, 4], [728, 90, 5], [320, 100, 4], [300, 600, 4]];
const colorRows = [{ k: '', n: '확정 (네이비 + 실버)' }, ...THEMES].map(t => `	<div class="look" id="theme-${t.k || 'base'}">
		<h2>${t.k ? '색상 ' + t.k.toUpperCase() + ' · ' : ''}${t.n}${t.bg ? '<small>바탕색 변경</small>' : t.k ? '<small>포인트 색 변경</small>' : ''}</h2>
		<div class="row">${C_SIZES.map(([w, h, n]) => `<iframe data-src="bb/ui/openRtb_bb_${w}_${h}_ui.html?items=${n}${t.k ? '&theme=' + t.k : ''}" width="${w}" height="${h}" scrolling="no" loading="lazy"></iframe>`).join('')}</div>
	</div>`).join('\n');
const colorsHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>블랙프라이데이 · 색상 시안 비교</title>
<style>
	* { box-sizing: border-box; }
	body { margin: 0; padding: 28px 36px 80px; background: #eceef1; font-family: "Pretendard", -apple-system, "Malgun Gothic", sans-serif; color: #222; }
	h1 { font-size: 22px; margin: 0 0 6px; }
	.sub { color: #666; font-size: 13px; margin: 0 0 14px; line-height: 1.6; max-width: 980px; }
	.top { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; gap: 5px; padding: 10px 0; background: #eceef1; border-bottom: 1px solid #d5d8dc; margin-bottom: 18px; }
	.top a, .top button { font-size: 12px; color: #444; text-decoration: none; background: #fff; border: 1px solid #d5d8dc; border-radius: 4px; padding: 3px 7px; cursor: pointer; font-family: inherit; }
	.top a:hover, .top button.on { background: #222; color: #fff; border-color: #222; }
	.look { background: #fff; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); scroll-margin-top: 60px; }
	.look h2 { font-size: 15px; margin: 0 0 10px; }
	.look h2 small { font-size: 11px; font-weight: 600; color: #b8862b; margin-left: 6px; }
	.row { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
	iframe { display: block; border: 1px solid #d5d8dc; }
</style>
</head>
<body>
	<h1>블랙프라이데이 · 색상 시안 비교 (기본 + ${THEMES.length}개)</h1>
	<p class="sub">색상마다 300x250 · 728x90 · 320x100 · 300x600 을 한 줄로. 포인트 색 시안은 글자·배지·테두리·블라인드 선 색이, 바탕색 시안은 검정 바탕이 바뀜. 확정 색(네이비 + 실버)만 dev 에 들어가고, 나머지 색은 미리보기(ui) 전용 ?theme=. 16 사이즈 전부는 <a href="bb_banners_view.html">16 사이즈 뷰</a> 의 색상 선택으로, 하나씩은 <a href="bb_single_view.html">한 개씩 보기</a>.</p>
	<div class="top"><button data-sale="1" class="on">할인가(비밀특가)</button><button data-sale="0">정가(구매 찬스)</button><span style="width:10px"></span><a href="#theme-base">기본</a>${THEMES.map(t => `<a href="#theme-${t.k}">${t.n}</a>`).join('')}</div>
${colorRows}
	<script>
		let sale = '1';
		const render = () => document.querySelectorAll('iframe[data-src]').forEach(f => { f.src = f.dataset.src + '&sale=' + sale; });
		document.querySelectorAll('[data-sale]').forEach(b => b.addEventListener('click', () => { sale = b.dataset.sale; document.querySelectorAll('[data-sale]').forEach(x => x.classList.toggle('on', x === b)); render(); }));
		render();
	</script>
</body>
</html>
`;
const colorsPath = path.join(ROOT, 'bb_colors_view.html');
fs.writeFileSync(colorsPath, colorsHtml, 'utf8');
written.push(colorsPath);
// ───────── 배너 한 개씩 보기 → bb_single_view.html (사이즈 · 상품 수 · 가격 · 확대) ─────────
const singleHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>블랙프라이데이 · 한 개씩 보기</title>
<style>
	* { box-sizing: border-box; }
	body { margin: 0; background: #eceef1; font-family: "Pretendard", -apple-system, "Malgun Gothic", sans-serif; color: #222; display: flex; min-height: 100vh; }
	aside { width: 300px; flex-shrink: 0; background: #fff; border-right: 1px solid #d5d8dc; padding: 18px 16px 40px; height: 100vh; overflow-y: auto; position: sticky; top: 0; }
	h1 { font-size: 17px; margin: 0 0 4px; }
	.sub { font-size: 12px; color: #777; margin: 0 0 14px; line-height: 1.5; }
	.sub a { color: #777; }
	.lbl { font-size: 12px; font-weight: 700; color: #555; margin: 14px 0 6px; }
	.opts { display: flex; flex-wrap: wrap; gap: 4px; }
	.opts button { font-size: 12px; color: #444; background: #fff; border: 1px solid #d5d8dc; border-radius: 4px; padding: 3px 7px; cursor: pointer; font-family: inherit; }
	.opts button:hover, .opts button.on { background: #222; color: #fff; border-color: #222; }
	.opts button .sw { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; vertical-align: -1px; border: 1px solid rgba(0,0,0,.15); }
	main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; gap: 14px; min-width: 0; }
	.stage { display: flex; align-items: center; justify-content: center; }
	.frame { position: relative; flex-shrink: 0; box-shadow: 0 4px 18px rgba(0,0,0,.18); background: #000; }
	.frame iframe { position: absolute; left: 0; top: 0; border: 0; transform-origin: 0 0; }
	.cap { font-size: 13px; color: #444; text-align: center; line-height: 1.6; }
	.cap b { color: #111; }
	.bar { display: flex; gap: 6px; }
	.bar button { font-size: 12px; background: #222; color: #fff; border: 0; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-family: inherit; }
	.bar button.ghost { background: #fff; color: #222; border: 1px solid #c5c9ce; }
</style>
</head>
<body>
	<aside>
		<h1>한 개씩 보기</h1>
		<p class="sub">왼쪽에서 고르면 오른쪽에 배너 하나만 크게. 키보드 ← → 로 사이즈(또는 마지막에 고른 색상) 이전/다음. 주소를 복사하면 지금 조합 그대로 공유됨. 여러 개 비교는 <a href="bb_banners_view.html">16 사이즈 뷰</a></p>
		<div class="lbl">사이즈</div>
		<div class="opts" data-g="size">${SIZES.map(s => `<button data-v="${s.w}_${s.h}" data-max="${s.max}">${s.w}x${s.h}</button>`).join('')}</div>
		<div class="lbl">상품 수</div>
		<div class="opts" data-g="items"></div>
		<div class="lbl">가격</div>
		<div class="opts" data-g="sale"><button data-v="1">할인가 (비밀특가)</button><button data-v="0">정가 (구매 찬스)</button></div>
		<div class="lbl">색상</div>
		<div class="opts" data-g="theme"><button data-v="" data-n="확정 (네이비 + 실버)"><span class="sw" style="background:#e6e8eb;box-shadow:inset 0 0 0 3px #0b1730"></span>확정 네이비 + 실버</button>${THEMES.map(t => `<button data-v="${t.k}" data-n="${t.n}"><span class="sw" style="background:${t.accent ? t.accent[0] : '#f5d77a'};${t.bg ? 'box-shadow:inset 0 0 0 3px ' + t.bg[0] : ''}"></span>${t.n}</button>`).join('')}</div>
		<div class="lbl">확대</div>
		<div class="opts" data-g="zoom"><button data-v="1">1배</button><button data-v="1.5">1.5배</button><button data-v="2">2배</button><button data-v="fit">화면 맞춤</button></div>
	</aside>
	<main>
		<div class="stage"><div class="frame" id="frame"><iframe id="ifr" scrolling="no"></iframe></div></div>
		<div class="cap" id="cap"></div>
		<div class="bar"><button id="replay">다시 재생</button><button class="ghost" id="open">새 탭에서 원본 크기로</button></div>
	</main>
	<script>
		const q = new URLSearchParams(location.search);
		const st = { size: q.get('size') || '300_250', items: q.get('items') || '', sale: q.get('sale') || '1', theme: q.get('theme') || '', zoom: q.get('zoom') || '2' };
		let lastGroup = 'size';
		const g = name => document.querySelector('[data-g="' + name + '"]');
		const sizeBtn = () => g('size').querySelector('[data-v="' + st.size + '"]') || g('size').querySelector('button');
		const buildItems = () => {
			const max = +sizeBtn().dataset.max;
			if (!st.items || +st.items > max) st.items = String(max);
			g('items').innerHTML = Array.from({ length: max }, (_, i) => '<button data-v="' + (i + 1) + '">' + (i + 1) + '개</button>').join('');
		};
		const url = () => 'bb/ui/openRtb_bb_' + st.size + '_ui.html?items=' + st.items + '&sale=' + st.sale + (st.theme ? '&theme=' + st.theme : '');
		const render = () => {
			st.size = sizeBtn().dataset.v;
			buildItems();
			document.querySelectorAll('[data-g]').forEach(box => box.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === st[box.dataset.g])));
			const [w, h] = st.size.split('_').map(Number);
			const main = document.querySelector('main');
			const z = st.zoom === 'fit' ? Math.max(.5, Math.min((main.clientWidth - 60) / w, (main.clientHeight - 140) / h, 4)) : +st.zoom;
			const fr = document.getElementById('frame'), ifr = document.getElementById('ifr');
			fr.style.width = Math.round(w * z) + 'px'; fr.style.height = Math.round(h * z) + 'px';
			ifr.width = w; ifr.height = h; ifr.style.transform = 'scale(' + z + ')';
			if (ifr.dataset.src !== url()) { ifr.dataset.src = url(); ifr.src = url(); }
			document.getElementById('cap').innerHTML = '<b>' + w + ' x ' + h + '</b> · 상품 ' + st.items + '개 · ' + (st.sale === '1' ? 'BLACK FRIDAY · 비밀특가' : 'SNS HOT ITEM · 구매 찬스') + ' · 색상 <b>' + g('theme').querySelector('.on').dataset.n + '</b>';
			history.replaceState(null, '', '?' + new URLSearchParams(st).toString());
		};
		document.querySelectorAll('[data-g]').forEach(box => box.addEventListener('click', e => {
			const b = e.target.closest('button'); if (!b) return;
			st[box.dataset.g] = b.dataset.v;
			if (box.dataset.g === 'size' || box.dataset.g === 'theme') lastGroup = box.dataset.g;
			render();
		}));
		document.getElementById('replay').addEventListener('click', () => { const ifr = document.getElementById('ifr'); ifr.src = 'about:blank'; setTimeout(() => { ifr.src = url(); }, 30); });
		document.getElementById('open').addEventListener('click', () => window.open(url()));
		addEventListener('keydown', e => {
			if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
			const list = [...g(lastGroup).querySelectorAll('button')];
			const i = list.findIndex(b => b.classList.contains('on'));
			st[lastGroup] = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length].dataset.v; render();
		});
		addEventListener('resize', () => { if (st.zoom === 'fit') render(); });
		render();
	</script>
</body>
</html>
`;
const singlePath = path.join(ROOT, 'bb_single_view.html');
fs.writeFileSync(singlePath, singleHtml, 'utf8');
written.push(singlePath);
console.log(written.map(p => path.relative(ROOT, p)).join('\n'));
