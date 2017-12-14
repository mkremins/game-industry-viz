"use strict";

var parseTime = d3.timeParse("%Y");

var chartEgo = function() {

	var file; // data file reference

	var width = 580;
	var height = 500;

    let chartdata = null;
    let date_table = null;
    let games_set = null;
    let devs_set = null;

	var margin = {
		top: 10,
		left: 60,
		right: 15,
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

    var startDate = parseTime("1973");
    var endDate = parseTime("2017");
    var viewStartDate = parseTime("1973");
    var viewEndDate = parseTime("1974");

/*	function makeYGridlines() {
        return d3.axisLeft(yScale).ticks((chart_use_aggregate ? 30 : 3));
    }
    */

	function chart(selection) {

	    //let use_aggregate_count = true;
	    //let display_circles = false;

		var dom = d3.select("body");
		var svg = dom.append("svg")
		.attr("class", "chart")
		.attr("id", "egoChart")
		.attr("height", height)
		.attr("width", width);

        
		xScaleDate
				.domain([startDate, endDate])
				.range([0 + margin.left, width - (margin.right)]);

		cScaleDate
				.domain([startDate, endDate])
				.range([0, 1000]);

		cScale.domain([0,1000]);

		yScale
				.domain([0,50])
				.range([height - margin.bottom, 0 + margin.top]);

		var chartArea = svg.append("g").attr("id","egoChartArea");

		// Add the X Axis
	    var xAxis = svg.append("g")
	    	.attr("class", "axis")
	    	.attr("stroke", "#fff")
	    	.attr("opacity", "0.6")
	    	.attr("transform", "translate(0," + ((height - margin.bottom)) + ")")
      		.call(d3.axisBottom(xScaleDate).ticks(12))
      		      		;
/*
		// Add the gridlines
        var gridlines = svg.append("g")
        	.attr("stroke", "#fff")
            .attr("class", "grid")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(makeYGridlines().tickSize(-(width - (margin.left + margin.right))).tickFormat(""));

  		// Add the Y Axis
  		var yAxis = svg.append("g")
  			.attr("stroke", "#fff")
	    	.attr("opacity", "0.6")
  			.attr("class", "axis")
  			.attr("transform", "translate(" + (margin.left) + ",0)")
			.call(d3.axisLeft(yScale));
*/
		var xAxisLabel = svg.append("text")
		.attr("class", "axis-label")
		.attr("transform", "translate(" + (width / 2) + "," + (height - margin.bottom + 38) + ")")
		.style("text-anchor", "middle")
		.text("Time");
/*
		var yAxisLabel = svg.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("y", 0)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Games Worked On");
*/
		var loadingText = svg.append("g")
		.attr("transform", "translate(" + (width  / 2) + "," + (height / 2) + ")" );
		loadingText
		.append("text")
		.attr("class", "loading-text")
		.text("Loading");
		loadingText
		.append("div")
		.attr("class", "loader")
		.attr("transform", "translate(" + (width  / 2) + "," + (height / 2) + ")" );
			

		//var getCareerKey = function(d) {
		//	return d[0].dev_id;
		//};

		updateWidth = function() {
			updateData(chartdata);

		}
		updateHeight = function() {
			updateData(chartdata);
		}

		//var sim = d3.forceSimulation()
		//.force("link", d3.forceLink().id(function (d) {return d.edge_id;}).distance(100).strength(1))
        //.force("charge", d3.forceManyBody())
        //.force("center", d3.forceCenter(width / 2, height / 2));;

        let link_base = svg.append("g")
			.attr("class", "links");

		let node_base = svg.append("g")
			.attr("class", "nodes");

		var simulate = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id;}).distance(100).iterations(4))
			.force("charge", d3.forceManyBody().strength(-10).distanceMax(35))
			.force("collide", d3.forceCollide(8).iterations(8))
			.force("center", d3.forceCenter(width / 2, height / 2))
			//.force("y", d3.forceY(0))
			;
		
		updateData = function(_inputData) {
			if(!chartdata) {
				console.log("No Data!\n");
				console.log(chartdata);
				return;
			}

			//console.log(chartdata);
			//console.log(games_set);



			var link = link_base
			.selectAll("line")
			.data(chartdata)
			.enter()
			.append("line")
			.attr("stroke","white")
			.attr("stroke-width","2");

			//console.log(games_set);
			//console.log(devs_set);

			var node = node_base
			.selectAll(".node")
			.data(games_set)
			.enter()
			.append("g")
			.attr("class",'node');

			node
			.append("circle")
			.attr("r", "5")
			.attr("fill", "red");

			node
			.append('title')
			.text(function(d) { return d.id});

			function ticked() {
				link
				.attr("x1", function(d) { return games_set.find(z => z.id == d.source.id).x; })
				.attr("y1", function(d) { return games_set.find(z => z.id == d.source.id).y; })
				.attr("x2", function(d) { return games_set.find(z => z.id == d.target.id).x; })
				.attr("y2", function(d) { return games_set.find(z => z.id == d.target.id).y; })
				;

			  	node
			  	.attr('transform', function(d) { return "translate(" + d.x +"," + d.y + ")";});
			}

			simulate.nodes(games_set).on("tick", ticked);
			simulate.force("link").links(chartdata);

			//let links = svg.selectAll(".link")
			//.data(...chartdata)
			//.enter()
			//.append("line")
			//.attr("class","link")
			//.attr("marker-end","url(#arrowhead)");

			//links.append("title")
			//.text(function(d) {return d.dev_id});

			//console.log([...devs_set]);

			//let nodes = svg.selectAll(".node")
			//.data(devs_set)
			//.enter()
			//.append('g')
			//.attr("class",'node')
			//.call(d3.drag()
			//.on('start', dragStart)
			//.on('drag', dragging)
			//)
			//;

			//nodes.append('circle')
			//.attr('r', 5)
			//.style('fill', "red");

			//nodes.append('title')
			//.text(function(d) { return d});




			//sim.nodes(nodes)
			//.on('tick', ticked);

			//console.log(chartdata);
			//console.log(devs_set);

			//sim.force("link").links(links);

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

    /*
	updateDateRangeStart = function(newCareerStartDate, newCareerRange) {
        let newCareerEndDate = parseInt(newCareerStartDate) + parseInt(newCareerRange);
        if(parseInt(newCareerEndDate) < (parseInt(newCareerStartDate) + 1)) {
            newCareerEndDate = parseInt(newCareerStartDate) + 1;
        }
		d3.select("#careerStartYear-value").text(newCareerStartDate);
		d3.select("#careerStartYear").property("value", newCareerStartDate);

        d3.select("#careerRange-value").text(newCareerRange);
		d3.select("#careerRange").property("value", newCareerRange);

		viewStartDate = parseTime(newCareerStartDate.toString());
		viewEndDate = parseTime((newCareerEndDate).toString()); 
		//resizeChart();
		updateData(chartdata);
    }

	d3.select("#careerStartYear").on("input", function() { 
		updateDateRangeStart(+document.getElementById("careerStartYear").value, +document.getElementById("careerRange").value)});

    d3.select("#careerRange").on("input", function() { 
		updateDateRangeStart(+document.getElementById("careerStartYear").value, +document.getElementById("careerRange").value)});

    let playAnimation = 0;
    */

    var chartElement = document.getElementById("mobygamesEgoChart");

	var resizeChart = function() {
    	width = chartElement.clientWidth;
    	d3.select("#careerChart").attr("width", width);
    	updateData(chartdata);
    }

    window.addEventListener("resize", resizeChart);

	return chart;
};
