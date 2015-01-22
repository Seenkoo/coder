function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
$(document).ready(function(){
	$("#calc").on("click", function(){
		var text = $("#text").val();
		var alphabet = text.split("").filter(onlyUnique);
		var n = text.length;
		var m = alphabet.length;
		var alphabetFreq = [];
		var sortedDesc = [];
		for (var i = 0; i <= alphabet.length - 1; i++) {
			var symbolRegex = '['+alphabet[i]+']';
			alphabetFreq.push([alphabet[i],text.match(new RegExp(symbolRegex,'g')).length, '']);
		};
		sortedDesc = alphabetFreq;
		sortedDesc.sort(function(a, b){
			if(a[1] > b[1]){
				return -1;
			}
			if(a[1] < b[1]){
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
		var shfano = sortedDesc;

		function shannon_fano(arr, n){
			var csl = 0;
			var nsl = 0;
			var cv = 0;
			var nv = 0;
			var cabs = 0;
			var nabs = 0;
			var csr = 0;
			var nsr = 0;
			var end = arr.length-1;
			var start = 0;
			var found = 0;
			var csum = n;
			var splitters = [];
			while(found < arr.length-1){
				for(var i = start; i <= end; i++){
					if(start == end){
						found += 1;
						start = end + 1;
						end = splitters[i][0];
						csl = 0;
						csum = splitters[i][1];
						break;
					}
					cv = arr[i][1];
					nv = arr[i+1][1];
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
							arr[m][2] += (m <= i)?"0":"1";
						}
						csl = 0;
						end = i;
						break;
					}
				}
			}
			return arr;
		}
		shfano = shannon_fano(sortedDesc, n);

		// Выводим таблицу Шеннон-Фано и считаем вес сообщения & средний вес символа
		var t = 0;
		var a = 0;
		shfano.forEach(function(value, index, array){
			t += value[1]*(value[2].length);
			$("#shannon-fano table tr").last().after('<tr><td class="symbol">'+value[0]+'</td><td class="freq">'+value[1]+'</td><td class="code">'+value[2]+'</td></tr>');
		});
		a = (t/n).toFixed(3);

		$("#shannon-fano b.t").text("Вес сообщения = " + t);
		$("#shannon-fano b.a").text("Средний вес символа = " + a);

		$("#shannon-fano").removeClass("empty");
	});
});