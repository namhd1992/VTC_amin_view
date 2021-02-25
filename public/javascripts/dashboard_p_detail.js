var _current_page = 1;
_per_page = 100;
var search_value = "";
$(document).ready(function() {
    var initpage = function() {
        $(".loading_icon").show();
        if (getUrlParameter("id") != undefined) {
            event_id = getUrlParameter("id");
        }
        page_datatable = $('#page_datatable').DataTable({
            "ajax": {
                "url": base_request_url + "/admin/timelineReportGiftcode?giftcodeId=" + event_id,
                "type": "GET",
                "data": function(d) {
                    if (search_value != null && search_value != "") {
                        d.searchValue = search_value;
                    }
                    d.limit = _per_page;
                    d.offset = _per_page * (_current_page - 1);
                },
                "contentType": "application/json",
                "dataType": "json",
                "dataSrc": function(json) {
                    var i = 0;
                    $(".datatable_paging").html("");
                    if (json.totalRecords > _per_page) {
                        for (i = 1; i <= Math.ceil(json.totalRecords / _per_page); i++) {
                            if (i == _current_page) {
                                $(".datatable_paging").append("<span class='datatable_paging_number_active' page=" + i + ">" + i + "</span>");
                            } else {
                                if (i == 1 || i == Math.ceil(json.totalRecords / _per_page) || i == (_current_page - 1) || i == (_current_page - 2) || i == (_current_page + 2) || i == (_current_page + 1)) {
                                    if (i == 1 && _current_page > 4) {
                                        $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                        $($(".datatable_paging_number")[0]).after("<span class='paging_truncate'>...</span>");
                                    } else if (i == Math.ceil(json.totalRecords / _per_page) && _current_page < (Math.ceil(json.totalRecords / _per_page) - 3)) {
                                        $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                        $($(".datatable_paging_number")[$(".datatable_paging_number").length - 1]).before("<span class='paging_truncate'>...</span>");
                                    } else {
                                        $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                    }
                                }
                            }
                        }
                    } else {
                        $(".datatable_paging").html("<span class='datatable_paging_number_active' page=" + 1 + ">" + 1 + "</span>");
                    }
                    $(".datatable_paging_number").click(function(e) {
                        _current_page = parseInt($(e.target).attr("page"));
                        page_datatable.ajax.reload();
                    });
                    $(".loading_icon").hide();
                    if (json.dataArr != null) {
                        var categories = [];
                        var data_install = [];
                        var data_share = [];
                        var data_lost = [];
                        var data_nru = [];
                        var test_num = 100;
                        var format = getSetting(_setting_data, "date_format");
                        $(json.dataArr).each(function(key, item) {
                            var news_date = moment.unix(item.onDate / 1000).format("YYYY-MMMM-D");
                            categories.push(news_date);
                            data_install.push(item.numberInstall);
                            data_share.push(item.numberShareFacebook);
                            data_lost.push(item.numberGiftcodeLost);
                            data_nru.push(item.numberNRU);
                        });
                        categories = categories.reverse();
                        data_install = data_install.reverse();
                        data_share = data_share.reverse();
                        data_lost = data_lost.reverse();
                        data_nru = data_nru.reverse();
                        $('#lineChart1').highcharts({
                            chart: {
                                style: {
                                    fontFamily: 'Open Sans'
                                }
                            },
                            title: {
                                text: 'Giftcode',
                                x: -20 //center
                            },
                            subtitle: {
                                text: 'Event: ' + event_id,
                                x: -20
                            },
                            xAxis: {
                                categories: categories
                            },
                            yAxis: {
                                title: {
                                    text: ''
                                },
                                plotLines: [{
                                    value: 0,
                                    width: 1,
                                    color: '#808080'
                                }]
                            },
                            tooltip: {
                                valueSuffix: ''
                            },
                            credits: {
                                enabled: false
                            },
                            legend: {
                                layout: 'vertical',
                                align: 'right',
                                verticalAlign: 'middle',
                                borderWidth: 0
                            },
                            exporting: {
                                enabled: false
                            },
                            series: [{
                                name: 'Install',
                                data: data_install
                            }, {
                                name: 'Share Facebook',
                                data: data_share
                            }, {
                                name: 'Giftcode RNU',
                                data: data_nru
                            }, {
                                name: 'Giftcode Lost',
                                data: data_lost
                            }]
                        });
                        return json.dataArr;
                    } else {
                        return [];
                    }
                },
                "beforeSend": function(xhr) {
                    xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                },
                "error": function(xhr, error, thrown) {
                    if (JSON.parse(xhr.responseText).error == "invalid_token") {
                        localStorage.removeItem("user_data");
                        document.location.replace("login");
                    }
                },
            },
            "columns": [{
                    title: "Date",
                    data: null,
                    render: function(data, type, full, meta) {
                        var str_date = "";
                        var format = getSetting(_setting_data, "date_format");
                        str_date = moment.unix(full.onDate / 1000).format(format.value);
                        return str_date;
                    }
                },
                {
                    title: "Install",
                    data: "numberInstall"
                },
                {
                    title: "Share Facebook",
                    data: "numberShareFacebook"
                },
                {
                    title: "RNU",
                    data: "numberNRU"
                },
                {
                    title: "Giftcode Lost",
                    data: "numberGiftcodeLost"
                },
            ],
            "aoColumnDefs": [
                { "sWidth": "20%", 'aTargets': [0] },
                { "sWidth": "10%", 'aTargets': [1] },
                { "sWidth": "10%", 'aTargets': [2] },
                { "sWidth": "10%", 'aTargets': [3] },
                { "sWidth": "10%", 'aTargets': [4] },
            ],
            "autoWidth": false,
            "lengthChange": false,
            "info": false,
            "bSort": false,
            "bFilter": false,
            "bPaginate": false,
            "fnDrawCallback": function(oSettings) {
                $("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function() {
                    return this.nodeType != 1;
                }).replaceWith("");
            },
        });
    };
    $(".export_button").click(function() {
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/timelineReportGiftcode?giftcodeId=" + event_id,
            type: "GET",
            data: function(d) {
                d.limit = 100000;
                d.offset = 0;
                return d;
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                console.log(data);
                var column_title = [];
                var row_data = [];
                var filename = "";
                $.each(data.dataArr, function(key, item) {
                    var format = getSetting(_setting_data, "date_format");
                    str_date = moment.unix(item.onDate / 1000).format(format.value);
                    row_data.push({
                        "Date time": str_date,
                        "Install": item.numberInstall,
                        "Share FB": item.numberShareFacebook,
                        "Delivered": item.numberGiftcodeLost,
                        "NRU": item.numberNRU
                    });
                });
                exportFile(row_data);
                $(".loading_icon").hide();
            },
            error: function(error) {
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
                $(".loading_icon").hide();
            },
        });
    });
    initpage();

    function exportFile(data) {
        $("body").excelexportjs({
            datatype: 'json',
            dataset: data,
            columns: getColumns(data)
        });
    }
});