"use strict";

var svg = d3.select("svg#careerMultiline"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

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
		

var    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");

var xScale = d3.scaleTime()
    .range([0, width]);

var yScale = d3.scaleSqrt()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.year)})
    .y(function(d, i) { return yScale(d.count); });

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white");

var dropdown = d3.select('#dropdown');

d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
    this.parentNode.appendChild(this);
})};

d3.tsv("data/random_sampling.tsv", function(error, data1) {
d3.tsv("data/role_types.tsv", function(error, mapping) {  //role_id, role_type_id
    if (error) throw error;

    data1.forEach(function(d) {
        d.year = parseTime(d.year.substring(0,4));
        d.count = +d.count;
    });

    d3.select("select")
        .on("change", function() {
			var sect = document.getElementById("dropdown");
			var section = sect.options[sect.selectedIndex].value;
            if(section != "all") {
                var temp = filterData(data1, 'role_id', section, mapping);
                update(temp);
            }
            else
                update(filterOut(data1, 'role_id', "T12", mapping));
        })

    update(filterOut(data1, 'role_id', "T12", mapping));

    function update(data) {
        var devs = d3.nest()
            .key(function(d) { return d.dev_id })
            .sortValues(function(a, b) { return a.year - b.year})
            .entries(data);

        //console.log(xScale);
        //console.log(yScale);

        xScale.domain(d3.extent(data1, function(d) { return parseTime(new Date(d.year).getFullYear()); }));
        yScale.domain(d3.extent(data1, function(d) { return d.count }));

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(formatTime))
         .select(".domain")
            .remove();

        g.append("g")
            .call(d3.axisLeft(yScale))
         .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("number of games");

        var lines = g.selectAll(".line")
            .data(devs, function(d) {return d;});

        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values) })
            .attr("fill", "none")
            .attr("stroke", "slateblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .style("opacity", function(d) { return scale(d.values[d.values.length-1].count, yScale.domain()[0], yScale.domain()[1], 0, 1) })
            .on('mouseover', function(d) {
                d3.select(this)
                    .moveToFront()
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .style("opacity", 1);
                tooltip
                    .style("visibility", "visible")
                    .style("left", (xScale(d.values[d.values.length-1].year)) + "px")
                    .style("top", (yScale(d.values[d.values.length-1].count)) + "px")
                    .text(d.values[0].dev_name);
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .style("opacity", function(d) { return scale(d.values[d.values.length-1].count, y.domain()[0], y.domain()[1], 0, 1) })
                tooltip.style("visibility", "hidden")
            });

        lines.exit().remove();

        var dot = g.selectAll(".dot")
            .data(devs, function(d) {return d;});

        dot.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return xScale(d.values[d.values.length-1].year) })
            .attr("cy", function(d, i) { return yScale(d.values[d.values.length-1].count) })
            .attr("r", 2)
            .attr("stroke", "darkslateblue")
            .style("opacity", function(d) { return scale(d.values[d.values.length-1].count, yScale.domain()[0], yScale.domain()[1], .1, 1) })

        dot.exit().remove();
    };

    loadingText.text("");
});
});

function scale(x, omin, omax, nmin, nmax) {
    var orange = omax - omin;
    var nrange = nmax - nmin;
    return ((nrange * (x - omin)) / orange) + nmin;
}

function filterData(data, key, value, map) {
    var result = [];
    data.forEach(function(d, i, a) {
        if(map.find(function(x) {return d[key] == x.role_id}).role_type_id == value)
            result.push(d);
    });
    return result;
}

function filterOut(data, key, value, map) {
    var result = [];
    data.forEach(function(d, i, a) {
        if(map.find(function(x) {return d[key] == x.role_id}).role_type_id != value)
            result.push(d);
    });
    return result;
}
