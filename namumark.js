async function markdown(content, discussion = 0, title = '', flags = '') {
	// markdown 아니고 namumark
	flags = flags.split(' ');
	
	function parseTable(content) {
		var data = '\n' + content + '\n';
		
		// 캡션없는 표의 셀에 <td> 추가
		for(let _tr of (data.match(/^(\|\|(((?!\|\|($|\n))[\s\S])*)\|\|)$/gim) || [])) {
			var tr = _tr.match(/^(\|\|(((?!\|\|($|\n))[\s\S])*)\|\|)$/gim)[0];
			var otr = tr;
			var ntr = tr
				.replace(/^[|][|]/g, '<tr norender><td>')
				.replace(/[|][|]$/g, '</td></tr>')
				.replace(/[|][|]/g, '</td><td>')
				.replace(/\n/g, '<br />');
			
			data = data.replace(tr, ntr);
		}
		
		var datarows = data.split('\n');
		
		// 캡션없는 표의 시작과 끝을 감싸고, 전체에 적용되는 꾸미기 문법 적용
		for(let _tr of (data.match(/^(<tr norender><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/gim) || [])) {
			var tr = _tr.match(/^(<tr norender><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/im)[0];
			
			if (  // 표의 시작이라면(위에 || 문법 없음)
				(!((befrow = (datarows[datarows.findIndex(s => s == tr.split('\n')[0]) - 1] || '')).match(/^(<tr><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/im))) &&  // 이전 줄이 표가 아니면
				(!(befrow.match(/^(\|(((?!\|).)+)\|(((?!\|\|($|\n))[\s\S])*)\|\|)$/im)))  // 캡션도 아니면
			) {
				const fulloptions = (tr.replace(/&lt;((?!table).)*&gt;/g, '').match(/^<tr norender><td>((&lt;([a-z0-9 ]+)=(((?!&gt;).)+)&gt;)+)/i) || ['', ''])[1];
				var ts = '', trs = '';
				
				var alop, align = ((alop = (fulloptions.match(/&lt;table\s*align=(left|center|right)&gt;/))) || ['', 'left'])[1];
				if(alop) data = data.replace(tr, tr = tr.replace(alop[0], ''));
				
				var wiop, width = ((wiop = (fulloptions.match(/&lt;table\s*width=((\d+)(px|%|))&gt;/))) || ['', ''])[1];
				if(wiop) {
					data = data.replace(tr, tr = tr.replace(wiop[0], ''));
					trs += 'width: ' + width + '; ';
				}
				
				var clop, color = ((clop = (fulloptions.match(/&lt;table\s*color=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
				if(clop) {
					data = data.replace(tr, tr = tr.replace(clop[0], ''));
					trs += 'color: ' + color + '; ';
				}
				
				var bgop, bgcolor = ((bgop = (fulloptions.match(/&lt;table\s*bgcolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
				if(bgop) {
					data = data.replace(tr, tr = tr.replace(bgop[0], ''));
					trs += 'background-color: ' + bgcolor + '; ';
				}
				
				var brop, border = ((brop = (fulloptions.match(/&lt;table\s*bordercolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
				if(brop) {
					data = data.replace(tr, tr = tr.replace(brop[0], ''));
					trs += 'border: 2px solid ' + border + '; ';
				}
				
				if(trs) ts = ' style="' + trs + '"';
				
				data = data.replace(tr, '<div class="wiki-table-wrap table-' + align + '"><table class=wiki-table' + ts + '><tbody>\n' + tr);
				datarows = data.split('\n');
			} if (  // 표의 끝이라면(아래에 || 문법 없음)
				!((aftrow = (datarows[datarows.findIndex(s => s == (r = tr.split('\n'))[r.length - 1]) + 1] || '')).match(/^(<tr norender><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/im))  // 다음 줄이 표가 아니면
			) {
				data = data.replace(tr, tr + '\n</tbody></table></div>');
			}
			
			data = data.replace(tr, tr.replace('<tr norender>', '<tr>'));
			datarows = data.split('\n');
		}
		
		// 캡션있는 표 렌더링
		for(let _tr of (data.match(/^(\|(((?!\|).)+)\|(((?!\|\|($|\n))[\s\S])*)\|\|)$/gim) || [])) {
			var tr = _tr.match(/^(\|(((?!\|).)+)\|(((?!\|\|($|\n))[\s\S])*)\|\|)$/im);
			var ec = '';
			
			if (  // 표의 시작이 아니면 건너뛰기
				((befrow = (datarows[datarows.findIndex(s => s == tr[0].split('\n')[0]) - 1] || '')).match(/^(<tr><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/im))
			) continue; if (  // 표의 끝
				!((aftrow = (datarows[datarows.findIndex(s => s == (r = tr[0].split('\n'))[r.length - 1]) + 1] || '')).match(/^(<tr><td>(((?!<\/td><\/tr>($|\n))[\s\S])*)<\/td><\/tr>)$/im))  // 다음 줄이 표가 아니면
			) {
				ec = '\n</tbody></table></div>';
			}
			
			ntr = (
				('||' + tr[4] + '||')
				.replace(/^[|][|]/g, '<tr><td>')
				.replace(/[|][|]$/g, '</td></tr>')
				.replace(/[|][|]/g, '</td><td>')
				.replace(/\n/g, '<br />')
				+ ec
			);
			
			const fulloptions = (ntr.replace(/&lt;((?!table).)*&gt;/g, '').match(/^<tr><td>((&lt;([a-z0-9 ]+)=(((?!&gt;).)+)&gt;)+)/i) || ['', ''])[1];
				
			var alop, align = ((alop = (fulloptions.match(/&lt;table\s*align=(left|center|right)&gt;/))) || ['', 'left'])[1];
			if(alop) data = data.replace(ntr, ntr = ntr.replace(alop[0], ''));
			
			var ts = '', trs = '';
			
			var wiop, width = ((wiop = (fulloptions.match(/&lt;table\s*width=((\d+)(px|%|))&gt;/))) || ['', ''])[1];
			if(wiop) {
				data = data.replace(ntr, ntr = ntr.replace(wiop[0], ''));
				trs += 'width: ' + width + '; ';
			}
			
			var clop, color = ((clop = (fulloptions.match(/&lt;table\s*color=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
			if(clop) {
				data = data.replace(ntr, ntr = ntr.replace(clop[0], ''));
				trs += 'color: ' + color + '; ';
			}
			
			var bgop, bgcolor = ((bgop = (fulloptions.match(/&lt;table\s*bgcolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
			if(bgop) {
				data = data.replace(ntr, ntr = ntr.replace(bgop[0], ''));
				trs += 'background-color: ' + bgcolor + '; ';
			}
			
			var brop, border = ((brop = (fulloptions.match(/&lt;table\s*bordercolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/))) || ['', ''])[1];
			if(brop) {
				data = data.replace(ntr, ntr = ntr.replace(brop[0], ''));
				trs += 'border: 2px solid ' + border + '; ';
			}

			if(trs) ts = ' style="' + trs + '"';			
			
			data = data.replace(tr[0], '<div class="wiki-table-wrap table-' + align + '"><table class=wiki-table' + ts + '><caption>' + tr[2] + '</caption><tbody>\n' + ntr);
			datarows = data.split('\n');
		}
		
		// 셀 꾸미기
		for(let _tr of (data.match(/^<tr>(((?!<\/tr>).)*)<\/tr>$/gim) || [])) {
			var tr = _tr.match(/^<tr>(((?!<\/tr>).)*)<\/tr>$/im)[1], ntr = tr;
			
			for(let td of (tr.match(/<td>(((?!<\/td>).)*)<\/td>/g) || [])) {
				var text = (td.match(/<td>(((?!<\/td>).)*)<\/td>/) || ['', ''])[1], ot = text, ntd = td;
				var notx = text.replace(/^((&lt;([a-z0-9():\| -]+)((=(((?!&gt;).)+))*)&gt;)+)/i, '');
				var attr = '', tds = '', cs = '', rs = '';
				
				const fulloptions = (td.replace(/(&lt;table([a-z0-9 ]+)=(((?!&gt;).)+)&gt;)/g, '').match(/^<td>((&lt;([a-z0-9():\|\^ -]+)((=(((?!&gt;).)+))*)&gt;)+)/i) || ['', ''])[1];
				
				// 정렬1
				if(notx.startsWith(' ') && notx.endsWith(' ')) {
					tds += 'text-align: center; ';
				}
				else if(notx.startsWith(' ') && !notx.endsWith(' ')) {
					tds += 'text-align: right; ';
				}
				
				// 정렬2
				var align = (fulloptions.match(/&lt;([(]|[:]|[)])&gt;/) || ['', ''])[1];
				
				if(align) {
					tds += 'text-align: ' + (
						align == '(' ? (
							'left'
						) : (
							align == ')' ? (
								'right'
							) : (
								'center'
							)
						)
					) + '; ';
					ntd = ntd.replace(/&lt;([(]|[:]|[)])&gt;/, '');
				}
				
				// 너비
				var width = (fulloptions.match(/&lt;width=((\d+)(px|%|))&gt;/) || ['', ''])[1];
				if(width) {
					tds += 'width: ' + width + '; ';
					ntd = ntd.replace(/&lt;width=((\d+)(px|%|))&gt;/, '');
				}
				
				// 높이
				var height = (fulloptions.match(/&lt;height=((\d+)(px|%|))&gt;/) || ['', ''])[1];
				if(height) {
					tds += 'height: ' + height + '; ';
					ntd = ntd.replace(/&lt;height=((\d+)(px|%|))&gt;/, '');
				}
				
				// 가로 합치기
				var colspan = (fulloptions.match(/&lt;[-](\d+)&gt;/) || ['', ''])[1];
				if(colspan) {
					cs = colspan;
					ntd = ntd.replace(/&lt;[-](\d+)&gt;/, '');
				}
				
				// 세로 합치기 & 정렬
				var rowopt = (fulloptions.match(/&lt;([^]|[v]|)[|](\d+)&gt;/) || ['', '', '']);
				if(rowopt[2]) {
					rs = rowopt[2];
					switch(rowopt[1]) {
						case '^':
							tds += 'vertical-align: top; ';
							break; 
						case 'v':
							tds += 'vertical-align: bottom; ';
					}
					ntd = ntd.replace(/&lt;([^]|[v]|)[|](\d+)&gt;/, '');
				}
				
				// 셀 배경색
				var bgcolor = (fulloptions.match(/&lt;((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/) || ['', ''])[1];
				if(bgcolor) {
					tds += 'background-color: ' + bgcolor + '; ';
					ntd = ntd.replace(/&lt;((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/, '');
				}
				
				// 셀 배경색 2
				var bgcolor = (fulloptions.match(/&lt;bgcolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/) || ['', ''])[1];
				if(bgcolor) {
					tds += 'background-color: ' + bgcolor + '; ';
					ntd = ntd.replace(/&lt;bgcolor=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/, '');
				}
				
				// 글자색
				var color = (fulloptions.match(/&lt;color=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/) || ['', ''])[1];
				if(color) {
					tds += 'color: ' + color + '; ';
					ntd = ntd.replace(/&lt;color=((#[a-fA-F0-9]{3,6})|([a-zA-Z]+))&gt;/, '');
				}
				
				if(tds) attr += ' style="' + tds + '"';
				if(cs)  attr += ' colspan=' + cs;
				if(rs)  attr += ' rowspan=' + rs;
				ntd = ntd.replace(/<td>/, '<td' + attr + '>');
				
				ntr = ntr.replace(td, ntd);
			}
			data = data.replace(tr, ntr)
		}
		
		return data
			.replace(/^\n/, '')
			.replace(/\n$/, '')
			.replace(/<tbody>\n/g, '<tbody>')
			.replace(/\n<\/tbody>/g, '<tbody>')
			.replace(/<\/tr>\n/g, '</tr>')
			.replace(/\n<tr>/g, '</tr>')
			.replace(/<\/tbody><tbody><\/tbody>/g, '</tbody>');
	}
	
	function multiply(a, b) {
		if(typeof a == 'number') return a * b;
		
		var ret = '';
		for(let i=0; i<b; i++) ret += a;
		return ret;
	}
	
	var footnotes = new Stack();
	var blocks    = new Stack();
	var fndisp    = {};
	
	var fnnum  = 1;
	var fnhtml = '';
	var cates  = '';
	var data   = content;
	var doc    = processTitle(title);
	
	data = html.escape(data);
	const xref = flags.includes('backlinkinit');
	
	// 역링크 초기화
	if(xref)
		await curs.execute("delete from backlink where title = ? and namespace = ?", [doc.title, doc.namespace]);
	const xrefl = [];
	
	if(!data.includes('\n') && data.includes('\r')) data = data.replace(/\r/g, '\n');
	if(data.includes('\n') && data.includes('\r')) data = data.replace(/\r\n/g, '\n');
	
	// 한 글자 리터럴
	for(let esc of (data.match(/(?:\\)(.)/g) || [])) {
		const match = data.match(/(?:\\)(.)/);
		data = data.replace(esc, '<spannw class=nowiki>' + match[1] + '</spannw>');
	}
	
	// 블록 (접기, CSS, ...)
	for(let block of (data.match(/([}][}][}]|[{][{][{](((?!}}}).)*)[}][}][}]|[{][{][{](((?!}}}).)*))/gim) || [])) {
		if(block == '}}}') {
			if(!blocks.size()) continue;
			var od = data;
			data = data.replace('}}}', blocks.top() + '');
			if(od == data) data = data.replace('\n}}}', blocks.top() + '\r');
			blocks.pop();
			continue;
		}
		
		const h = block.match(/{{{(((?!}}}).)*)/im)[1];
		if(h.match(/^[#][!]folding\s/)) {  // 접기
			blocks.push('</dd></dl>');
			const title = h.match(/^[#][!]folding\s(.*)$/)[1];
			data = data.replace('{{{' + h + '\n', '<dl class=wiki-folding><dt>' + title + '</dt><dd>');
		} else if(h.match(/^[#][!]wiki\s/)) {  // 위키문법 & CSS
			blocks.push('</div>');
			const style = (h.match(/style=&quot;(((?!&quot;).)*)&quot;/) || ['', '', ''])[1];
			data = data.replace('{{{' + h + '\n', '<div style="' + style.replace(/&amp;quot;/g, '&quot;') + '">');
		} else if(h.match(/^[#][!]html/) && !discussion) {  // HTML
			if(block.includes('}}}')) {
				var rb = block;
				rb = rb.replace('}}}', '</rawhtml></nowikiblock>');
				rb = rb.replace('{{{#!html', '<nowikiblock><rawhtml>');
				data = data.replace(block, rb);
			} else {
				blocks.push('</rawhtml></nowikiblock>');
				data = data.replace('{{{#!html', '<nowikiblock><rawhtml>');
			}
		} else {  // 리터럴
			if(!block.includes('}}}')) {  // 블록
				blocks.push('</pre></nowikiblock>');
				var od = data;
				data = data.replace('{{{\n', '<nowikiblock><pre>');
				if(od == data) data = data.replace('{{{', '<nowikiblock><pre>');
			}
		}
	}
	
	// #!html 문법
	var { document } = (new JSDOM(data.replace(/\n/g, '<br>'))).window;
	const whtags = ['br', 'hr', 'div', 'span', 'ul', 'a', 'b', 'strong', 'del', 's', 'ins', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'font', 'dl', 'dt', 'dd', 'label', 'sup', 'sub'];
	const whattr = {
		'*': ['style'],
		span: ['class'],
		a: ['href', 'class'],
		font: ['color', 'size', 'face'],
	};
	for(var item of document.querySelectorAll('rawhtml')) {
		item.innerHTML = item.textContent.replace(/\n/g, '<br>');
		for(var el of item.getElementsByTagName('*')) {
			if(whtags.includes(el.tagName.toLowerCase())) {
				for(var attr of el.attributes) {
					if(((whattr[el.tagName.toLowerCase()] || []).concat(whattr['*'])).includes(attr.name)) {
						if(attr.name == 'style') {
							
						}
					} else el.removeAttribute(attr.name);
				}
				switch(el.tagName.toLowerCase()) {
					case 'a':
						el.setAttribute('target', '_blank');
						if(minor >= 20) {
							el.className += (el.className ? ' ' : '') + 'wiki-link-external';
						}
				}
			} else el.outerHTML = el.innerHTML;
		} item.outerHTML = item.innerHTML;
	}
	
	// 리터럴 (제대로 된 방법은 아니겠지만 이게 젤 쉬었어...)
	var nwblocks = {};
	for(var item of document.querySelectorAll('nowikiblock')) {
		const key = rndval('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=/', 2048);
		nwblocks[key] = item.innerHTML;
		item.outerHTML = key;
	}
	data = document.querySelector('body').innerHTML.replace(/<br>/g, '\n');
	
	// 인용문
	function parseQuotes(data) {
		const rows = data.split(/\n/);
		const rl = rows.length;
		var inquote = 0;
		for(let i=0; i<rl; i++) {
			let row = rows[i];
			if(!row.startsWith('&gt;')) {
				if(inquote) {
					row = '</blockquotewikiquote>\n' + row;
					inquote = 0;
				}
				rows[i] = row;
				continue;
			}
			if(row.startsWith('&gt;') && !inquote) {
				row = row.replace(/^[&]gt;(\s*)/, '<blockquotewikiquote class=wiki-quote>\n');
				inquote = 1;
			} else {
				row = row.replace(/^[&]gt;(\s*)/, '');
				inquote = 1;
			}
			rows[i] = row;
		}
		if(inquote) rows.push('</blockquotewikiquote>');
		return rows.join('\n');
	} do {
		data = parseQuotes(data);
	} while(data.match(/^[&]gt;/gim));
	
	// 수평줄
	data = data.replace(/^[-]{4,9}$/gim, '<hr />');
	data = data.replace(/(\n{0,1})<hr \/>(\n{0,1})/g, '<hr />');

	// 인용문 마지막 처리
	data = data.replace(/<blockquotewikiquote\sclass[=]wiki[-]quote>\n/g, '<blockquote class=wiki-quote>');
	data = data.replace(/\n<\/blockquotewikiquote>/g, '</blockquote>');
	
	// 목록
	function parseList(data) {
		const rows = ('\n' + data + '\n').split(/\n/);
		const rl = rows.length;
		var inlist = 0;
		for(let i=0; i<rl; i++) {
			let row = rows[i];
			if(!row.match(/^(\s+)[*]/) && !row.startsWith(' ')) {
				if(inlist) {
					row = '</liwikilist></ulwikilist>\n' + row;
					inlist = 0;
				}
				rows[i] = row;
				continue;
			}
			if(row.match(/^(\s{2,})[*]/)) {
				rows[i] = row.replace(/^(\s{2,})[*]/, ' *');
				continue;
			}
			if(row.startsWith(' *') && !inlist) {
				row = row.replace(/^\s[*](\s*)/, '<ulwikilist class=wiki-list>\n<liwikilist>\n');
				inlist = 1;
			} else {
				row = row.replace(/^\s/, '');
				row = row.replace(/^[*](\s*)/, '</liwikilist><liwikilist>\n');
				inlist = 1;
			}
			rows[i] = row;
		}
		rows.splice(0, 1);
		rows.pop();
		if(inlist) rows.push('</liwikilist>\n</ulwikilist>');
		return rows.join('\n');
	} do {
		data = parseList(data);
	} while(data.match(/^\s[*]/gim));
	data = data.replace(/<ulwikilist\sclass[=]wiki[-]list>\n/g, '<ul class=wiki-list>');
	data = data.replace(/\n<\/ulwikilist>/g, '</ul>');
	data = data.replace(/<liwikilist>\n/g, '<li>');
	data = data.replace(/\n<\/liwikilist>/g, '</li>');
	data = data.replace(/<\/liwikilist>\n<\/ulwikilist>/g, '</ul>');
	data = data.replace(/<ulwikilist\sclass[=]wiki[-]list>/g, '<ul class=wiki-list>');
	data = data.replace(/<\/ulwikilist>/g, '</ul>');
	data = data.replace(/<liwikilist>/g, '<li>');
	data = data.replace(/<\/liwikilist>/g, '</li>');
	
	// 들여쓰기
	function parseIndent(data) {
		const rows = data.split(/\n/);
		const rl = rows.length;
		var inindent = 0;
		for(let i=0; i<rl; i++) {
			let row = rows[i];
			if(!row.startsWith(' ') || row.replace(/^\s/, '').startsWith('*')) {
				if(inindent) {
					row = '</divwikiindent>\n' + row;
					inindent = 0;
				}
				rows[i] = row;
				continue;
			}
			if(row.startsWith(' ') && !inindent) {
				row = row.replace(/^\s/, '<divwikiindent class=wiki-indent>\n');
				inindent = 1;
			} else {
				row = row.replace(/^\s/, '');
				inindent = 1;
			}
			rows[i] = row;
		}
		if(inindent) rows.push('</divwikiindent>');
		return rows.join('\n');
	} do {
		data = parseIndent(data);
	} while((data.match(/^(\s+)/gim) || []).filter(item => item.replace(/\n/g, '') && item).length);
	data = data.replace(/<divwikiindent\sclass[=]wiki[-]indent>\n/g, '<div class=wiki-indent>');
	data = data.replace(/\n<\/divwikiindent>/g, '</div>');
	
	// 링크
	for(let link of (data.match(/\[\[(((?!\]\]).)+)\]\]/g) || [])) {
		var _dest = link.match(/\[\[(((?!\]\]).)+)\]\]/)[1].replace(/[&]amp[;]/g, '&').replace(/[&]lt[;]/g, '<').replace(/[&]gt[;]/g, '>').replace(/[&]quot[;]/g, '"');
		var dest, disp;
		if(_dest.includes('|')) {
			dest = _dest.split('|')[0];
			disp = _dest.split('|')[1];
		} else dest = disp = _dest;
		
		const external = dest.startsWith('http://') || dest.startsWith('https://') || dest.startsWith('ftp://');
		
		const dd = dest.split('#');
		if(!external) {
			if(!dd[0] && dd[1]) dd[0] = title;
			if(dest == disp) disp = dd[0];
			dest = dd[0];
		}
		
		var ddata = await curs.execute("select content from documents where title = ? and namespace = ?", [processTitle(dest).title, processTitle(dest).namespace]);
		const notexist = !ddata.length ? ' not-exist' : '';
		
		if(dest.startsWith('분류:') && !discussion) {  // 분류
			cates += `<li><a href="/w/${encodeURIComponent(dest)}" class="wiki-link-internal${notexist}">${html.escape(dest.replace('분류:', ''))}</a></li>`;
			if(xref) {
				curs.execute("insert into backlink (title, namespace, link, linkns, type) values (?, ?, ?, ?, 'category')", [doc.title, doc.namespace, dest.replace('분류:', ''), '분류']);
			}
			data = data.replace(link, '');
			continue;
		} if(dest.startsWith('파일:') && !discussion && !notexist) {  // 그림
			// 나중에 구현할랭
			data = data.replace(link, '');
			continue;
		}
		
		dest = dest.replace(/^([:]|\s)((분류|파일)[:])/, '$2');
		
		const sl = dest == title ? ' self-link' : '';
		data = data.replace(link, '<a ' + (external ? 'target=_blank ' : '') + 'class="wiki-link-' + (external ? 'external' : 'internal') + '' + sl + notexist + '" href="' + (external ? '' : '/w/') + '' + (external ? html.escape : encodeURIComponent)(dest) + (!external && dd[1] ? html.escape('#' + dd[1]) : '') + '">' + disp + '</a>');
		
		// 역링크
		if(xref && !external) {
			var linkdoc = processTitle(dest);
			if(!xrefl.includes(linkdoc.title + '\n' + linkdoc.namespace)) {
				xrefl.push(linkdoc.title + '\n' + linkdoc.namespace);
				curs.execute("insert into backlink (title, namespace, link, linkns, type, exist) values (?, ?, ?, ?, 'link', ?)", [doc.title, doc.namespace, linkdoc.title, linkdoc.namespace, notexist ? '0' : '1']);
			}
		}
	}
	
	blocks = new Stack;
	// 삼중중괄호 서식
	for(let block of (data.match(/([}][}][}]|[{][{][{](((?!}}}).)*)[}][}][}]|[{][{][{](((?!}}}).)*))/gim) || [])) {
		if(block == '}}}') {
			if(!blocks.size()) continue;
			var od = data;
			data = data.replace('}}}', blocks.top() + '');
			if(od == data) data = data.replace('\n}}}', blocks.top() + '\r');
			blocks.pop();
			continue;
		}
		
		const h = block.match(/{{{(((?!}}}).)*)/im)[1];
		if(h.match(/^[#][!]folding\s/)) {
		} else if(h.match(/^[#][!]wiki\s/)) {
		} else if(h.match(/^[#][!]html/) && !discussion) {
		} else if(block.includes('}}}')) {  // 한 줄
			const color = h.match(/^[#]([A-Za-z0-9]+)\s/);
			const size = h.match(/^([+]|[-])([1-5])\s/);
			if(color) {  // 글자 색
				const htmlcolor = color[1].match(/^([A-Fa-f0-9]{3,6})$/);
				var col = color[1];
				if(htmlcolor) {
					col = '#' + htmlcolor[1];
				}
				data = data.replace('}}}', '</font>');
				data = data.replace('{{{' + color[0], '<font color=' + col + '>');
			} else if(size) {  // 글자 크기
				data = data.replace('}}}', '</span>');
				data = data.replace('{{{' + size[0], '<span class="wiki-size size-' + (size[1] == '+' ? 'up' : 'down') + '-' + size[2] + '">');
			} else {
				blocks.push('</code></nowikiblock>');
				data = data.replace('{{{', '<nowikiblock><code>');
			}
		}
	}
	for(var item of document.querySelectorAll('nowikiblock')) {
		const key = rndval('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=/', 2048);
		nwblocks[key] = item.innerHTML;
		item.outerHTML = key;
	}
	
	// 토론 앵커
	if(discussion) for(let res of (data.match(/(\s|^)[#](\d+)(\s|$)/g) || [])) {
		const reg = res.match(/(\s|^)[#](\d+)(\s|$)/);
		data = data.replace(res, reg[1] + '<a class=wiki-self-link href="#' + reg[2] + '">#' + reg[2] + '</a>' + reg[3]);
	}
	
	// 문단
	data = '<div>\r' + data;
	var maxszz = 2;
	var headnum = [, 0, 0, 0, 0, 0, 0];
	var tochtml = '<div class=wiki-macro-toc id=toc>';
	var cnum = 2;
	var sec = 1;
	for(let i=6; i; i--) {
		if(data.match(RegExp(`^${multiply('=', i)}\\s.*\\s${multiply('=', i)}$`, 'm')))
			maxszz = i;
	}
	for(let heading of (data.match(/^(=\s(((?!=).)*)\s=|==\s(((?!==).)*)\s==|===\s(((?!===).)*)\s===|====\s(((?!====).)*)\s====|=====\s(((?!=====).)*)\s=====|======\s(((?!======).)*)\s======)$/gm) || [])) {
		const hr = {};
		for(let i=1; i<=6; i++) {
			hr[i] = heading.match(RegExp(`^${multiply('=', i)}\\s(((?!${multiply('=', i)}).)*)\\s${multiply('=', i)}$`, 'm'));
		} for(let i=6; i; i--) if(hr[i]) {
			if(i < cnum) for(let j=i+1; j<=6; j++) headnum[j] = 0;
			cnum = i;
			const title = hr[i][1];
			var snum = '';
			for(let j=i; j; j--) if(maxszz == j) {
				for(let k=j; k<i; k++)
					snum += headnum[k] + '.';
				snum += ++headnum[i];
				break;
			}
			var edlnk = '';
			if(!discussion)
				edlnk = `<span class=wiki-edit-section><a href="/edit/${encodeURIComponent(doc + '')}?section=${sec++}" rel=nofollow>[편집]</a></span>`;
			data = data.replace(heading, '</div><h' + i + ' class=wiki-heading><a href="#toc" id="s-' + snum + '">' + snum + '.</a> ' + title + edlnk + '</h' + i + '><div class=wiki-heading-content>');
			var mt = i;
			tochtml += multiply('<div class=toc-indent>', mt - maxszz + 1) + '<span class=toc-item><a href="#s-' + snum + '">' + snum + '</a>. ' + title + '</span>' + multiply('</div>', mt - maxszz + 1);
			break;
		}
	}
	tochtml += '</div>';
	data += '</div>';
	data = data.replace(/<div class=wiki[-]heading[-]content>\n/g, '<div class=wiki-heading-content>');
	
	// 글자 꾸미기
	if(minor < 8) data = data.replace(/['][']['][']['](((?![']['][']['][']).)+)[']['][']['][']/g, '<strong><i>$1</i></strong>');
	data = data.replace(/['][']['](((?![']['][']).)+)[']['][']/g, '<strong>$1</strong>');
	data = data.replace(/[']['](((?!['][']).)+)['][']/g, '<i>$1</i>');
	data = data.replace(/~~(((?!~~).)+)~~/g, '<del>$1</del>');
	data = data.replace(/--(((?!--).)+)--/g, '<del>$1</del>');
	data = data.replace(/__(((?!__).)+)__/g, '<u>$1</u>');
	data = data.replace(/[,][,](((?![,][,]).)+)[,][,]/g, '<sub>$1</sub>');
	data = data.replace(/[^][^](((?![^][^]).)+)[^][^]/g, '<sup>$1</sup>');
	
	// 글상자
	if(minor < 7 || (minor == 7 && revision <= 4))
		data = data.replace(/{{[|](((?![|]}}).)+)[|]}}/g, '<div class=wiki-textbox>$1</div>');
	
	// 매크로
	data = data.replace(/\[br\]/gi, '&lt;br&gt;');
	data = data.replace(/\[(date|datetime)\]/gi, generateTime(toDate(getTime()), timeFormat));
	data = data.replace(/\[(tableofcontents|목차)\]/gi, tochtml);
	
	// 각주 (1)
	const fnrows = data.split('\n');
	const frl = fnrows.length;
	for(let fi=0; fi<frl; fi++) {
		let row = fnrows[fi];
		for(let fn of (row.match(/(\[[*](((?!\s).)*)\s|\])/g) || [])) {
			if(fn == ']') {
				if(!footnotes.size()) continue;
				row = row.replace(']', '</fnstub>');
				footnotes.pop();
				fnrows[fi] = row;
				continue;
			}
			if(!row.includes(']')) continue;
			const reg = fn.match(/(\[[*](((?!\s).)*)\s|\])/);
			row = row.replace(fn, '<fnstub' + (reg[2] ? (' name="' + reg[2] + '"') : '') + '>');
			footnotes.push('[');
			fnrows[fi] = row;
		}
	} data = fnrows.join('\n');
	
	// 표렌더
	var { document } = (new JSDOM(data.replace(/\n/g, '<br>'))).window;
	function ft(el) {
		const blks = el.querySelectorAll('dl.wiki-folding > dd, div.wiki-style, blockquote.wiki-quote');
		if(blks.length) for(let el2 of blks) ft(el2);
		el = (el == document ? el.querySelector('body') : el);
		const ihtml = el.innerHTML;
		el.innerHTML = parseTable(ihtml.replace(/<br>/g, '\n')).replace(/\n/g, '<br>');
	} ft(document);
	
	// 각주 (2)
	function ff(el) {
		const blks = el.querySelectorAll('fnstub');
		if(blks.length) for(let el2 of blks) ff(el2);
		el = (el == document ? el.querySelector('body') : el);
		el = el.querySelector('fnstub');
		if(!el) return;
		const span = document.createElement('span');
		span.innerHTML = el.innerHTML;
		el.outerHTML = `<a ${el.getAttribute('name') ? 'name="' + el.getAttribute('name') + '" ' : ''}class=wiki-fn-content title="${span.textContent}">${el.innerHTML}</a>`;
	} ff(document);
	
	// 각주(3)
	for(let item of document.querySelectorAll('a.wiki-fn-content')) {
		const id = item.getAttribute('name') || fnnum;
		const numid = fnnum;
		item.removeAttribute('name');
		item.setAttribute('href', '#fn-' + id);
		fnhtml += `<span class=footnote-list><span id=fn-${id} class=target></span><a href=#rfn-${numid}>[${id}]</a> ${item.innerHTML}</span>`;
		item.innerHTML = `<span id=rfn-${numid}>[${id}]`;
		fnnum++;
	}
	
	if(fnhtml) fnhtml = '<div class=wiki-macro-footnote>' + fnhtml + '</div>';
	
	// 한 글자 리터럴 처리
	for(let item of document.querySelectorAll('spannw.nowiki')) {
		item.outerHTML = item.innerHTML;
	}
	
	data = document.querySelector('body').innerHTML;
	data = data.replace(/\r/g, '');
	data = data.replace(/<br>/g, '\n');
	
	if(!discussion) data = '<div class=wiki-inner-content>' + data + '</div>';
	
	data = data.replace(/<div>\n/, '<div>').replace(/\n<\/div><h(\d)/g, '</div><h$1').replace(/\n/g, '<br />');
