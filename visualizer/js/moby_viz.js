"use strict";

var parseTime = d3.timeParse("%Y");

var chartLine = function() {

	var file; // data file reference

	var width = 580;
	var height = 500;
	let chartdata = [];
	let chartlines = [];
	var data;
    var previous_data = {};
	var margin = {
		top: 10,
		left: 70,
		right: 15,
		bottom: 55,
		axis_padding: 10
	};

	let chart_use_aggregate = true;
	let chart_display_circles = false;

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
	var yScale = d3.scaleSqrt();
	var cScale = d3.scaleSequential(d3.interpolateRainbow);
	var cScaleDate = d3.scaleTime();

    var startDate = parseTime("1973");
    var endDate = parseTime("2017");
    var viewStartDate = parseTime("1973");
    var viewEndDate = parseTime("1974");


	function makeYGridlines() {
        return d3.axisLeft(yScale).ticks((chart_use_aggregate ? 30 : 20));
    }

	function chart(selection) {

	    //let use_aggregate_count = true;
	    //let display_circles = false;

		var dom = d3.select("body");
		var svg = dom.append("svg")
		.attr("class", "chart centered")
		.attr("id", "careerChart")
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
				.domain([1,50])
				.range([height - margin.bottom, 0 + margin.top]);

		var chartArea = svg.append("g").attr("id","chartArea");

		// Add the X Axis
	    var xAxis = svg.append("g")
	    	.attr("class", "axis")
	    	.attr("stroke", "#fff")
	    	.attr("opacity", "0.6")
	    	.attr("transform", "translate(0," + ((height - margin.bottom)) + ")")
      		.call(d3.axisBottom(xScaleDate).ticks(12))
      		      		;

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

		var xAxisLabel = svg.append("text")
		.attr("class", "axis-label")
		.attr("transform", "translate(" + (width / 2) + "," + (height - margin.bottom + 48) + ")")
		.style("text-anchor", "middle")
		.text("Career Start Date");

		var yAxisLabel = svg.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("y", 0)
		.attr("x", 20 + (0 - (height / 2)))
		.attr("dy", "1.3em")
		.style("text-anchor", "middle")
		.text("Games Worked On");

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
			

		var getCareerKey = function(d) {
			return d[0].dev_id;
		};

		updateWidth = function() {
			updateData(chartdata);

		}
		updateHeight = function() {
			updateData(chartdata);
		}
		

		updateData = function(_inputData) {
			if(!chartdata) {
				console.log("No Data!\n");
				console.log(chartdata);
				return;
			}

			//console.log(chartdata)

			//let use_aggregate_count = chartdata.use_aggregate_count;

			xScaleDate
				.domain([startDate, endDate])
				.range([0 + margin.left, width - margin.right]);

			yScale
				.domain([(chart_use_aggregate ? 1 : 1), (chart_use_aggregate ? 500 : 50) ])
				.range([ height - margin.bottom, 0 + margin.top]);

			xAxis
			.transition()
			.duration(transition_speed)
			.call(d3.axisBottom(xScaleDate).ticks(12));
			gridlines
			.transition()
			.duration(transition_speed)
			.call(makeYGridlines().tickSize(-(width - (margin.left + margin.right ))).tickFormat(""));
			yAxis
			.transition()
			.duration(transition_speed)
			.call(d3.axisLeft(yScale));

			yAxisLabel
			.transition()
			.duration(transition_speed)
			;

			xAxisLabel
			.transition()
			.duration(transition_speed)
			.attr("transform", "translate(" + (width / 2) + "," + (height - margin.bottom + 48) + ")");


			let chart_rows = chartArea.selectAll("career_path");//, getCareerKey);

			let careers = chartArea.selectAll('.careers').data(chartdata, function(d) {
				return "Dev" + d.dev_id;
			});
				
			careers.exit().remove();

			let careersEnter = careers.enter()
				.append('g')
				.attr('id', function(d) { return 'Dev' + d.dev_id; })
				.attr("class", 'careers');

			/*

			chartArea.selectAll('.careers')
			.data(chartdata, function(d) {
				return "Dev" + d.dev_id;
			})
			.selectAll('.career_circles')
			.data(function(d) { return d.games; }, function(d) { return d.game_id; })
			.attr('cy', function(d) { return yScale(chart_use_aggregate ? d.count : d.count_per_year); })
			.style('opacity', chart_display_circles ? 1:0 )
			;

			
			careersEnter.selectAll('.career_circles')
				.data(function(d) { return d.games; }, function(d) { return d.game_id; })
				.enter()
				.append('circle')
				.attr("class", 'career_circles')
				.attr('cx', function(d) { return xScaleDate(d.release_date); })
				.attr('cy', function(d) { return yScale(chart_use_aggregate ? d.count : d.count_per_year); })
				.attr('r', 5)
				.style('fill', function(d) { return cScale(cScaleDate(d.career_end_date))})
				.style('opacity', 0.0)
				.append("title").text(function(d) { return "<b>" + d.game_id + "</b>\n" + d.release_date + ""; })
				;

			*/
			

			chartArea.selectAll('.careers')
			.data(chartdata, function(d) {
				return "Dev" + d.dev_id;
			})
			.selectAll('.career_path')
			.transition()
			.duration(transition_speed)
			.attr('d', d3.line().curve(d3.curveStep)//.curve(chart_use_aggregate ? d3.curveBefore : d3.curveStep)
					.x(function(nested_data) {
						return xScaleDate(nested_data.release_date);
					})
					.y(function(nested_data) {
						return yScale(chart_use_aggregate ? nested_data.count : nested_data.count_per_year);
					})
				)
			;

			careersEnter.selectAll('.career_path')
				.data(function(d) { return [d.games]; })
				.enter()
				.append('path')
				.attr("class", 'career_path')
				//.attr('id', function(d) { console.log(d); return 'Career_' + d.dev_id; })
				.attr("stroke", function(d) {
					let rdate = d[d.length - 1].release_date;
					return cScale(cScaleDate(rdate)); 
				})
				//.style('opacity', 0.3)
				.attr('d', d3.line().curve(d3.curveStep)
					.x(function(nested_data) {
						return xScaleDate(nested_data.release_date);
					})
					.y(function(nested_data) {
						//console.log(chartdata);
						//console.log(chart_use_aggregate);
						return yScale(chart_use_aggregate ? nested_data.count : nested_data.count_per_year);
					})
				)
				.append("title").text(function(d) { return d[d.length - 1].dev_name; })
				;

			chartArea.selectAll('.careers').data(chartdata.filter(function(d) { return !((d.career_start_date >= viewStartDate) && (d.career_start_date < viewEndDate));}), function(d) {
				return "Dev" + d.dev_id;
			})
			//.transition().duration(1200)
			//.style('opacity', 0.0)
			//.transition().duration(140)
			.style('visibility','hidden')
			;

			chartArea.selectAll('.careers').data(chartdata.filter(function(d) { return ((d.career_start_date >= viewStartDate) && (d.career_start_date < viewEndDate));}), function(d) {
				return "Dev" + d.dev_id;
			})
			.style('visibility','visible')
			//.transition().duration(800)
			//.style('opacity', 0.9)
			;


			chart_rows.exit().remove();

			loadingText.text("");
		}
	}

	chart.data = function(val) {
		if (!arguments.length) {return chartdata;}
        
        let file_id = XXH.h32(0x015).update(JSON.stringify(val)).digest().toString(16);
		let newval = Object.keys(val).map(function(k) {
			let data_career = val[k];
            
			let new_data_career = data_career.map(function(d) {
						return {
							game_id: d.game_id,
							platform_id: d.platform_id,
							title: d.title,
							dev_name: d.dev_name,
							role_id: d.role_id,
							role_name: d.role_name,
							platform_name: d.platform_name,
							release_date: parseTime(d.release_date.toString().slice(0,4)),
							dev_id: d.dev_id,
							count: +d.count,
							count_per_year: +d.count_per_year,
                            offset_noise_seed: XXH.h32(d.dev_id,0).toNumber(),
                            offset_noise_rng: tooloud.Perlin.create(XXH.h32(d.dev_id,0).toNumber()),  
                        };
            });

			let refactored_new_data_career = {
				games: new_data_career.map(function (d) { return {game_id: d.game_id, role_id: d.role_id, release_date: d.release_date, count: d.count, count_per_year: d.count_per_year, career_start_date: new_data_career[0].release_date, game_name: d.game_name, dev_name: d.dev_name, career_end_date: new_data_career[new_data_career.length - 1].release_date}; }),
				dev_name: new_data_career[new_data_career.length - 1].dev_name,
				dev_start_role: new_data_career[0].role_id,
				dev_end_role: new_data_career[new_data_career.length - 1].role_id,
				dev_id: new_data_career[0].dev_id,
				career_start_date: new_data_career[0].release_date,
				career_end_date: new_data_career[new_data_career.length - 1].release_date

			};
			return refactored_new_data_career;
		});
		chartdata = newval;

		if (typeof updateData === 'function') resizeChart(chartdata);
		return chart;
	}

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

    var chartElement = document.getElementById("mobygamesChart");

	var resizeChart = function() {
    	width = chartElement.clientWidth;
    	d3.select("#careerChart").attr("width", width);
    	updateData(chartdata);
    }

    window.addEventListener("resize", resizeChart);


    d3.select("#careerPlayButton").on("click", function() 
    {
        console.log(+this.value);
        if(0 == +this.value) {
            document.getElementById("careerPlayButton").innerHTML = "<b>Playing</b>";
            document.getElementById("careerPlayButton").classList.add("button_activated");
            this.value = 1;
        } else {
            document.getElementById("careerPlayButton").innerHTML = "<b>Stopped</b>";
            document.getElementById("careerPlayButton").classList.remove("button_activated")
            this.value = 0;
        }
        playAnimation = +this.value;
    });

    d3.select("#careerShowGamesButton").on("click", function() {
    	console.log(+this.value);
    	if(0 == +this.value) {
            document.getElementById("careerShowGamesButton").innerHTML = "Games Visible";
            document.getElementById("careerShowGamesButton").classList.add("button_activated");
            this.value = 1;
        } else {
            document.getElementById("careerShowGamesButton").innerHTML = "Games Hidden";
            document.getElementById("careerShowGamesButton").classList.remove("button_activated")
            this.value = 0;
        }
        chart_display_circles = (1 == +this.value);
        updateData(chartdata);
    });

    d3.select("#careerAggregateButton").on("click", function() {
    	console.log(+this.value);
    	if(0 == +this.value) {
            document.getElementById("careerAggregateButton").innerHTML = "Showing Annual Count";
            document.getElementById("careerAggregateButton").classList.add("button_activated");
            this.value = 1;
        } else {
            document.getElementById("careerAggregateButton").innerHTML = "Showing Aggregate Count";
            document.getElementById("careerAggregateButton").classList.remove("button_activated")
            this.value = 0;
        }
        chart_use_aggregate = (0 == +this.value);
        updateData(chartdata);
    });
	
	d3.interval(function() {

        if(0 == playAnimation) {
           return;
        }

		var newCareerStartDate = parseInt(document.getElementById("careerStartYear").value, 10) + 1;
		newCareerStartDate = (newCareerStartDate > 2017) ? 1973 : newCareerStartDate;
		document.getElementById("careerStartYear").value = newCareerStartDate;
        let newCareerRange = parseInt( +document.getElementById("careerRange").value);

		updateDateRangeStart(newCareerStartDate, newCareerRange);
	}, play_speed);

	chart.setStartDate = function() {
		var newCareerStartDate = "1978";//parseTime("1978");
		var newCareerRange = 1;
		updateDateRangeStart(newCareerStartDate, newCareerRange);
	}

	return chart;
};
