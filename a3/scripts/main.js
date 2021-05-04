// global variables
var roster_list = []

Papa.parse('data/pokedex.csv', {
    download: true,
    header: true,
    delimiter: ',',
    dynamicTyping: true,
    complete: function(results) {
        var dash = init_viz(results)
    }
})

function init_viz(results) {

    //  https://www.topcoder.com/thrive/articles/interactive-html-tables-using-datatables

    var raw_data = results.data
    raw_data.pop() // there's a bad entry at the end
    const pokedex = raw_data.map(item => (({pokedex_number, name, species, type_1, type_2, status}) => ({pokedex_number, name, species, type_1, type_2, status}))(item))
    const stats   = raw_data.map(item => (({hp, speed, attack, defense, sp_defense, sp_attack}) => ({hp, speed, attack, defense, sp_defense, sp_attack}))(item))
    const table = init_table(pokedex);
    init_chart()

    return {
        raw_data,
        pokedex,
        stats,
        table
    }

}

function init_table(data) {

    // get column names
    headers = Object.keys(data[0])
    column_names = []
    for (var key in headers) {
        column_names.push({'data': headers[key] })
    }

    // initialize table
    var table = $('#pokemon_table')
        .DataTable({
            dom: 'Bfrti',
            pagination: true,
            select: {
                style: 'multi'
            },
            aaData: data,
            columns: column_names,
            buttons: ['selectNone'],

            initComplete: function () {
                this.api().columns([3, 4, 5]).every( function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo( $(column.header()) )
                        .on( 'change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
     
                            column
                                .search( val ? '^'+val+'$' : '', true, false )
                                .draw();
                        } );
     
                    column.data().unique().sort().each( function ( d, j ) {
                        select.append( '<option value="'+d+'">'+d+'</option>' )
                    } );
                } );
            }
        });
        
    // spit out data on select
    table.on( 'select', function(e, dt, type, index) {
        var selected = table.rows( { selected: true} )
        if (selected.count() <= 6 ) {
            roster_list.push(index[0])
        } else {
            dt.rows(index).deselect();
        }
        update_roster(data)
        // update_chart()
    });

    table.on( 'deselect', function (e, dt, type, indexes) {
        for (var i = 0; i < indexes.length; i++ ) {
            const idx = roster_list.indexOf(indexes[i]);
            if (idx > -1) {
                roster_list.splice(idx, 1);
            }
        }
        update_roster(data)
        // update_chart()
    });

    $(document).ready( function () {
        roster_list;
        table;
    })

    return table;
    
}

function update_roster(data) {
    var result = "";
    roster_list.forEach(function (item) {
        result += '<li>' + data[item].name + '</li>';
    })
    document.getElementById('roster').innerHTML = result;
}

function update_chart() {
    svg.append('circle')
        .attr('cx', 100)
        .attr('cy', 100)
        .attr('r', 50)

    d3.select('#chart')
        .append(() => svg.node());
}

function init_chart() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 40, left: 50},
        width = 520 - margin.left - margin.right,
        height = 520 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var Svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")



    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

    // Add X axis
    var x = d3.scaleLinear()
        .domain([4*0.95, 8*1.001])
        .range([ 0, width ])
    Svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
        .select(".domain").remove()

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-0.001, 9*1.01])
        .range([ height, 0])
        .nice()
    Svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))
        .select(".domain").remove()

    // Customization
    Svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

    // Add X axis label:
    Svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text("Sepal Length");

    // Y axis label:
    Svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Petal Length")

    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica" ])
        .range([ "#402D54", "#D18975", "#8FD175"])

    // Add dots
    Svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.Sepal_Length); } )
        .attr("cy", function (d) { return y(d.Petal_Length); } )
        .attr("r", 5)
        .style("fill", function (d) { return color(d.Species) } )

    })
}