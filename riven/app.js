const urls = [
    "http://n9e5v4d8.ssl.hwcdn.net/repos/weeklyRivensPC.json",
    "http://n9e5v4d8.ssl.hwcdn.net/repos/weeklyRivensPS4.json",
    "http://n9e5v4d8.ssl.hwcdn.net/repos/weeklyRivensXB1.json",
    "http://n9e5v4d8.ssl.hwcdn.net/repos/weeklyRivensSWI.json"
];
var redownload = true;

var rivenData = {};

function populateTable()
{
    let c = [];
    let filterName = $("#filter-name").val();
    let filterClass = $("#filter-class").val();
    let rolledStr = $("#filter-rolled").val();
    let includeRolled = rolledStr == "all" || rolledStr == "yes";
    let includeUnrolled = rolledStr == "all" || rolledStr == "no";
    
    for(let row of rivenData)
    {
        if((filterName == "all" || filterName == row.compatibility) && (filterClass == "all" || filterClass == row.itemType) && ((includeRolled && row.rerolled) || (includeUnrolled && !row.rerolled)))
        {
            c.push('<tr><td>' + row.itemType + '</td><td>' + row.compatibility + '</td><td>' + row.rerolled + '</td><td>' + row.min + '</td><td>' + row.max + '</td><td>' + row.avg.toFixed(2) + '</td><td>' + row.stddev.toFixed(2) + '</td><td>' + row.pop + '</td></tr>');
        }
    }
    $(".data-counter").text("Showing " + c.length + " rows");
    $("#data-table").html(c.join(""));
}

function filterData()
{
    if(redownload)
    {
        loadData(0);
    }
    else
    {
        populateTable();
    }
}

function loadData()
{
    let platform = 0;
    if($("#filter-xb1").prop("checked")) platform = 1;
    if($("#filter-ps4").prop("checked")) platform = 2;
    if($("#filter-switch").prop("checked")) platform = 3;
    
    let url = "https://whatever-origin.herokuapp.com/get?callback=?&url=" + encodeURIComponent(urls[platform]);
    
    $.ajax(
        {
            url: url,
            dataType: "json",
            mimeType: "application/json",
            cache: false,
            success: function(data)
            {
                rivenData = data.contents;
                redownload = false;
                
                let names = [];
                let nameFilterOptions = ['<option class="filter-name-option" value="all">(all weapons)</option>'];
                let classes = [];
                let classFilterOptions = ['<option class="filter-class-option" value="all">(all classes)</option>'];
                for(let row of rivenData)
                {
                    if(row.compatibility === null)
                    {
                        row.compatibility = "(veiled)";
                    }
                    
                    if(!names.includes(row.compatibility))
                    {
                        names.push(row.compatibility);
                        nameFilterOptions.push('<option class="filter-name-option" value="' + row.compatibility + '">' + row.compatibility + '</option>');
                    }
                    
                    if(!classes.includes(row.itemType))
                    {
                        classes.push(row.itemType);
                        classFilterOptions.push('<option class="filter-class-option" value="' + row.itemType + '">' + row.itemType + '</option>');
                    }
                }
                $("#filter-name").html(nameFilterOptions.join(""));
                $("#filter-class").html(classFilterOptions.join(""));
                
                populateTable();
            }
        });
    }
    
    $(document).ready(function()
    {
        filterData();
        
        $(".filter-submit").click(function(event)
        {
            filterData();
        });
        
        $(".filter-platform").click(function(event)
        {
            redownload = true;
            $("#filter-rolled").val("all");
            filterData();
        });
        
        $(".order-by-column").click(function(event)
        {
            let reverse = event.target.value == "asc";
            
            if(event.target.id == "order-by-class")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.itemType.localeCompare(a.itemType)) : (a.itemType.localeCompare(b.itemType));
                });
            }
            else if(event.target.id == "order-by-name")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.compatibility.localeCompare(a.compatibility)) : (a.compatibility.localeCompare(b.compatibility));
                });
            }
            else if(event.target.id == "order-by-rolled")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? ((a.rerolled === b.rerolled) ? 0 : b.rerolled ? -1 : 1) : ((a.rerolled === b.rerolled) ? 0 : a.rerolled ? -1 : 1);
                });
            }
            else if(event.target.id == "order-by-min")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.min - a.min) : (a.min - b.min);
                });
            }
            else if(event.target.id == "order-by-max")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.max - a.max) : (a.max - b.max);
                });
            }
            else if(event.target.id == "order-by-mean")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.avg - a.avg) : (a.avg - b.avg);
                });
            }
            else if(event.target.id == "order-by-sigma")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.stddev - a.stddev) : (a.stddev - b.stddev);
                });
            }
            else if(event.target.id == "order-by-pop")
            {
                rivenData.sort(function(a, b)
                {
                    return reverse ? (b.pop - a.pop) : (a.pop - b.pop);
                });
            }

            $(".order-by-column").removeClass("order-by order-by-asc order-by-desc");
            $(".order-by-column").val("");
            $(event.target).addClass("order-by");
            $(event.target).addClass(reverse ? "order-by-desc" : "order-by-asc");
            $(event.target).val(reverse ? "desc" : "asc");
            filterData();
        });
    });