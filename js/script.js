function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
$(document).ready(function(){
	var resPlaceholder = $("#result").html();
	$("#calc").on("click", function(){
		$("#result").html(resPlaceholder);
		var text = $("#text").val();
		var alphabet = text.split("").filter(onlyUnique);
		var n = text.length;
		var m = alphabet.length;
		var alphabetFreq = [];
		var sortedDesc = [];
		for (var i = 0; i <= alphabet.length - 1; i++) {
			// var symbolRegex = '['+alphabet[i]+']';
			var symbolRegex = alphabet[i];
			symbolRegex = (function(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			})(symbolRegex);
			alphabetFreq.push([alphabet[i],text.match(new RegExp(symbolRegex,'g')).length, '']);
		};
		sortedDesc = alphabetFreq.slice(0);
		sortedDesc.sort(function(a, b){
			if(a[1] > b[1]){
				return -1;
			}
			if(a[1] < b[1]){
				return 1;
			}
			if(a[0] < b[0]){
				return -1;
			}
			if(a[0] > b[0]){
				return 1;
			}
			return 0;
		});

		// Выводим алфавит
		var maxCols = 30;
		var i = 15;
		sortedDesc.forEach(function(value, index, array){
			if(++i >= maxCols){
				$("#alphabet table tr").last().after('<tr class="symbol"></tr>');
				$("#alphabet table tr").last().after('<tr class="freq"></tr>');
				i = 0;
			}
			$("#alphabet table tr.symbol").last().append("<td>"+value[0]+"</td>");
			$("#alphabet table tr.freq").last().append("<td>"+value[1]+"</td>");
		});
		$("#alphabet b.n").text("n = " + n);
		$("#alphabet b.m").text("m = " + m);
		$("#alphabet").removeClass("empty");

		// Считаем формулу Хартли
		var hartley = n*Math.log2(m);
		$("#hartley b.i").text("I = " + hartley.toFixed(3));
		$("#hartley b.s").text("S = " + Math.log2(m).toFixed(3));
		$("#hartley").removeClass("empty");

		// Считаем формулу Шеннона
		var shannon = 0;
		for (var i = sortedDesc.length - 1; i >= 0; i--) {
			shannon += (sortedDesc[i][1]/n)*Math.log2(sortedDesc[i][1]/n);
		};
		shannon = -shannon;
		$("#shannon b.s").text("S = " + shannon.toFixed(3));
		$("#shannon").removeClass("empty");

		// Кодируем символы алгоритмом Шеннона-Фано

		function shannon_fano(arr, n){
			var encoded = arr.slice(0);
			var csl = 0;
			var nsl = 0;
			var cv = 0;
			var nv = 0;
			var cabs = 0;
			var nabs = 0;
			var csr = 0;
			var nsr = 0;
			var end = encoded.length-1;
			var start = 0;
			var found = 0;
			var csum = n;
			var splitters = [];
			while(found < encoded.length-1){
				for(var i = start; i <= end; i++){
					if(start == end){
						found += 1;
						start = end + 1;
						end = splitters[i][0];
						csl = 0;
						csum = splitters[i][1];
						break;
					}
					cv = encoded[i][1];
					nv = encoded[i+1][1];
					csl += cv;
					nsl = csl + nv;
					csr = csum - csl;
					nsr = csum - nsl;
					cabs = Math.abs(csl-csr);
					nabs = Math.abs(nsl-nsr);
					if(cabs >= nabs){
						continue;
					}else{
						splitters[i] = [end, csum - csl];
						csum = csl;
						for(var m = start; m <= end; m++){
							encoded[m][2] += (m <= i)?"0":"1";
						}
						csl = 0;
						end = i;
						break;
					}
				}
			}
			return encoded;
		}
		var shfano = shannon_fano(sortedDesc, n);
		// Выводим таблицу Шеннона-Фано и считаем вес сообщения & средний вес символа
		var t = 0;
		var a = 0;
		shfano.forEach(function(value, index, array){
			t += value[1]*(value[2].length);
			$("#shannon-fano table tr").last().after('<tr><td class="symbol">'+value[0]+'</td><td class="freq">'+value[1]+'</td><td class="code">'+value[2]+'</td><td class="weight">'+value[2].length+'</td></tr>');
		});
		a = (t/n).toFixed(3);

		$("#shannon-fano b.t").text("Вес сообщения = " + t);
		$("#shannon-fano b.a").text("Средний вес символа = " + a);

		$("#shannon-fano").removeClass("empty");

		// Кодируем символы алгоритмом Хаффмана

		function huffman(arr, n){
			var tree = arr.slice(0);
			var encodedObj = (function(arr){
							var rv = {};
							for (var i = 0; i < arr.length; i++){
								rv[arr[i][0]] = {index:i,code:''};
							}
							return rv;
							})(arr);
			var encodedArr = arr.slice(0);
			var canvas = document.getElementById('tree');
			canvas.width = arr.length*40;
			canvas.height = Math.ceil((n/arr.length)+(arr[1][2].length) + 1)*125;
			var ctx = canvas.getContext('2d');
			var symSize = 20;
			ctx.font = "bold 20px Trebuchet";
			ctx.textAlign = "center";
			for (var i = 0; i <= tree.length - 1; i++) {
				var symX = (i*40);
				var symY = canvas.height-50;
				var symW = 40;
				var symM = symX + (symW/2);
				tree[i][3] = [symX, symY, symW, symM];
				ctx.strokeRect(symX, symY, symW, 50);
				ctx.fillText(tree[i][0], symX+(symW/2), symY+20);
				ctx.fillText(tree[i][1], symX+(symW/2), symY+40);
			};
			var rows = [];
			while(tree.length > 1){
				var p1 = tree.pop();
				var p2 = tree.pop();
				var leftB = (Math.min((p1[3][0]),(p2[3][0])) == p1[3][0])?(p1):(p2);
				var rightB = (Math.max((p1[3][0]),(p2[3][0])) == p1[3][0])?(p1):(p2);
				// [X, Y, W, M];

				var leafSymbols = leftB[0]+rightB[0];
				var leafWeight = p1[1]+p2[1];

				var leafW = (((leafSymbols.length * symSize)/2) + leafSymbols.length*2);
				// var leafX = (leftB[3][0] + ((rightB[3][0]-leftB[3][0])/2));
				var leafX = leftB[3][3] + (rightB[3][3]-leftB[3][3])/4;
				var leafY = Math.min(p1[3][1], p2[3][1]) - 50;
				var leafM = leafX + (leafW/2);
				var leafCoords = [leafX, leafY-50, leafW, leafM];
				var leaf = [leafSymbols, leafWeight, 'code', leafCoords];

				ctx.beginPath();
				ctx.moveTo(leftB[3][3], leftB[3][1]);
				ctx.lineTo(leafM, leafY);
				ctx.closePath();
				ctx.stroke();
				// var textX0 = (leafX + (leafW/2) + leftB[3][0] + (leftB[3][2]/2))/2;
				var textX0 = (leafM + leftB[3][3])/2;
				var textY0 = (leafY + leftB[3][1])/2;
				ctx.fillText('0', textX0-8, textY0+10);

				ctx.beginPath();
				ctx.moveTo(rightB[3][3], rightB[3][1]);
				ctx.lineTo(leafM, leafY);
				ctx.closePath();
				ctx.stroke();
				var textX1 = (leafM + rightB[3][3])/2;
				var textY1 = (leafY + rightB[3][1])/2;
				ctx.fillText('1', textX1-5, textY1+10);

				ctx.strokeRect(leafX, leafY-50, leafW, 50);
				ctx.fillText(leafSymbols, leafX+leafW/2, leafY-30);
				ctx.fillText(leafWeight, leafX+leafW/2, leafY-10);

				tree.push(leaf);
				tree.sort(function(a, b){
					if(a[1] > b[1]){
						return -1;
					}
					if(a[1] < b[1]){
						return 1;
					}
					if(a[0].length < b[0].length){
						return -1;
					}
					if(a[0].length > b[0].length){
						return 1;
					}
					if(a[0] < b[0]){
						return -1;
					}
					if(a[0] > b[0]){
						return 1;
					}
					return 0;
				});
				leftB[0].split("").forEach(function(value, index, array){
					encodedObj[value].code = "0" + encodedObj[value].code;
				});
				rightB[0].split("").forEach(function(value, index, array){
					encodedObj[value].code = "1" + encodedObj[value].code;
				});
			}
			for(var sym in encodedObj){
				encodedArr[encodedObj[sym].index][2] = encodedObj[sym].code;
			}
			return encodedArr;
		}
		var hman = huffman(sortedDesc, n);

		// Выводим таблицу Хаффмана и считаем вес сообщения & средний вес символа
		t = 0;
		a = 0;
		hman.forEach(function(value, index, array){
			t += value[1]*(value[2].length);
			$("#huffman table tr").last().after('<tr><td class="symbol">'+value[0]+'</td><td class="freq">'+value[1]+'</td><td class="code">'+value[2]+'</td><td class="weight">'+value[2].length+'</td></tr>');
			// $("#php_code").append("'"+value[0]+"' => '"+value[2]+"',<br>");
			// $("#php_decode").append("'"+value[2]+"' => '"+value[0]+"',<br>");
		});
		a = (t/n).toFixed(3);

		$("#huffman b.t").text("Вес сообщения = " + t);
		$("#huffman b.a").text("Средний вес символа = " + a);

		$("#huffman").removeClass("empty");
		$("#huffman-tree").removeClass("empty");
	});
});