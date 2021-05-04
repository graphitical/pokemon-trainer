Papa.parse('data/pokedex.csv', {
    download: true,
    header: true,
    delimiter: ',',
    dynamicTyping: true,
    complete: function(results) {
        var team = []
        var dash = init_viz(results)
        // console.log(results.errors)
    }
})

function init_viz(results) {

    //  https://www.topcoder.com/thrive/articles/interactive-html-tables-using-datatables

    var raw_data = results.data
    raw_data.pop() // there's a bad entry at the end
    // console.log(raw_data)
    const pokedex = raw_data.map(item => (({pokedex_number, name, species, type_1, type_2, status}) => ({pokedex_number, name, species, type_1, type_2, status}))(item))
    const stats   = raw_data.map(item => (({hp, speed, attack, defense, sp_defense, sp_attack}) => ({hp, speed, attack, defense, sp_defense, sp_attack}))(item))
    const table = init_table(pokedex);

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
            dom: 'Bfrtip',
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
        if (selected.count() > 6 ) {
            dt.rows(index).deselect();
        }
        // console.log(selected)
        team = selected;
    });

    return table;
    
}