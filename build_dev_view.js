const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'total_banners_view.html');
const destPath = path.join(__dirname, 'dev_banners_view.html');

let html = fs.readFileSync(srcPath, 'utf8');

// Update Title
html = html.replace('<title>All Google RTB Banners Preview</title>', '<title>All Google RTB Banners Dev Preview</title>');
html = html.replace('<h1 style="font-size: 22px; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.5px;">Google RTB\r\n\t\t\t</h1>', '<h1 style="font-size: 22px; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.5px;">Google RTB (Dev Viewer)\r\n\t\t\t</h1>');

// Replace iframe src to data-dev-src and point to dev files
// Example: src="blackGold/ui/openRtb_blackGold_336x280_ui.html" -> data-dev-src="blackGold/dev/openRtb_blackGold_336x280.html"
html = html.replace(/src="([a-zA-Z]+)\/ui\/([a-zA-Z0-9_]+)_ui\.html"/g, 'data-dev-src="$1/dev/$2.html"');

// Replace the script section
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>') + 9;

const newScript = `<script>
		document.addEventListener('DOMContentLoaded', () => {
			const sections = document.querySelectorAll('.section');
			const navLinks = document.querySelectorAll('.side-nav a');

			function updateScrollSpy() {
				let current = '';
				sections.forEach(section => {
					const sectionTop = section.offsetTop;
					if (window.pageYOffset >= sectionTop - 120) {
						current = section.getAttribute('id');
					}
				});

				if (!current && sections.length > 0) {
					current = sections[0].getAttribute('id');
				}

				navLinks.forEach(link => {
					link.classList.remove('active');
					if (link.getAttribute('href') === \`#\${current}\`) {
						link.classList.add('active');
					}
				});
			}

			window.addEventListener('scroll', updateScrollSpy);
			updateScrollSpy();

			const toggleSale = document.getElementById('toggle-sale');
			const iframes = document.querySelectorAll('iframe');

			const mockData = {
                '{{logo}}': 'https://img.mobon.net/newAd/img/logoImg/mobonLogo02.png',
                
                // Item 1
                '{{purl1}}': 'javascript:void(0)',
                '{{img1}}': 'https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg',
                '{{pnm1}}': '쿨링 썸머 카라넥 원피스',
                '{{discount1}}': '32',
                '{{price2_1}}': '39,900원',
                '{{price1}}': '49,900원',
                '{{pcode1}}': 'test-pcode1',

                // Item 2
                '{{purl2}}': 'javascript:void(0)',
                '{{img2}}': 'https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg',
                '{{pnm2}}': '베이직 코튼 반팔 티셔츠',
                '{{discount2}}': '15',
                '{{price2_2}}': '15,900원',
                '{{price2}}': '19,000원',
                '{{pcode2}}': 'test-pcode2',

                // Item 3
                '{{purl3}}': 'javascript:void(0)',
                '{{img3}}': 'https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg',
                '{{pnm3}}': '와이드 데님 팬츠',
                '{{discount3}}': '20',
                '{{price2_3}}': '29,900원',
                '{{price3}}': '38,000원',
                '{{pcode3}}': 'test-pcode3',

                // Item 4
                '{{purl4}}': 'javascript:void(0)',
                '{{img4}}': 'https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg',
                '{{pnm4}}': '린넨 밴딩 쇼츠',
                '{{discount4}}': '10',
                '{{price2_4}}': '24,900원',
                '{{price4}}': '28,000원',
                '{{pcode4}}': 'test-pcode4',

                // Common
                '{{purl}}': 'javascript:void(0)',
                '{{img}}': 'https://www.dabagirl.co.kr/web/product/big/202105/04ff60dbb9fa51e3c47fc8e4bdc27c08.jpg',
                '{{HTTP}}': 'https://img.mobon.net',
                '{{HTTP_DR}}': 'https://img.mobon.net',
                '{{wp_imgtag}}': '',
                '{{UUID}}': 'test-uuid',
                '{{USER}}': 'test-user',
                '{{ITL_TP_CODE}}': 'test-code'
            };

			async function loadDevBanner(iframe) {
                const devSrc = iframe.getAttribute('data-dev-src');
                if (!devSrc) return;

                try {
                    const response = await fetch(devSrc);
                    let content = await response.text();

                    // Replace placeholders with mock data
                    for (const [key, value] of Object.entries(mockData)) {
                        content = content.split(key).join(value);
                    }
                    
                    // Dynamic replacement for box1 based on toggle state
                    const isSale = toggleSale.checked;
                    const saleClass = isSale ? 'sale' : '';
                    content = content.split('{{box1}}').join(saleClass);
                    content = content.split('{{box2}}').join(saleClass);
                    content = content.split('{{box3}}').join(saleClass);
                    content = content.split('{{box4}}').join(saleClass);

                    // Inject into iframe
                    iframe.srcdoc = content;
                } catch (e) {
                    console.error("Failed to load dev file:", devSrc, e);
                }
            }

			function updateAllIframes() {
				iframes.forEach(iframe => {
					loadDevBanner(iframe);
				});
			}

			toggleSale.addEventListener('change', updateAllIframes);
			updateAllIframes();
		});
	</script>`;

html = html.substring(0, scriptStart) + newScript + html.substring(scriptEnd);

fs.writeFileSync(destPath, html);
console.log('dev_banners_view.html has been created successfully!');
