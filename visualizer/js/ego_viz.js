"use strict";

var parseTime = d3.timeParse("%Y");

let parseNodeDate = function(nodedate) {
	if(nodedate.length < 5) { return parseTime(nodedate); }
	if(nodedate.length < 10) { return d3.timeParse("%Y-%m")(nodedate); }
	return d3.timeParse("%Y-%m-%d")(nodedate);
}

let perlin_noise = tooloud.Perlin.create(XXH.h32(4723472));

// Adapted from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

var randomColor = (function(){
  var golden_ratio_conjugate = 0.618033988749895;
  var h = Math.random();

  var hslToRgb = function (h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
  };
  
  return function(){
    h += golden_ratio_conjugate;
    h %= 1;
    return hslToRgb(h, 0.5, 0.60);
  };
})();

var chartEgo = function() {

	var file; // data file reference

	var chart_width = 1580;
	var chart_height = 800;

    let chartdata = null;
    let date_table = null;
    let games_set = null;
    let career_table = null;
    let active_games = null;
    let active_devs = null;

	var margin = {
		top: 10,
		left: 20,
		right: 25,
		bottom: 45,
		axis_padding: 10
	};

	var play_speed = 250;
	var transition_speed = 1000;

	var updateWidth;
	var updateHeight;
	var updateData;
    var updateVisualization;
    var updateDateRangeStart;

	var xScale = d3.scaleTime();
	var xScaleDate = d3.scaleTime();
	var xScaleOrdinal = d3.scaleOrdinal();
	var yScale = d3.scaleLinear();
	var cScale = d3.scaleSequential(d3.interpolateRainbow);
	var cScaleDate = d3.scaleTime();

    var startDate = parseTime("1995");
    var endDate = parseTime("2018");
    var viewStartDate = parseTime("1995");
    var viewEndDate = parseTime("1974");


	function chart(selection) {

		var dom = d3.select("body");
		var svg = dom.append("svg")
		.attr("class", "chart centered")
		.attr("id", "egoChart")
		.attr("height", chart_height)
		.attr("width", chart_width);

        
		xScaleDate
				.domain([startDate, endDate])
				.range([0 + margin.left, chart_width - (margin.right)]);

		cScaleDate
				.domain([startDate, endDate])
				.range([0, 1000]);

		cScale.domain([0,1000]);

		yScale
				.domain([0,50])
				.range([chart_height - margin.bottom, 0 + margin.top]);

		var chartArea = svg.append("g").attr("id","egoChartArea");

		// Add the X Axis
	    var xAxis = svg.append("g")
	    	.attr("class", "axis")
	    	.attr("stroke", "#fff")
	    	.attr("opacity", "0.6")
	    	.attr("transform", "translate(0," + ((chart_height - margin.bottom)) + ")")
      		.call(d3.axisBottom(xScaleDate).ticks(12))
      		      		;
		var xAxisLabel = svg.append("text")
		.attr("class", "axis-label")
		.attr("transform", "translate(" + (chart_width / 2) + "," + (chart_height - margin.bottom + 38) + ")")
		.style("text-anchor", "middle")
		.text("Game Release Date");

		var loadingText = svg.append("g")
		.attr("transform", "translate(" + (chart_width  / 2) + "," + (chart_height / 2) + ")" );
		loadingText
		.append("text")
		.attr("class", "loading-text")
		.text("Loading");
		loadingText
		.append("div")
		.attr("class", "loader")
		.attr("transform", "translate(" + (chart_width  / 2) + "," + (chart_height / 2) + ")" );
			

		updateWidth = function() {
			updateData(chartdata);

		}
		updateHeight = function() {
			updateData(chartdata);
		}

        let link_base = svg.append("g")
			.attr("class", "links");

		let path_base = svg.append("g")
			.attr("class", "the_career_paths");

		let node_base = svg.append("g")
			.attr("class", "nodes");



		var simulate = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id;}).distance(100).iterations(4))
			.force("charge", d3.forceManyBody().strength(-40).distanceMax(85))
			.force("collide", d3.forceCollide(18).iterations(8))
			.force("center", d3.forceCenter(chart_width / 2, chart_height / 2))
			//.force("y", d3.forceY(0))
			;
		
		updateData = function(_inputData) {
			if(!chartdata) {
				//console.log("No Data!\n");
				//console.log(chartdata);
				//return;
			}
			if(!career_table) {	return; }
			if(!date_table) { return; }
			if(!active_games) { return; }
			if(!active_devs) { return; }
			console.log("All Files Loaded");

			let filtered_games = Array.from(Object.keys(date_table))
			.filter(key => active_games.includes(key))
			.reduce(function(obj, key) {
				obj.push({'game_id':key, 'name': date_table[key][1], 'date': parseNodeDate(date_table[key][0])});
				return obj;
			}, [])
			.sort(function(a,b) { return a.date - b.date;});

			let filtered_careers = Object.keys(career_table)
			.filter(key => active_devs.includes(key))
			.reduce(function(obj, key) {
				obj[key] = career_table[key];
				return obj;
			}, {});


			function sortCareerByDates(career_array) {
				let sorted_career = career_array.sort(function (a, b) {
					return filtered_games.find(z => z.game_id == a).date - filtered_games.find(z => z.game_id == b).date;
				});
				return sorted_career;
			}

			let chart_link_data = [];
			Object.keys(filtered_careers).forEach(function(element) {
				let a_career = sortCareerByDates(filtered_careers[element]);
				let link_pairs = []
				for(let i = 0; i < a_career.length; i++) {
					let a_link = a_career.slice(i, i + 2);
					if(2 == a_link.length) {
						link_pairs.push({source: a_link[0], target: a_link[1]});
					}
				}
				chart_link_data = chart_link_data.concat(link_pairs);
				return link_pairs;
			})

			let career_path_data = [];
			Object.keys(filtered_careers).forEach(function(element) {
				let a_career = sortCareerByDates(filtered_careers[element]);
				//console.log(a_career);
				career_path_data.push({'id':element,'games': a_career})
				return a_career;
			})

			var node = node_base
			.selectAll(".node")
			.data(filtered_games)
			.enter()
			.append("g")
			.attr("class",'node');

			node
			.append("circle")
			.attr("r", "7")
			.attr("fill", "#96B8EE");

			node
			.append('title')
			.text(function(d) { return String(d.name) + '\n' + String(d.game_id) + '\n' + String(d.date.getFullYear())});

			var link = link_base
			.selectAll("line")
			.data(chart_link_data)
			.enter()
			.append("line")
			.style("opacity", 0)
			.attr("stroke","white")
			//.attr("stroke-width","2")
			;

			console.log(filtered_games)
			let career_path_line = d3.line()
			.curve(d3.curveMonotoneX)
			.x(function(d, i, dat) { 
				let output = filtered_games.find(z => z.game_id == d); 
				return (undefined != output.x) ? output.x : 0; 
			})
			.y(function(d, i, dat) {
				let output = filtered_games.find(z => z.game_id == d); 
				return (undefined != output.y) ? output.y + ( 20 * perlin_noise.noise(dat.length * 0.04, 0.2, 0.001)) : 0; 
			});

			console.log(career_path_data);
			console.log(career_path_data.map(dev => dev.games));
			let the_career_paths = path_base.selectAll(".careerpath")
			.data(career_path_data.map(dev => dev.games))
			.enter()
			.append("path")
			.attr("class","careerpath")
			.attr("fill", "none")
			.attr("stroke-width","2")
			.attr("stroke", function(d) { return randomColor(); })
			.attr('d', career_path_line)
			;
			//.append("title")
			//.text(function(d) { return String(d) + "\n" + String("");});
			


			function ticked() {
				filtered_games.forEach(function(a_game) {
					a_game.x = xScaleDate(a_game.date);
				});
				link_base.selectAll("line").data(chart_link_data)
				.attr("x1", function(d) { 
					let getval = filtered_games.find(z => z.game_id == d.source.game_id); 
					if(undefined != getval) { return getval.x; }; 
					return 50;
				})
				.attr("y1", function(d) {
					let getval = filtered_games.find(z => z.game_id == d.source.game_id); 
					if(undefined != getval) { return getval.y; }; 
					return 50;
				})
				.attr("x2", function(d) { 
				let getval = filtered_games.find(z => z.game_id == d.target.game_id); 
					if(undefined != getval) { return getval.x; }; 
					return 50;
				})
				.attr("y2", function(d) { 
				let getval = filtered_games.find(z => z.game_id == d.target.game_id); 
					if(undefined != getval) { return getval.y; }; 
					return 50;
				})
				;

			path_base.selectAll(".careerpath")
			.data(career_path_data.map(dev => dev.games))
			.attr('d', career_path_line);

			  	node_base.selectAll(".node").data(filtered_games).attr('transform', function(d) { return "translate(" + d.x +"," + d.y + ")";});
			}

			simulate.nodes(filtered_games).on("tick", ticked);
			simulate.force("link", d3.forceLink(chart_link_data).id(function(d){  return d.game_id; }));
			//simulate.restart();


			loadingText.text("");
		}

		d3.interval(function() {
			//updateData(chartdata);
		}, 1000);
	}



	function dragStart(d) {

	}
	function dragged(d) {

	}

	chart.date_table = function(val) {
		if (!arguments.length) {return date_table;}
		date_table = val;
		resizeChart(chartdata)
		if (typeof updateData === 'function') updateData(chartdata);
		return chart;
	}

	chart.career_table = function(val) {
		if (!arguments.length) {return career_table;}
		career_table = val;
		resizeChart(chartdata)
		if (typeof updateData === 'function') updateData(chartdata);
		return chart;
	}

	chart.active_devs = function(val) {
		if (!arguments.length) {return active_devs;}
		active_devs = val;
		resizeChart(chartdata)
		if (typeof updateData === 'function') updateData(chartdata);
		return chart;
	}

	chart.active_games = function(val) {
		if (!arguments.length) {return active_games;}
		active_games = val;
		resizeChart(chartdata)
		if (typeof updateData === 'function') updateData(chartdata);
		return chart;
	}


	chart.data = function(val) {
		if (!arguments.length) {return chartdata;}
        
        console.log(val);
		chartdata = val;
		games_set = new Set([...chartdata.map(function(d){	return d.source;}), ...chartdata.map(function(d){	return d.target;})]);
		devs_set = new Set(chartdata.map(function(d){return d.dev_id;}));
        devs_set = [...devs_set].map(function(d) { return { "id": d };});
        games_set = [...games_set];//.map(function(d) { return { "id": d };});

		if (typeof updateData === 'function') resizeChart(chartdata);
		return chart;
	}

    var chartElement = document.getElementById("mobygamesEgoChart");

	var resizeChart = function() {
    	chart_width = chartElement.clientWidth;
    	d3.select("#careerChart").attr("width", chart_width);
    	//updateData(chartdata);
    }

    window.addEventListener("resize", resizeChart);

	return chart;
};
