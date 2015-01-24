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
			var tree = [];
			var encodedObj = (function(arr){
							var rv = {};
							for (var i = 0; i < arr.length; i++){
								rv[arr[i][0]] = {index:i,code:''};
							}
							return rv;
							})(arr);

			// Создаем холст
			var canvas = document.getElementById('tree');
			canvas.width = arr.length*40;
			canvas.height = Math.ceil((n/arr.length)+(arr[1][2].length) + 1)*200;
			var ctx = canvas.getContext('2d');
			ctx.font = "bold 20px Trebuchet";
			ctx.textAlign = "center";

			// Создаем дерево объектов
			for (var i = 0; i <= arr.length - 1; i++) {
				var leafX = (i*40);
				var leafY = canvas.height-50;
				var leafWidth = 40;
				var leafM = leafX + (leafWidth/2);
				var leafL = 0;
				var leafHeight = 50;
				var leafS = ((i+1) < (arr.length/2))?('left'):('right');
				var leafText = arr[i][0];
				var leafWeight = arr[i][1];
				var leafSymSize = 20;

				tree.push({
					X: leafX,
					Y: leafY,
					Width: leafWidth,
					M: leafM,
					S: leafS,
					L: leafL,
					Weight: leafWeight,
					Text: leafText
				});

				ctx.strokeRect(leafX, leafY, leafWidth, leafHeight);
				ctx.fillText(leafText, leafM, leafY + leafSymSize);
				ctx.fillText(leafWeight, leafM, leafY + leafSymSize*2);
			};

			// Рисуем дерево и заполняем коды
			leafSymSize = 16;
			leafHeight = 25;
			ctx.font = "bold 16px Trebuchet";
			while(tree.length > 1){
				var b1 = tree.pop();
				var b2 = tree.pop();
				var left = (Math.min(b1.X, b2.X) == b1.X)?(b1):(b2);
				var right = (left == b1)?(b2):(b1);

				leafText = left.Text + right.Text;
				leafWeight = left.Weight + right.Weight;
				leafWidth = (leafText.length * leafSymSize)/2;
				leafX = (left.M + right.M - leafWidth)/2;
				leafL = Math.max(left.L, right.L) + 1;
				leafM = leafX + (leafWidth/2);
				leafS = (left.S == 'left')?('left'):('right');

				var delta = Math.abs(left.L - right.L);
				var decr = 50;
				leafY = Math.min(left.Y, right.Y) - decr;

				// Определяем наклон
				if(left.S == 'right' && right.S == 'right'){
					leafY -= 50*leafL;
				}else if(left.S == 'left' && right.S == 'left'){
					leafY -= 50*leafL;
				}else{
					leafY -= 50*leafL;
				}

				var leaf =
					{
						X: leafX,
						Y: (leafY-25),
						Width: leafWidth,
						M: leafM,
						S: leafS,
						L: leafL,
						Weight: leafWeight,
						Text: leafText
					}

				// Рисуем линию от левого блока
				ctx.beginPath();
				ctx.moveTo(left.X + left.Width*0.25, left.Y);
				ctx.lineTo(leafX, leafY);
				ctx.closePath();
				ctx.stroke();
				// Ставим 0 на середине линии
				var leftTextX = (left.X + left.Width*0.25 + leafX)/2;
				var leftTextY = (leafY + left.Y)/2;
				ctx.fillText('0', leftTextX - (leafSymSize/2), leftTextY + (leafSymSize*0.6));

				// Рисуем линию от правого блока
				ctx.beginPath();
				ctx.moveTo(right.X + right.Width*0.75, right.Y);
				ctx.lineTo(leafX + leafWidth, leafY);
				ctx.closePath();
				ctx.stroke();
				// Ставим 1 на середине линии
				var rightTextX = (right.X + right.Width*0.75 + leafX + leafWidth)/2;
				var rightTextY = (leafY + right.Y)/2;
				ctx.fillText('1', rightTextX - (leafSymSize/3), rightTextY + (leafSymSize*0.6));

				// Рисуем новый блок
				ctx.strokeRect(leafX, leafY-25, leafWidth, leafHeight);
				// Пишем в новый блок символы и вес
				ctx.fillText(leafText, leafM, leafY - 15);
				ctx.fillText(leafWeight, leafM, leafY - 2);

				tree.push(leaf);
				tree.sort(function(a, b){
					if(a.Weight > b.Weight){
						return -1;
					}
					if(a.Weight < b.Weight){
						return 1;
					}
					if(a.Text.length < b.Text.length){
						return -1;
					}
					if(a.Text.length > b.Text.length){
						return 1;
					}
					if(a.Text[0] < b.Text[0]){
						return -1;
					}
					if(a.Text[0] > b.Text[0]){
						return 1;
					}
					return 0;
				});

				// Записываем коды символов
				left.Text.split("").forEach(function(value, index, array){
					encodedObj[value].code = "0" + encodedObj[value].code;
				});
				right.Text.split("").forEach(function(value, index, array){
					encodedObj[value].code = "1" + encodedObj[value].code;
				});
			}

			// Записываем коды символов в массив
			var encodedArr = arr.slice(0);
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