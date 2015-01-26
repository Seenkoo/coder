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
			if(a[1] < b[1]){
				return 1;
			}
			if(a[1] > b[1]){
				return -1;
			}
			if(a[0][0] > b[0][0]){
				return 1;
			}
			if(a[0][0] < b[0][0]){
				return -1;
			}
			return 0;
		});
		console.log(sortedDesc);
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
			var sortChosen = false;
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
			var canH = 100;
			var rows = [];
			for(var h = 0; h <= (Math.ceil(Math.log2(n))); h++){
				canH += h*50;
				rows.push([]);
			}
			canvas.height = canH;
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
				var leafText = arr[i][0];
				var leafWeight = arr[i][1];
				var leafSymSize = 20;

				tree.push({
					X: leafX,
					Y: leafY,
					Width: leafWidth,
					M: leafM,
					L: leafL,
					Weight: leafWeight,
					Text: leafText
				});

				ctx.strokeRect(leafX, leafY, leafWidth, leafHeight);
				ctx.fillText(leafText, leafM, leafY + leafSymSize);
				ctx.fillText(leafWeight, leafM, leafY + leafSymSize*2);
			};

			var Heights = [(canvas.height - 50)];
			for(var l = 1; l <= (Math.ceil(Math.log2(n))); l++){
				var levelH = Heights[l-1] - (l*50);
				Heights.push(levelH);
			}
			// Рисуем дерево и заполняем коды
			leafSymSize = 22;
			leafHeight = 35;
			ctx.font = "bold 20px Trebuchet";
			while(tree.length > 1){
				var sortFunction;
				var b1 = tree.pop();
				var b2 = tree.pop();
				var left = (Math.min(b1.X, b2.X) == b1.X)?(b1):(b2);
				var right = (left == b1)?(b2):(b1);

				leafText = left.Text + right.Text;
				leafWeight = left.Weight + right.Weight;
				leafWidth = (leafText.length * leafSymSize)/1.8;

				leafX = (left.M + right.M - leafWidth)/2;
				// leafX -= leafWidth/2;

				leafL = Math.ceil(Math.log2(leafWeight));
				leafY = Heights[leafL];

				// Сдвиг коллизий
				var collision = true;
				var lastCollision = false;
				while(collision && rows[leafL].length > 0){
					var leafEnd = leafX + leafWidth;
					for (var r = 0; r < rows[leafL].length; r++) {
						var rSt = rows[leafL][r].start;
						var rE = rows[leafL][r].end;
						var rW = rows[leafL][r].width;

						if ( (leafX <= (rE + leafWidth/4) && leafX >= rSt) || (leafX <= rSt && leafEnd >= (rSt - leafWidth/4)) ){
							if(lastCollision){
								lastCollision = 'right';
							}
							lastCollision = lastCollision || ((leafX <= (rE + leafWidth/4) && leafX >= rSt) ? 'right' : 'left');
							switch (lastCollision) {
								case 'left':
									leafX = rSt - leafWidth - leafWidth/2;
									break;
								case 'right':
									leafX = rE + leafWidth/2;
									break;
								default:
									break;
							}
							collision = true;
							break;
						}
						collision = false;
					};
				}

				leafM = leafX + (leafWidth/2);
				// Кидаем координаты листа в массив ряда
				rows[leafL].push({
					start: leafX,
					end: (leafX+leafWidth),
					Y: leafY,
					width: leafWidth
				});

				var leaf =
					{
						X: leafX,
						Y: (leafY-leafHeight),
						Width: leafWidth,
						M: leafM,
						L: leafL,
						Weight: leafWeight,
						Text: leafText
					}

				// Рисуем линию от левого блока
				ctx.beginPath();
				// ctx.moveTo(left.X + left.Width*0.25, left.Y);
				// ctx.moveTo(left.X, left.Y);
				ctx.moveTo(left.M, left.Y);
				ctx.lineTo(leafM, leafY);
				ctx.closePath();
				ctx.stroke();
				// Ставим 0 на середине линии
				ctx.textBaseline = 'bottom';
				ctx.textAlign = 'right';
				ctx.fillText('0', left.M, left.Y);

				// Рисуем линию от правого блока
				ctx.beginPath();
				ctx.moveTo(right.M, right.Y);
				ctx.lineTo(leafM, leafY);
				ctx.closePath();
				ctx.stroke();
				// Ставим 1 на середине линии
				ctx.textBaseline = 'bottom';
				ctx.textAlign = 'left';
				ctx.fillText('1', right.M, right.Y);

				// Рисуем новый блок
				ctx.strokeRect(leafX, leafY-leafHeight, leafWidth, leafHeight);
				// Пишем в новый блок символы и вес
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				ctx.fillText(leafText, leafM, (leafY-leafHeight/2));
				ctx.textBaseline = 'alphabetic';
				ctx.fillText(leafWeight, leafM, leafY-2);

				tree.push(leaf);

				if(!sortChosen){
					switch($("#sortF").val()){
						case 'cross':
							sortFunction = function(a, b){
								if(a.Weight < b.Weight){
									return 1;
								}
								if(a.Weight > b.Weight){
									return -1;
								}
								if(a.L < b.L){
									return 1;
								}
								if(a.L > b.L){
									return -1;
								}
								return 0;
							}
							break;
						case 'jump':
							sortFunction = function(a, b){
								if(a.Weight < b.Weight){
									return 1;
								}
								if(a.Weight > b.Weight){
									return -1;
								}
								if(a.L < b.L){
									return 1;
								}
								if(a.L > b.L){
									return -1;
								}
								if(a.Text.length > b.Text.length){
									return 1;
								}
								if(a.Text.length < b.Text.length){
									return -1;
								}
								return 0;
							}
							break;
						case 'mixed':
							sortFunction = function(a, b){
								if(a.Weight < b.Weight){
									return 1;
								}
								if(a.Weight > b.Weight){
									return -1;
								}

								if(a.L > b.L){
									return 1;
								}
								if(a.L < b.L){
									return -1;
								}

								if(a.Text.length > b.Text.length){
									return 1;
								}
								if(a.Text.length < b.Text.length){
									return -1;
								}

								if(a.Text[0] > b.Text[0]){
									return 1;
								}
								if(a.Text[0] < b.Text[0]){
									return -1;
								}

								return 0;
							}
							break;
						default:
							break;
					}
					sortChosen = true;
				}
				tree.sort(sortFunction);

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